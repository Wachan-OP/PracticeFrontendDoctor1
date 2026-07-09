// Binary download helper.
// The main `api.ts` request() always parses JSON, so file downloads (Excel)
// need their own fetch that reads the response as a Blob.

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

export interface DownloadResult {
  ok:      boolean;
  message: string;
}

/**
 * Downloads the full Excel workbook for a single patient — includes ALL of that
 * patient's reports (old & new) across every date, one row per report.
 *
 * @param patientId  Human-readable patient ID (e.g. "P-1001") or Mongo _id.
 * @param label      Optional friendly label used in the downloaded filename.
 */
export async function downloadPatientExcel(
  patientId: string,
  label?: string
): Promise<DownloadResult> {
  if (!patientId) {
    return { ok: false, message: "No patient selected for export." };
  }

  try {
    const res = await fetch(
      `${BASE}/export/excel?patientId=${encodeURIComponent(patientId)}`,
      { credentials: "include" }
    );

    if (!res.ok) {
      if (res.status === 404) {
        return { ok: false, message: "No reports found for this patient yet." };
      }
      // Backend sends a JSON error body on failure
      let message = "Export failed. Please try again.";
      try {
        const body = await res.json();
        if (body?.message) message = body.message;
      } catch { /* non-JSON error body — keep default */ }
      return { ok: false, message };
    }

    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `${label ?? patientId}-reports.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    return { ok: true, message: "Excel downloaded successfully." };
  } catch {
    return { ok: false, message: "Export failed. Check your connection." };
  }
}

/**
 * Downloads the PDF fitness certificate for a single report.
 * One certificate per report — includes all patient & report data plus unique IDs.
 *
 * @param reportId  Human-readable report ID (e.g. "R-2001").
 */
export async function downloadCertificate(reportId: string): Promise<DownloadResult> {
  if (!reportId) {
    return { ok: false, message: "No report selected." };
  }

  try {
    const res = await fetch(
      `${BASE}/export/certificate/${encodeURIComponent(reportId)}`,
      { credentials: "include" }
    );

    if (!res.ok) {
      if (res.status === 404) {
        return { ok: false, message: "Report not found." };
      }
      let message = "Certificate generation failed. Please try again.";
      try {
        const body = await res.json();
        if (body?.message) message = body.message;
      } catch { /* non-JSON error body — keep default */ }
      return { ok: false, message };
    }

    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `${reportId}-certificate.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    return { ok: true, message: "Certificate downloaded successfully." };
  } catch {
    return { ok: false, message: "Certificate download failed. Check your connection." };
  }
}
