import { useEffect, useMemo, useState } from "react";
import type { FC } from "react";
import { useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../hooks/useRedux";
import { useDebounce } from "../hooks/useDebounce";
import { fetchPatients, deletePatientThunk } from "../store/slices/patientSlice";
import { fetchReportSummary } from "../store/slices/reportSlice";
import { patchForm, resetForm } from "../store/slices/formSlice";
import { setActiveView, addToast } from "../store/slices/uiSlice";
import { prefillFromPatient } from "../utils";
import { downloadPatientExcel } from "../services/download";
import { PatientEditModal } from "../components/patients/PatientEditModal";
import { Pagination } from "../components/ui/Pagination";
import { Topbar } from "../components/layout/Topbar";
import { Button } from "../components/ui/Button";
import { Avatar } from "../components/ui/Avatar";
import type { Patient } from "../types";

const SORTS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "name",   label: "Name (A–Z)" },
  { value: "recent", label: "Recent report" },
];

const fmtDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-GB") : "—";

export const PatientsPage: FC = () => {
  const dispatch   = useAppDispatch();
  const navigate   = useNavigate();
  const patients   = useAppSelector((s) => s.patients.list);
  const pagination = useAppSelector((s) => s.patients.pagination);
  const loading    = useAppSelector((s) => s.patients.loading);
  const user       = useAppSelector((s) => s.auth.user);
  const isAdmin    = user?.role === "admin";

  // Query state
  const [search, setSearch] = useState("");
  const [sort,   setSort]   = useState("newest");
  const [from,   setFrom]   = useState("");
  const [to,     setTo]     = useState("");
  const [page,   setPage]   = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(search, 350);

  // Reset to page 1 whenever a filter changes
  useEffect(() => { setPage(1); }, [debouncedSearch, sort, from, to]);

  const params = useMemo(
    () => ({ search: debouncedSearch, sort, from, to, page, limit: 20 }),
    [debouncedSearch, sort, from, to, page]
  );

  useEffect(() => { dispatch(fetchPatients(params)); }, [dispatch, params]);

  // UI state
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [deletingId,  setDeletingId]  = useState<string | null>(null);
  const [editing,     setEditing]     = useState<Patient | null>(null);

  const handleNewReport = (patient: Patient) => {
    dispatch(patchForm(prefillFromPatient(patient)));
    dispatch(setActiveView("new-report"));
    navigate("/new-report");
  };

  const handleAddPatient = () => {
    dispatch(resetForm());
    dispatch(setActiveView("new-report"));
    navigate("/new-report");
  };

  const handleExport = async (patient: Patient, reportCount: number) => {
    if (reportCount === 0) {
      dispatch(addToast({ type: "info", message: `${patient.name} has no reports to export yet.` }));
      return;
    }
    setExportingId(patient.patientId);
    const result = await downloadPatientExcel(patient.patientId, patient.name);
    dispatch(addToast({ type: result.ok ? "success" : "error", message: result.message }));
    setExportingId(null);
  };

  const handleDelete = async (patient: Patient, reportCount: number) => {
    const warning = reportCount > 0
      ? `Delete ${patient.name} AND their ${reportCount} report${reportCount !== 1 ? "s" : ""}? This cannot be undone.`
      : `Delete ${patient.name}? This cannot be undone.`;
    if (!window.confirm(warning)) return;

    setDeletingId(patient.patientId);
    const result = await dispatch(deletePatientThunk(patient.patientId));
    setDeletingId(null);

    if (deletePatientThunk.rejected.match(result)) {
      dispatch(addToast({ type: "error", message: `Delete failed: ${result.payload}` }));
      return;
    }
    dispatch(addToast({ type: "success", message: `${patient.name} and their reports deleted.` }));
    dispatch(fetchPatients(params));      // refresh current page
    dispatch(fetchReportSummary());       // keep dashboard counts in sync
  };

  const activeFilterCount = (from ? 1 : 0) + (to ? 1 : 0);

  return (
    <div className="flex flex-col min-h-full">
      <Topbar
        icon="ti-users"
        title="Patients"
        subtitle={pagination ? `${pagination.total} registered` : "Loading…"}
        actions={
          <Button variant="primary" icon="ti-user-plus" size="sm" onClick={handleAddPatient}>
            <span className="hidden sm:inline">Add patient</span>
          </Button>
        }
      />

      <div className="flex-1 p-4 lg:p-6 flex flex-col gap-3 max-w-3xl mx-auto w-full lg:max-w-none">

        {/* Search + sort */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <i className="ti ti-search absolute left-3.5 top-1/2 -translate-y-1/2
                           text-gray-400 text-base pointer-events-none" aria-hidden="true" />
            <input
              type="search"
              placeholder="Search name, employee ID or company…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4"
              aria-label="Search patients"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="!w-auto flex-shrink-0"
            aria-label="Sort patients"
          >
            {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex-shrink-0 px-3 rounded-xl border flex items-center gap-1.5 text-sm
              ${activeFilterCount > 0 || showFilters
                ? "bg-brand-50 border-brand-200 text-brand-700"
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}
            aria-label="Toggle date filters"
          >
            <i className="ti ti-calendar-event text-base" aria-hidden="true" />
            {activeFilterCount > 0 && <span className="text-xs font-medium">{activeFilterCount}</span>}
          </button>
        </div>

        {/* Date-range filter */}
        {showFilters && (
          <div className="flex flex-wrap items-end gap-3 p-3 bg-white border border-gray-100 rounded-2xl">
            <label className="flex flex-col gap-1 text-xs text-gray-500">
              Registered from
              <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="!min-h-0 py-2" />
            </label>
            <label className="flex flex-col gap-1 text-xs text-gray-500">
              Registered to
              <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="!min-h-0 py-2" />
            </label>
            {activeFilterCount > 0 && (
              <button
                onClick={() => { setFrom(""); setTo(""); }}
                className="text-xs text-brand-600 font-medium py-2.5"
              >
                Clear dates
              </button>
            )}
          </div>
        )}

        {loading && patients.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3 text-gray-400">
            <i className="ti ti-loader-2 animate-spin text-2xl" aria-hidden="true" />
            <p className="text-sm">Loading patients…</p>
          </div>
        ) : patients.length === 0 ? (
          <div className="flex flex-col items-center text-center py-16 gap-3">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
              <i className="ti ti-users-off text-2xl text-gray-300" aria-hidden="true" />
            </div>
            <div>
              <p className="font-medium text-gray-700">No patients found</p>
              <p className="text-sm text-gray-400 mt-1">
                {debouncedSearch || activeFilterCount ? "Try a different search or filter" : "Add your first patient"}
              </p>
            </div>
            {!debouncedSearch && !activeFilterCount && (
              <Button variant="primary" icon="ti-user-plus" onClick={handleAddPatient}>
                Add first patient
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              {patients.map((patient) => {
                const reportCount = patient.reportCount ?? 0;
                return (
                  <div key={patient.patientId}
                    className="flex items-center gap-3 p-3.5 bg-white border border-gray-100
                               rounded-2xl active:scale-[.99] transition-transform">
                    <Avatar name={patient.name} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {patient.name}
                        </span>
                        <span className="text-[10px] text-gray-300 font-mono hidden sm:inline">
                          {patient.patientId}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5 truncate">
                        {patient.empId} · {patient.company}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] text-gray-400">
                          {reportCount} report{reportCount !== 1 ? "s" : ""}
                        </span>
                        {patient.lastReportAt && (
                          <>
                            <span className="text-gray-200">·</span>
                            <span className="text-[11px] text-gray-400">
                              Last: {fmtDate(patient.lastReportAt)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {isAdmin && (
                      <button
                        onClick={() => setEditing(patient)}
                        className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center
                                   text-gray-500 flex-shrink-0 active:scale-95 transition-transform
                                   hover:bg-brand-50 hover:text-brand-600"
                        aria-label={`Edit ${patient.name}`}
                        title="Edit patient"
                      >
                        <i className="ti ti-edit text-lg" aria-hidden="true" />
                      </button>
                    )}
                    <button
                      onClick={() => handleExport(patient, reportCount)}
                      disabled={exportingId === patient.patientId}
                      className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center
                                 text-gray-500 flex-shrink-0 active:scale-95 transition-transform
                                 hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-50
                                 disabled:cursor-not-allowed"
                      aria-label={`Download Excel for ${patient.name}`}
                      title="Download Excel (all reports)"
                    >
                      <i className={`ti text-lg ${
                        exportingId === patient.patientId ? "ti-loader-2 animate-spin" : "ti-file-spreadsheet"
                      }`} aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => handleNewReport(patient)}
                      className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center
                                 text-brand-600 flex-shrink-0 active:scale-95 transition-transform"
                      aria-label={`New report for ${patient.name}`}
                      title="New report"
                    >
                      <i className="ti ti-file-plus text-lg" aria-hidden="true" />
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(patient, reportCount)}
                        disabled={deletingId === patient.patientId}
                        className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center
                                   text-gray-500 flex-shrink-0 active:scale-95 transition-transform
                                   hover:bg-red-50 hover:text-red-600 disabled:opacity-50
                                   disabled:cursor-not-allowed"
                        aria-label={`Delete ${patient.name}`}
                        title="Delete patient"
                      >
                        <i className={`ti text-lg ${
                          deletingId === patient.patientId ? "ti-loader-2 animate-spin" : "ti-trash"
                        }`} aria-hidden="true" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <Pagination meta={pagination} loading={loading} onPage={setPage} />
          </>
        )}
      </div>

      {editing && (
        <PatientEditModal patient={editing} onClose={() => { setEditing(null); dispatch(fetchPatients(params)); }} />
      )}
    </div>
  );
};
