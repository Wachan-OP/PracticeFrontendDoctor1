import { useEffect, useState } from "react";
import type { FC } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import { useDebounce } from "../../hooks/useDebounce";
import { patchForm, updateField } from "../../store/slices/formSlice";
import { prefillFromPatient } from "../../utils";
import { patientApi } from "../../services/api";
import { BLOOD_GROUPS, GENDER_OPTIONS } from "../../constants";
import { SectionCard } from "../ui/SectionCard";
import { FormField } from "../ui/FormField";
import { Button } from "../ui/Button";
import { Avatar } from "../ui/Avatar";
import { Badge } from "../ui/Badge";
import type { Patient, ReportFormState } from "../../types";

export const StepPatient: FC = () => {
  const dispatch = useAppDispatch();
  const data     = useAppSelector((s) => s.form.data);

  const [query, setQuery]       = useState("");
  const [results, setResults]   = useState<Patient[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selected, setSelected] = useState<Patient | null>(null);

  const debouncedQuery = useDebounce(query, 300);

  // Server-side search for existing patients (works at any scale)
  useEffect(() => {
    if (data.patientMode !== "existing" || debouncedQuery.trim().length === 0) {
      setResults([]);
      return;
    }
    let active = true;
    setSearching(true);
    patientApi.list({ search: debouncedQuery.trim(), limit: 8 })
      .then((res) => {
        if (!active) return;
        const r = res as { success: boolean; data?: Patient[] };
        setResults(r.success ? (r.data ?? []) : []);
      })
      .finally(() => { if (active) setSearching(false); });
    return () => { active = false; };
  }, [debouncedQuery, data.patientMode]);

  const field = (key: keyof ReportFormState) => (val: string) =>
    dispatch(updateField({ key, value: val }));

  const handleModeSwitch = (mode: "new" | "existing") => {
    dispatch(patchForm({ patientMode: mode, selectedPatientId: null }));
    setSelected(null);
    setQuery("");
    setResults([]);
  };

  const handleSelectPatient = (patient: Patient) => {
    dispatch(patchForm(prefillFromPatient(patient)));
    setSelected(patient);
    setShowDropdown(false);
    setQuery("");
    setResults([]);
  };

  return (
    <div className="flex flex-col gap-3.5">
      {/* Mode switcher */}
      <SectionCard title="Patient lookup" icon="ti-user-search">
        <div className="flex gap-2 mb-4">
          <Button
            variant={data.patientMode === "new" ? "primary" : "default"}
            size="sm" icon="ti-user-plus"
            onClick={() => handleModeSwitch("new")}
          >
            New patient
          </Button>
          <Button
            variant={data.patientMode === "existing" ? "primary" : "default"}
            size="sm" icon="ti-user-search"
            onClick={() => handleModeSwitch("existing")}
          >
            Existing patient
          </Button>
        </div>

        {data.patientMode === "existing" && (
          <div className="relative mb-3">
            <FormField
              label="Search by name or employee ID"
              type="text"
              value={query}
              onChange={(val) => { setQuery(val); setShowDropdown(val.length > 0); }}
              placeholder="e.g. Bharat Koli or S150799"
            />
            {showDropdown && query.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border
                              border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden"
                   role="listbox">
                {searching ? (
                  <div className="flex items-center gap-2 px-3 py-3 text-sm text-gray-400">
                    <i className="ti ti-loader-2 animate-spin" aria-hidden="true" /> Searching…
                  </div>
                ) : results.length === 0 ? (
                  <div className="px-3 py-3 text-sm text-gray-400">No matching patients</div>
                ) : (
                  results.map((p) => (
                    <button
                      key={p.patientId}
                      role="option"
                      aria-selected={false}
                      onClick={() => handleSelectPatient(p)}
                      className="flex items-center gap-2.5 w-full px-3 py-2.5 text-left
                                 hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors"
                    >
                      <Avatar name={p.name} size="sm" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{p.name}</div>
                        <div className="text-[11px] text-gray-400">
                          {p.empId} · {p.company} · {p.reportCount ?? 0} report{(p.reportCount ?? 0) !== 1 ? "s" : ""}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Pre-fill banner */}
        {selected && data.selectedPatientId === selected.patientId && (
          <div className="flex items-start gap-2.5 p-3 bg-blue-50 rounded-lg mt-1">
            <i className="ti ti-info-circle text-blue-600 text-base flex-shrink-0 mt-0.5" aria-hidden="true" />
            <span className="text-sm text-blue-700 flex-1">
              Pre-filled from <strong>{selected.name}</strong> —{" "}
              {selected.reportCount ?? 0} previous report{(selected.reportCount ?? 0) !== 1 ? "s" : ""}.
              A new report ID will be assigned.
            </span>
            <Badge variant="existing" />
          </div>
        )}
      </SectionCard>

      {/* Patient details */}
      <SectionCard title="Patient information" icon="ti-id-badge">
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Employee name"    value={data.name}    onChange={field("name")}    placeholder="Full name" required />
          <FormField label="Employee ID"      value={data.empId}   onChange={field("empId")}   placeholder="e.g. S150799" required />
          <FormField label="Company name"     value={data.company} onChange={field("company")} required />
          <FormField label="Date" type="date" value={data.date}    onChange={field("date")} />
          <FormField label="Age" type="number" value={data.age} onChange={field("age")} placeholder="34" suffix="years" />
          <FormField label="Gender" type="select" value={data.gender} onChange={field("gender")} options={GENDER_OPTIONS} />
          <FormField label="Blood group" type="select" value={data.bloodGroup} onChange={field("bloodGroup")} options={BLOOD_GROUPS} />
          <FormField label="Designation" value={data.designation} onChange={field("designation")} />
          <div className="col-span-2">
            <FormField label="Work address" value={data.address} onChange={field("address")} placeholder="Area, City, District, PIN" />
          </div>
          <FormField label="Identification mark" value={data.identificationMark} onChange={field("identificationMark")} placeholder="e.g. Black mole on right side of throat" />
        </div>
      </SectionCard>
    </div>
  );
};
