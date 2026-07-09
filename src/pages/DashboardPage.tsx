import { useAppDispatch, useAppSelector } from "../hooks/useRedux";
import { setActiveView } from "../store/slices/uiSlice";
import { patchForm, resetForm } from "../store/slices/formSlice";
import { prefillFromPatient } from "../utils";
import { Topbar } from "../components/layout/Topbar";
import { Button } from "../components/ui/Button";
import { Avatar } from "../components/ui/Avatar";
import { Badge } from "../components/ui/Badge";
import { useNavigate } from "react-router";
import type { FC } from "react";

export const DashboardPage: FC = () => {
  const dispatch  = useAppDispatch();
  const navigate  = useNavigate();
  const patients  = useAppSelector((s) => s.patients.list);
  const reports   = useAppSelector((s) => s.reports.list);
  const summary   = useAppSelector((s) => s.reports.summary);
  const user      = useAppSelector((s) => s.auth.user);

  // Counts come from the server so they reflect ALL records, not just the loaded page
  const totalPatients = summary?.patients  ?? 0;
  const totalReports  = summary?.reports   ?? 0;
  const certified     = summary?.certified ?? 0;
  const thisMonth     = summary?.thisMonth ?? 0;

  const handleNewReport = () => {
    dispatch(resetForm());
    dispatch(setActiveView("new-report"));
    navigate("/new-report");
  };

  const handleNewForPatient = (patientId: string) => {
    const p = patients.find((p) => p.patientId === patientId);
    if (p) dispatch(patchForm(prefillFromPatient(p)));
    dispatch(setActiveView("new-report"));
    navigate("/new-report");
  };

  const sorted = [...reports].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="flex flex-col min-h-full">
      <Topbar
        icon="ti-layout-dashboard"
        title="Dashboard"
        subtitle={`${totalPatients} patients · ${totalReports} reports`}
        actions={
          <Button variant="primary" icon="ti-plus" size="sm"
            onClick={handleNewReport} className="hidden sm:inline-flex">
            New report
          </Button>
        }
      />

      <div className="flex-1 p-4 lg:p-6 flex flex-col gap-4 max-w-3xl mx-auto w-full lg:max-w-none">

        {/* Welcome banner — mobile only */}
        {user && (
          <div className="lg:hidden bg-brand-600 rounded-2xl p-4 text-white">
            <p className="text-xs opacity-80">Welcome back</p>
            <p className="text-base font-semibold mt-0.5">{user.name}</p>
            <p className="text-xs opacity-70 mt-0.5">{user.clinicName}</p>
          </div>
        )}

        {/* Stats grid — 2 cols mobile, 4 cols desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Patients",    value: totalPatients, icon: "ti-users" },
            { label: "Reports",     value: totalReports,  icon: "ti-files" },
            { label: "Certified",   value: certified,     icon: "ti-certificate" },
            { label: "This month",  value: thisMonth,     icon: "ti-calendar" },
          ].map(({ label, value, icon }) => (
            <div key={label}
              className="bg-white border border-gray-100 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center">
                  <i className={`ti ${icon} text-base text-gray-400`} aria-hidden="true" />
                </div>
              </div>
              <div className="text-2xl font-semibold text-gray-900">{value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Recent reports */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Recent reports
          </span>
          <button
            onClick={() => { dispatch(setActiveView("reports")); navigate("/reports"); }}
            className="text-xs text-brand-600 font-medium flex items-center gap-1"
          >
            View all <i className="ti ti-arrow-right text-xs" aria-hidden="true" />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {sorted.slice(0, 6).map((report) => {
            const patient = patients.find((p) => p.patientId === report.patientId);
            const name    = patient?.name  ?? report.patientName  ?? "Unknown";
            const empId   = patient?.empId ?? report.patientEmpId ?? "—";
            return (
              <div key={report.reportId}
                className="flex items-center gap-3 p-3 bg-white border border-gray-100
                           rounded-2xl active:scale-[.99] transition-transform">
                <Avatar name={name} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {name}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {empId} · {report.date}
                  </div>
                </div>
                <Badge variant={report.status} />
                <button
                  onClick={() => handleNewForPatient(report.patientId)}
                  className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center
                             text-gray-500 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                  aria-label="New report"
                >
                  <i className="ti ti-file-plus text-base" aria-hidden="true" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
