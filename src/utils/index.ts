import type { Patient, Report, ReportFormState } from "../types";
import { EMPTY_FORM, EXAM_DEFAULTS } from "../constants";

// ─── BMI ─────────────────────────────────────────────────────────────────────
export function calcBmi(weightKg: number, heightM: number): number {
  if (!weightKg || !heightM || heightM === 0) return 0;
  return parseFloat((weightKg / (heightM * heightM)).toFixed(2));
}

// ─── Date helpers ─────────────────────────────────────────────────────────────
/** ISO "2026-06-18"  →  "18.06.2026" */
export function isoToDisplay(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

/** "18.06.2026"  →  "2026-06-18" */
export function displayToIso(display: string): string {
  if (!display) return "";
  const [d, m, y] = display.split(".");
  return `${y}-${m}-${d}`;
}

export function todayIso(): string {
  return new Date().toISOString().split("T")[0];
}

// ─── ID generators (frontend-only until backend connected) ───────────────────
export function genPatientId(): string {
  return `P-${1000 + Math.floor(Math.random() * 9000)}`;
}

export function genReportId(): string {
  return `R-${2000 + Math.floor(Math.random() * 8000)}`;
}

export function genSNo(existing: number[]): number {
  return existing.length > 0 ? Math.max(...existing) + 1 : 1001;
}

// ─── Pre-fill form from existing patient ────────────────────────────────────
export function prefillFromPatient(patient: Patient): Partial<ReportFormState> {
  return {
    patientMode: "existing",
    selectedPatientId: patient.patientId,
    name: patient.name,
    empId: patient.empId,
    company: patient.company,
    age: String(patient.age),
    gender: patient.gender,
    bloodGroup: patient.bloodGroup,
    address: patient.address,
    designation: patient.designation,
    identificationMark: patient.identificationMark,
    date: todayIso(),                // new date for new report
    ...EXAM_DEFAULTS,               // fresh exam defaults
  };
}

// ─── Pre-fill form from an existing report (for editing) ─────────────────────
export function prefillFromReport(
  report: Report,
  patient?: Patient
): Partial<ReportFormState> {
  const v = report.vitals;
  const e = report.examination;
  const d = report.doctor;
  return {
    patientMode:       "existing",
    selectedPatientId: patient?.patientId ?? report.patientId,
    // Patient details (read-only during report edit, shown for context)
    name:               patient?.name    ?? report.patientName  ?? "",
    empId:              patient?.empId    ?? report.patientEmpId ?? "",
    company:            patient?.company  ?? report.patientCompany ?? "",
    age:                patient ? String(patient.age) : "",
    gender:             patient?.gender ?? "Male",
    bloodGroup:         patient?.bloodGroup ?? "B Positive",
    address:            patient?.address ?? "",
    designation:        patient?.designation ?? "",
    identificationMark: patient?.identificationMark ?? "",
    date:               displayToIso(report.date),
    // Vitals
    pulseRate:        String(v.pulseRate),
    bpSystolic:       String(v.bpSystolic),
    bpDiastolic:      String(v.bpDiastolic),
    heightMetres:     String(v.heightMetres),
    weightKg:         String(v.weightKg),
    chestInflationCm: String(v.chestInflationCm),
    temperatureF:     String(v.temperatureF),
    spo2Percent:      String(v.spo2Percent),
    // Examination
    pallor:                  e.pallor,
    lymphadenopathy:         e.lymphadenopathy,
    respiratorySystem:       e.respiratorySystem,
    heart:                   e.heart,
    abdomen:                 e.abdomen,
    cns:                     e.cns,
    physicalHandicapped:     e.physicalHandicapped,
    distantVisionRight:      e.eye.distantVisionRight,
    distantVisionLeft:       e.eye.distantVisionLeft,
    nightBlindness:          e.eye.nightBlindness,
    colourVision:            e.eye.colourVision,
    hearingAbility:          e.hearingAbility,
    communicableDisease:     e.communicableDisease,
    communicableDiseaseDesc: e.communicableDiseaseDesc,
    covid19Symptoms:         e.covid19Symptoms,
    remarks:                 e.remarks,
    // Doctor
    doctorName:          d.name,
    doctorQualification: d.qualification,
    doctorRegistration:  d.registrationNumber,
  };
}

// ─── Form merge helper ────────────────────────────────────────────────────────
export function mergeForm(
  base: ReportFormState,
  patch: Partial<ReportFormState>
): ReportFormState {
  return { ...base, ...patch };
}

// ─── Reset form to empty ──────────────────────────────────────────────────────
export function resetForm(): ReportFormState {
  return { ...EMPTY_FORM, date: todayIso() };
}

// ─── Initials helper for avatars ──────────────────────────────────────────────
export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

// ─── Validation helpers ───────────────────────────────────────────────────────
export function isStepValid(step: number, data: ReportFormState): boolean {
  switch (step) {
    case 0:
      return !!(data.name.trim() && data.empId.trim() && data.company.trim());
    case 1:
      return !!(
        data.pulseRate &&
        data.bpSystolic &&
        data.bpDiastolic &&
        data.heightMetres &&
        data.weightKg &&
        data.temperatureF &&
        data.spo2Percent
      );
    case 2:
      return true; // all have defaults
    case 3:
      return !!(
        data.doctorName.trim() &&
        data.doctorRegistration.trim()
      );
    default:
      return false;
  }
}
