import { useEffect, useState } from "react";
import type { FC } from "react";
import { useAppDispatch } from "../hooks/useRedux";
import { useDebounce } from "../hooks/useDebounce";
import { addToast } from "../store/slices/uiSlice";
import { patientApi, reportApi } from "../services/api";
import { downloadPatientExcel, downloadCertificate } from "../services/download";
import { Topbar } from "../components/layout/Topbar";
import { SectionCard } from "../components/ui/SectionCard";
import { Avatar } from "../components/ui/Avatar";
import { Badge } from "../components/ui/Badge";
import type { Patient, Report } from "../types";

export const ExportsPage: FC = () => {
  const dispatch = useAppDispatch();

  // ── Excel: search a patient, download all their reports ────────────────────
  const [pQuery, setPQuery] = useState("");
  const [pResults, setPResults] = useState<Patient[]>([]);
  const [pLoading, setPLoading] = useState(false);
  const [busyExcel, setBusyExcel] = useState<string | null>(null);
  const dpq = useDebounce(pQuery, 300);

  useEffect(() => {
    if (dpq.trim().length === 0) { setPResults([]); return; }
    let active = true;
    setPLoading(true);
    patientApi.list({ search: dpq.trim(), limit: 6 })
      .then((res) => { const r = res as { success: boolean; data?: Patient[] }; if (active) setPResults(r.success ? (r.data ?? []) : []); })
      .finally(() => { if (active) setPLoading(false); });
    return () => { active = false; };
  }, [dpq]);

  const handleExcel = async (p: Patient) => {
    setBusyExcel(p.patientId);
    const res = await downloadPatientExcel(p.patientId, p.name);
    dispatch(addToast({ type: res.ok ? "success" : "error", message: res.message }));
    setBusyExcel(null);
  };

  // ── PDF certificate: search a report, download its certificate ─────────────
  const [rQuery, setRQuery] = useState("");
  const [rResults, setRResults] = useState<Report[]>([]);
  const [rLoading, setRLoading] = useState(false);
  const [busyPdf, setBusyPdf] = useState<string | null>(null);
  const drq = useDebounce(rQuery, 300);

  useEffect(() => {
    if (drq.trim().length === 0) { setRResults([]); return; }
    let active = true;
    setRLoading(true);
    reportApi.list({ search: drq.trim(), limit: 6 })
      .then((res) => {
        const r = res as { success: boolean; data?: Array<Report & { patientId: unknown }> };
        if (!active) return;
        // patientId is populated; pull display name off it
        const mapped = (r.success ? (r.data ?? []) : []).map((rep) => {
          const pid = rep.patientId as { name?: string } | string;
          return { ...rep, patientName: typeof pid === "object" ? pid?.name : rep.patientName } as Report;
        });
        setRResults(mapped);
      })
      .finally(() => { if (active) setRLoading(false); });
    return () => { active = false; };
  }, [drq]);

  const handlePdf = async (r: Report) => {
    setBusyPdf(r.reportId);
    const res = await downloadCertificate(r.reportId);
    dispatch(addToast({ type: res.ok ? "success" : "error", message: res.message }));
    setBusyPdf(null);
  };

  return (
    <div className="flex flex-col min-h-full">
      <Topbar icon="ti-download" title="Exports" subtitle="Download Excel workbooks & PDF certificates" />

      <div className="flex-1 p-4 lg:p-6 flex flex-col gap-4 max-w-3xl mx-auto w-full">

        {/* Excel export */}
        <SectionCard title="Excel export" icon="ti-file-spreadsheet">
          <p className="text-xs text-gray-400 mb-3">
            Search a patient to download <strong>all their reports</strong> (across every date) as one Excel workbook.
          </p>
          <div className="relative">
            <i className="ti ti-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base pointer-events-none" aria-hidden="true" />
            <input type="search" placeholder="Search patient name or employee ID…"
              value={pQuery} onChange={(e) => setPQuery(e.target.value)} className="pl-10" />
          </div>
          {pQuery && (
            <div className="mt-2 flex flex-col gap-1.5">
              {pLoading ? (
                <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
                  <i className="ti ti-loader-2 animate-spin" aria-hidden="true" /> Searching…
                </div>
              ) : pResults.length === 0 ? (
                <div className="text-sm text-gray-400 py-2">No matching patients</div>
              ) : pResults.map((p) => (
                <div key={p.patientId} className="flex items-center gap-2.5 p-2.5 bg-gray-50 rounded-xl">
                  <Avatar name={p.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{p.name}</div>
                    <div className="text-[11px] text-gray-400">{p.empId} · {p.reportCount ?? 0} report{(p.reportCount ?? 0) !== 1 ? "s" : ""}</div>
                  </div>
                  <button
                    onClick={() => handleExcel(p)}
                    disabled={busyExcel === p.patientId}
                    className="px-3 h-9 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-medium
                               flex items-center gap-1.5 hover:bg-emerald-100 disabled:opacity-50">
                    <i className={`ti ${busyExcel === p.patientId ? "ti-loader-2 animate-spin" : "ti-download"}`} aria-hidden="true" />
                    Excel
                  </button>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* PDF certificates */}
        <SectionCard title="Generate PDF certificate" icon="ti-certificate">
          <p className="text-xs text-gray-400 mb-3">
            Search a report to download its <strong>medical fitness certificate</strong> — one PDF per report.
          </p>
          <div className="relative">
            <i className="ti ti-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base pointer-events-none" aria-hidden="true" />
            <input type="search" placeholder="Search by name, employee ID or report ID…"
              value={rQuery} onChange={(e) => setRQuery(e.target.value)} className="pl-10" />
          </div>
          {rQuery && (
            <div className="mt-2 flex flex-col gap-1.5">
              {rLoading ? (
                <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
                  <i className="ti ti-loader-2 animate-spin" aria-hidden="true" /> Searching…
                </div>
              ) : rResults.length === 0 ? (
                <div className="text-sm text-gray-400 py-2">No matching reports</div>
              ) : rResults.map((r) => (
                <div key={r.reportId} className="flex items-center gap-2.5 p-2.5 bg-gray-50 rounded-xl">
                  <Avatar name={r.patientName ?? "?"} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{r.patientName ?? "Unknown"}</div>
                    <div className="text-[11px] text-gray-400">{r.reportId} · {r.date}</div>
                  </div>
                  <Badge variant={r.status} />
                  <button
                    onClick={() => handlePdf(r)}
                    disabled={busyPdf === r.reportId}
                    className="px-3 h-9 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-medium
                               flex items-center gap-1.5 hover:bg-emerald-100 disabled:opacity-50">
                    <i className={`ti ${busyPdf === r.reportId ? "ti-loader-2 animate-spin" : "ti-download"}`} aria-hidden="true" />
                    PDF
                  </button>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Coming soon */}
        <SectionCard title="More exports" icon="ti-clock">
          <div className="flex flex-col gap-2">
            {[
              { label: "Bulk Excel (all patients)", icon: "ti-table-export" },
              { label: "Bulk PDF certificates (ZIP)", icon: "ti-file-zip" },
              { label: "CSV data export", icon: "ti-file-text" },
            ].map((item) => (
              <div key={item.label}
                className="flex items-center gap-2.5 p-2.5 rounded-xl text-gray-400 bg-gray-50/60">
                <i className={`ti ${item.icon} text-base`} aria-hidden="true" />
                <span className="flex-1 text-sm">{item.label}</span>
                <span className="text-[9px] bg-amber-50 text-amber-600 border border-amber-100 px-1.5 py-0.5 rounded-full font-medium">
                  Soon
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
};
