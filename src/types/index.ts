// ─── Patient ──────────────────────────────────────────────────────────────────
export interface Patient {
  _id?:               string;         // MongoDB ObjectId — present when fetched from backend
  patientId:          string;
  name:               string;
  empId:              string;
  company:            string;
  age:                number;
  gender:             "Male" | "Female" | "Other";
  bloodGroup:         BloodGroup;
  address:            string;
  designation:        string;
  identificationMark: string;
  createdAt:          string;
  updatedAt:          string;
  reportCount?:       number;         // computed by the server list endpoint
  lastReportAt?:      string | null;  // ISO date of most recent report
}

// ─── Pagination ────────────────────────────────────────────────────────────────
export interface PaginationMeta {
  total: number;
  page:  number;
  limit: number;
  pages: number;
}

export interface ListParams {
  search?:    string;
  from?:      string;
  to?:        string;
  sort?:      string;
  status?:    string;
  patientId?: string;
  page?:      number;
  limit?:     number;
  [key: string]: unknown;   // allow use as a generic query-params bag
}

export interface DashboardSummary {
  patients:  number;
  reports:   number;
  certified: number;
  thisMonth: number;
}
// ─── Report ───────────────────────────────────────────────────────────────────
export interface Report {
  reportId:    string;
  patientId:   string;         // normalized to human-readable patient ID (e.g. "P-1001")
  patientName?:    string;     // populated fallback from backend (avoids "Unknown")
  patientEmpId?:   string;
  patientCompany?: string;
  sNo:         number;
  date:        string;
  vitals:      Vitals;
  examination: Examination;
  doctor:      DoctorInfo;
  status:      ReportStatus;
  createdAt:   string;
}

export interface Vitals {
  pulseRate:        number;
  bpSystolic:       number;
  bpDiastolic:      number;
  heightMetres:     number;
  weightKg:         number;
  chestInflationCm: number;
  bmi:              number;
  temperatureF:     number;
  spo2Percent:      number;
}

export interface Examination {
  pallor:                  string;
  lymphadenopathy:         string;
  respiratorySystem:       string;
  heart:                   string;
  abdomen:                 string;
  cns:                     string;
  physicalHandicapped:     string;
  eye:                     EyeExam;
  hearingAbility:          string;
  communicableDisease:     YesNo;
  communicableDiseaseDesc: string;
  covid19Symptoms:         YesNo;
  remarks:                 string;
}

export interface EyeExam {
  distantVisionRight: string;
  distantVisionLeft:  string;
  nightBlindness:     string;
  colourVision:       string;
}

export interface DoctorInfo {
  name:               string;
  qualification:      string;
  registrationNumber: string;
}

// ─── Form ─────────────────────────────────────────────────────────────────────
export interface ReportFormState {
  patientMode:             "new" | "existing";
  selectedPatientId:       string | null;
  name:                    string;
  empId:                   string;
  company:                 string;
  date:                    string;
  age:                     string;
  gender:                  string;
  bloodGroup:              string;
  address:                 string;
  designation:             string;
  identificationMark:      string;
  pulseRate:               string;
  bpSystolic:              string;
  bpDiastolic:             string;
  heightMetres:            string;
  weightKg:                string;
  chestInflationCm:        string;
  temperatureF:            string;
  spo2Percent:             string;
  pallor:                  string;
  lymphadenopathy:         string;
  respiratorySystem:       string;
  heart:                   string;
  abdomen:                 string;
  cns:                     string;
  physicalHandicapped:     string;
  distantVisionRight:      string;
  distantVisionLeft:       string;
  nightBlindness:          string;
  colourVision:            string;
  hearingAbility:          string;
  communicableDisease:     YesNo;
  communicableDiseaseDesc: string;
  covid19Symptoms:         YesNo;
  remarks:                 string;
  doctorName:              string;
  doctorQualification:     string;
  doctorRegistration:      string;
  saveToDb:                boolean;
  appendToExcel:           boolean;
  generatePdf:             boolean;
}

// ─── Enums ────────────────────────────────────────────────────────────────────
export type BloodGroup    = "A Positive"|"A Negative"|"B Positive"|"B Negative"|"O Positive"|"O Negative"|"AB Positive"|"AB Negative";
export type YesNo         = "Yes" | "No";
export type ReportStatus  = "draft" | "submitted" | "certified";
export type NavView       = "dashboard" | "new-report" | "patients" | "reports" | "exports" | "users";

// ─── Redux root ───────────────────────────────────────────────────────────────
export interface UiState {
  activeView:        NavView;
  sidebarCollapsed:  boolean;
  toasts:            Toast[];
}

export interface PatientState {
  list:              Patient[];
  searchQuery:       string;
  selectedPatientId: string | null;
  loading:           boolean;
  error:             string | null;
  pagination:        PaginationMeta | null;
}

export interface ReportState {
  list:       Report[];
  loading:    boolean;
  error:      string | null;
  pagination: PaginationMeta | null;
  summary:    DashboardSummary | null;
}

export interface FormWizardState {
  currentStep:  number;
  totalSteps:   number;
  data:         ReportFormState;
  isDirty:      boolean;
  isSubmitting: boolean;
  editingReportId: string | null;   // set when the wizard is editing an existing report
}

export interface Toast {
  id:      string;
  type:    "success" | "error" | "info";
  message: string;
}
