import type { BloodGroup, ReportFormState } from "../types";

export const DEFAULT_COMPANY   = "UNIQUE DELTA FORCE SECURITIES PVT LTD";
export const DEFAULT_DESIGNATION = "Security Guard";

export const EXAM_DEFAULTS = {
  pallor:                  "Not Observed",
  lymphadenopathy:         "No Any Lymphadenopathy",
  respiratorySystem:       "Air Entry Equal On Both Sides, No Added Sounds",
  heart:                   "S1,S2 Normal, No Murmur",
  abdomen:                 "Soft Nontender",
  cns:                     "No Abnormality Detected",
  physicalHandicapped:     "No",
  distantVisionRight:      "6/6",
  distantVisionLeft:       "6/6",
  nightBlindness:          "No Any Complaint",
  colourVision:            "Normal",
  hearingAbility:          "Present",
  communicableDisease:     "No" as const,
  communicableDiseaseDesc: "",
  covid19Symptoms:         "No" as const,
  remarks:                 "Nil",
};

export const EMPTY_FORM: ReportFormState = {
  patientMode:             "new",
  selectedPatientId:       null,
  name:                    "",
  empId:                   "",
  company:                 DEFAULT_COMPANY,
  date:                    new Date().toISOString().split("T")[0],
  age:                     "",
  gender:                  "Male",
  bloodGroup:              "B Positive",
  address:                 "",
  designation:             DEFAULT_DESIGNATION,
  identificationMark:      "",
  pulseRate:               "",
  bpSystolic:              "",
  bpDiastolic:             "",
  heightMetres:            "",
  weightKg:                "",
  chestInflationCm:        "",
  temperatureF:            "",
  spo2Percent:             "",
  ...EXAM_DEFAULTS,
  doctorName:              "",
  doctorQualification:     "M.B.B.S.",
  doctorRegistration:      "",
  saveToDb:                true,
  appendToExcel:           true,
  generatePdf:             true,
};

export const BLOOD_GROUPS: BloodGroup[] = [
  "A Positive", "A Negative",
  "B Positive", "B Negative",
  "O Positive", "O Negative",
  "AB Positive", "AB Negative",
];

export const GENDER_OPTIONS = ["Male", "Female", "Other"] as const;

export const FORM_STEPS = [
  { key: "patient",     label: "Patient",     icon: "ti-user" },
  { key: "vitals",      label: "Vitals",      icon: "ti-activity" },
  { key: "examination", label: "Examination", icon: "ti-clipboard-list" },
  { key: "certify",     label: "Certify",     icon: "ti-certificate" },
] as const;

export const TOTAL_STEPS = FORM_STEPS.length;

// Doctor nav (all roles see these)
export const NAV_ITEMS = [
  { view: "dashboard",  label: "Dashboard",   icon: "ti-layout-dashboard" },
  { view: "new-report", label: "New report",  icon: "ti-file-plus" },
  { view: "patients",   label: "Patients",    icon: "ti-users" },
  { view: "reports",    label: "All reports", icon: "ti-files" },
  { view: "exports",    label: "Exports",     icon: "ti-download" },
] as const;

// Admin-only nav item
export const ADMIN_NAV_ITEM = {
  view: "users", label: "User management", icon: "ti-shield-lock",
} as const;
