import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../hooks/useRedux";
import { useDebounce } from "../hooks/useDebounce";
import { setActiveView, addToast } from "../store/slices/uiSlice";
import { beginEditReport } from "../store/slices/formSlice";
import { fetchReports, deleteReportThunk, fetchReportSummary } from "../store/slices/reportSlice";
import { prefillFromReport } from "../utils";
import { downloadCertificate } from "../services/download";
import { patientApi } from "../services/api";
import { Pagination } from "../components/ui/Pagination";
import { Topbar } from "../components/layout/Topbar";
import { Button } from "../components/ui/Button";
import { Avatar } from "../components/ui/Avatar";
import { Badge } from "../components/ui/Badge";
import type { Patient, Report, ReportStatus } from "../types";

const STATUS_FILTERS: Array<ReportStatus | "all"> = ["all", "draft", "submitted", "certified"];
const SORTS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
];

export const ReportsPage = () => {
  const dispatch   = useAppDispatch();
  const navigate   = useNavigate();
  const reports    = useAppSelector((s) => s.reports.list);
  const pagination = useAppSelector((s) => s.reports.pagination);
  const loading    = useAppSelector((s) => s.reports.loading);
  const user       = useAppSelector((s) => s.auth.user);
  const isAdmin    = user?.role === "admin";

  const [status, setStatus] = useState<ReportStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [sort,   setSort]   = useState("newest");
  const [from,   setFrom]   = useState("");
  const [to,     setTo]     = useState("");
  const [page,   setPage]   = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(search, 350);

  useEffect(() => { setPage(1); }, [debouncedSearch, sort, status, from, to]);

  const params = useMemo(
    () => ({ search: debouncedSearch, sort, status, from, to, page, limit: 20 }),
    [debouncedSearch, sort, status, from, to, page]
  );

  useEffect(() => { dispatch(fetchReports(params)); }, [dispatch, params]);

  const [deletingId,   setDeletingId]   = useState<string | null>(null);
  const [certifyingId, setCertifyingId] = useState<string | null>(null);

  const handleEdit = async (report: Report) => {
    // Fetch the full patient so the wizard prefills patient details too
    let patient: Patient | undefined;
    const res = await patientApi.get(report.patientId) as { success: boolean; data?: Patient };
    if (res.success) patient = res.data;
    dispatch(beginEditReport({ reportId: report.reportId, data: prefillFromReport(report, patient) }));
    dispatch(setActiveView("new-report"));
    navigate("/new-report");
  };

  const handleCertificate = async (report: Report) => {
    setCertifyingId(report.reportId);
    const result = await downloadCertificate(report.reportId);
    dispatch(addToast({ type: result.ok ? "success" : "error", message: result.message }));
    setCertifyingId(null);
  };

  const handleDelete = async (report: Report) => {
    if (!window.confirm(`Delete report ${report.reportId}? This cannot be undone.`)) return;
    setDeletingId(report.reportId);
    const result = await dispatch(deleteReportThunk(report.reportId));
    if (deleteReportThunk.rejected.match(result)) {
      dispatch(addToast({ type: "error", message: `Delete failed: ${result.payload}` }));
    } else {
      dispatch(addToast({ type: "success", message: `Report ${report.reportId} deleted.` }));
      dispatch(fetchReports(params));
      dispatch(fetchReportSummary());
    }
    setDeletingId(null);
  };

  const activeFilterCount = (from ? 1 : 0) + (to ? 1 : 0);

  return (
    <div className="flex flex-col min-h-full">
      <Topbar
        icon="ti-files"
        title="Reports"
        subtitle={pagination ? `${pagination.total} total` : "Loading…"}
        actions={
          <Button variant="primary" icon="ti-plus" size="sm"
            onClick={() => { dispatch(setActiveView("new-report")); navigate("/new-report"); }}>
            <span className="hidden sm:inline">New</span>
          </Button>
        }
      />

      <div className="flex-1 p-4 lg:p-6 flex flex-col gap-3 max-w-3xl mx-auto w-full lg:max-w-none">

        {/* Search + sort */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <i className="ti ti-search absolute left-3.5 top-1/2 -translate-y-1/2
                           text-gray-400 text-base pointer-events-none" aria-hidden="true" />
            <input type="search" placeholder="Search by name, employee ID or report ID…"
              value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value)}
            className="!w-auto flex-shrink-0" aria-label="Sort reports">
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
              Filed from
              <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="!min-h-0 py-2" />
            </label>
            <label className="flex flex-col gap-1 text-xs text-gray-500">
              Filed to
              <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="!min-h-0 py-2" />
            </label>
            {activeFilterCount > 0 && (
              <button onClick={() => { setFrom(""); setTo(""); }}
                className="text-xs text-brand-600 font-medium py-2.5">Clear dates</button>
            )}
          </div>
        )}

        {/* Status filter */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
          {STATUS_FILTERS.map((f) => (
            <button key={f}
              onClick={() => setStatus(f)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium
                border whitespace-nowrap transition-colors flex-shrink-0
                ${status === f
                  ? "bg-brand-600 border-brand-600 text-white"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
              {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {loading && reports.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3 text-gray-400">
            <i className="ti ti-loader-2 animate-spin text-2xl" aria-hidden="true" />
            <p className="text-sm">Loading reports…</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center text-center py-16 gap-3">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
              <i className="ti ti-file-off text-2xl text-gray-300" aria-hidden="true" />
            </div>
            <p className="font-medium text-gray-700">No reports found</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              {reports.map((report) => {
                const name = report.patientName ?? "Unknown";
                return (
                  <div key={report.reportId}
                    className="flex items-center gap-3 p-3.5 bg-white border border-gray-100
                               rounded-2xl active:scale-[.99] transition-transform">
                    <Avatar name={name} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {report.reportId} · {report.date}
                      </div>
                    </div>
                    <Badge variant={report.status} />
                    <button
                      onClick={() => handleCertificate(report)}
                      disabled={certifyingId === report.reportId}
                      className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center
                                 text-gray-500 hover:bg-emerald-50 hover:text-emerald-600 transition-colors
                                 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label={`Download certificate for ${report.reportId}`}
                      title="Download certificate (PDF)">
                      <i className={`ti text-lg ${
                        certifyingId === report.reportId ? "ti-loader-2 animate-spin" : "ti-certificate"
                      }`} aria-hidden="true" />
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => handleEdit(report)}
                        className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center
                                   text-gray-500 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                        aria-label={`Edit report ${report.reportId}`}
                        title="Edit report">
                        <i className="ti ti-edit text-lg" aria-hidden="true" />
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(report)}
                        disabled={deletingId === report.reportId}
                        className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center
                                   text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors
                                   disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label={`Delete report ${report.reportId}`}
                        title="Delete report">
                        <i className={`ti text-lg ${
                          deletingId === report.reportId ? "ti-loader-2 animate-spin" : "ti-trash"
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
    </div>
  );
};
