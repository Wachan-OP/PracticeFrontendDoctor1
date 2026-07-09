import type { FC } from "react";
import { useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../hooks/useRedux";
import { nextStep, prevStep, resetForm } from "../store/slices/formSlice";
import { setActiveView, addToast } from "../store/slices/uiSlice";
import { submitReportThunk, editReportThunk } from "../store/slices/reportSlice";
import { createPatientThunk } from "../store/slices/patientSlice";
import { isStepValid, calcBmi, isoToDisplay } from "../utils";
import { downloadPatientExcel } from "../services/download";
import { patientApi } from "../services/api";
import { FORM_STEPS, TOTAL_STEPS } from "../constants";
import { Topbar }       from "../components/layout/Topbar";
import { Button }       from "../components/ui/Button";
import { StepTabs }     from "../components/forms/StepTabs";
import { StepPatient }  from "../components/forms/StepPatient";
import { StepVitals }   from "../components/forms/StepVitals";
import { StepExamination } from "../components/forms/StepExamination";
import { StepCertify }  from "../components/forms/StepCertify";

const STEP_COMPONENTS = [StepPatient, StepVitals, StepExamination, StepCertify];

export const NewReportPage: FC = () => {
  const dispatch    = useAppDispatch();
  const navigate    = useNavigate();
  const currentStep = useAppSelector((s) => s.form.currentStep);
  const data        = useAppSelector((s) => s.form.data);
  const isDirty     = useAppSelector((s) => s.form.isDirty);
  const isSubmitting = useAppSelector((s) => s.form.isSubmitting);
  const editingReportId = useAppSelector((s) => s.form.editingReportId);
  const patients    = useAppSelector((s) => s.patients.list);
  const isEditing   = !!editingReportId;

  const StepComponent = STEP_COMPONENTS[currentStep];
  const canProceed    = isStepValid(currentStep, data);
  const isLastStep    = currentStep === TOTAL_STEPS - 1;

  const handleDiscard = () => {
    if (isDirty && !window.confirm("Discard this report?")) return;
    dispatch(resetForm());
    dispatch(setActiveView("dashboard"));
    navigate("/");
  };

  // Builds the shared report payload (vitals / examination / doctor) from the form
  const buildReportBody = () => {
    const bmi = calcBmi(parseFloat(data.weightKg) || 0, parseFloat(data.heightMetres) || 0);
    return {
      date: isoToDisplay(data.date),
      vitals: {
        pulseRate:        parseFloat(data.pulseRate)        || 0,
        bpSystolic:       parseFloat(data.bpSystolic)       || 0,
        bpDiastolic:      parseFloat(data.bpDiastolic)      || 0,
        heightMetres:     parseFloat(data.heightMetres)     || 0,
        weightKg:         parseFloat(data.weightKg)         || 0,
        chestInflationCm: parseFloat(data.chestInflationCm) || 0,
        bmi,
        temperatureF:     parseFloat(data.temperatureF)     || 0,
        spo2Percent:      parseFloat(data.spo2Percent)      || 0,
      },
      examination: {
        pallor: data.pallor, lymphadenopathy: data.lymphadenopathy,
        respiratorySystem: data.respiratorySystem, heart: data.heart,
        abdomen: data.abdomen, cns: data.cns,
        physicalHandicapped: data.physicalHandicapped,
        eye: {
          distantVisionRight: data.distantVisionRight,
          distantVisionLeft:  data.distantVisionLeft,
          nightBlindness:     data.nightBlindness,
          colourVision:       data.colourVision,
        },
        hearingAbility:          data.hearingAbility,
        communicableDisease:     data.communicableDisease,
        communicableDiseaseDesc: data.communicableDiseaseDesc,
        covid19Symptoms:         data.covid19Symptoms,
        remarks:                 data.remarks,
      },
      doctor: {
        name:               data.doctorName,
        qualification:      data.doctorQualification,
        registrationNumber: data.doctorRegistration,
      },
    };
  };

  // ── Edit an existing report (in place) ──────────────────────────────────────
  const handleUpdate = async () => {
    if (!editingReportId) return;
    const result = await dispatch(editReportThunk({
      reportId: editingReportId,
      data:     buildReportBody(),
    }));

    if (editReportThunk.rejected.match(result)) {
      dispatch(addToast({ type: "error", message: `Failed to save changes: ${result.payload}` }));
      return;
    }

    dispatch(resetForm());
    dispatch(addToast({ type: "success", message: `Report ${editingReportId} updated successfully!` }));
    dispatch(setActiveView("reports"));
    navigate("/reports");
  };

  const handleSubmit = async () => {
    if (isEditing) { await handleUpdate(); return; }

    const bmi = calcBmi(parseFloat(data.weightKg) || 0, parseFloat(data.heightMetres) || 0);

    // 1. If new patient — create patient in DB first
    let patientDbId: string | null = null;

    if (data.patientMode === "new") {
      const patientResult = await dispatch(createPatientThunk({
        name:               data.name,
        empId:              data.empId,
        company:            data.company,
        age:                parseInt(data.age) || 0,
        gender:             data.gender,
        bloodGroup:         data.bloodGroup,
        address:            data.address,
        designation:        data.designation,
        identificationMark: data.identificationMark,
      }));

      if (createPatientThunk.rejected.match(patientResult)) {
        // Backend returns a clear message for duplicate Employee IDs
        dispatch(addToast({ type: "error", message: String(patientResult.payload) }));
        return;
      }

// Get MongoDB _id from created patient
      const created = patientResult.payload as { _id?: string } | null;
      patientDbId = created?._id ?? null;
    } else {
      // Existing patient — use their MongoDB _id (look in the loaded page first,
      // then fall back to a direct fetch since lists are now paginated).
      const existing = patients.find((p) => p.patientId === data.selectedPatientId);
      patientDbId = existing?._id ?? null;
      if (!patientDbId && data.selectedPatientId) {
        const res = await patientApi.get(data.selectedPatientId) as { success: boolean; data?: { _id?: string } };
        if (res.success) patientDbId = res.data?._id ?? null;
      }
    }

    if (!patientDbId) {
      dispatch(addToast({ type: "error", message: "Could not resolve patient ID. Try again." }));
      return;
    }

    // 2. Submit report to backend
    const reportResult = await dispatch(submitReportThunk({
      patientId: patientDbId,
      date:      isoToDisplay(data.date),
      vitals: {
        pulseRate:        parseFloat(data.pulseRate)        || 0,
        bpSystolic:       parseFloat(data.bpSystolic)       || 0,
        bpDiastolic:      parseFloat(data.bpDiastolic)      || 0,
        heightMetres:     parseFloat(data.heightMetres)     || 0,
        weightKg:         parseFloat(data.weightKg)         || 0,
        chestInflationCm: parseFloat(data.chestInflationCm) || 0,
        bmi,
        temperatureF:     parseFloat(data.temperatureF)     || 0,
        spo2Percent:      parseFloat(data.spo2Percent)      || 0,
      },
      examination: {
        pallor: data.pallor, lymphadenopathy: data.lymphadenopathy,
        respiratorySystem: data.respiratorySystem, heart: data.heart,
        abdomen: data.abdomen, cns: data.cns,
        physicalHandicapped: data.physicalHandicapped,
        eye: {
          distantVisionRight: data.distantVisionRight,
          distantVisionLeft:  data.distantVisionLeft,
          nightBlindness:     data.nightBlindness,
          colourVision:       data.colourVision,
        },
        hearingAbility:          data.hearingAbility,
        communicableDisease:     data.communicableDisease,
        communicableDiseaseDesc: data.communicableDiseaseDesc,
        covid19Symptoms:         data.covid19Symptoms,
        remarks:                 data.remarks,
      },
      doctor: {
        name:               data.doctorName,
        qualification:      data.doctorQualification,
        registrationNumber: data.doctorRegistration,
      },
      status: "submitted",
    }));

    if (submitReportThunk.rejected.match(reportResult)) {
      dispatch(addToast({ type: "error", message: `Failed to submit report: ${reportResult.payload}` }));
      return;
    }

    const report = reportResult.payload as { reportId?: string } | null;

    dispatch(resetForm());
    dispatch(addToast({ type: "success", message: `Report ${report?.reportId ?? ""} submitted successfully!` }));
    dispatch(setActiveView("dashboard"));
    navigate("/");
  };

  // Excel export for the patient currently in the form (existing patient only —
  // a brand-new patient has no saved reports until this one is submitted).
  const handleExcelExport = async () => {
    if (data.patientMode !== "existing" || !data.selectedPatientId) {
      dispatch(addToast({
        type: "info",
        message: "Submit this report first, then export from the Patients page.",
      }));
      return;
    }
    const patient = patients.find((p) => p.patientId === data.selectedPatientId);
    dispatch(addToast({ type: "info", message: "Preparing Excel export…" }));
    const result = await downloadPatientExcel(data.selectedPatientId, patient?.name);
    dispatch(addToast({ type: result.ok ? "success" : "error", message: result.message }));
  };

  return (
    <div className="flex flex-col min-h-full">
      <Topbar
        title={isEditing ? "Edit report" : "New report"}
        subtitle={`Step ${currentStep + 1} of ${TOTAL_STEPS} — ${FORM_STEPS[currentStep].label}`}
        onBack={handleDiscard}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 lg:p-6 max-w-2xl mx-auto w-full flex flex-col gap-4">
          <StepTabs />
          <StepComponent />
        </div>
      </div>

      <div className="sticky bottom-0 z-20 bg-white border-t border-gray-100
                      px-4 lg:px-6 py-3 flex items-center justify-between gap-3 pb-safe">
        <div>
          {currentStep > 0 && (
            <Button icon="ti-arrow-left" onClick={() => dispatch(prevStep())}>Back</Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isLastStep ? (
            <Button variant="primary" iconRight="ti-arrow-right"
              onClick={() => dispatch(nextStep())} disabled={!canProceed}>
              Next
            </Button>
          ) : (
            <>
              <Button icon="ti-file-spreadsheet" size="sm"
                onClick={handleExcelExport}
                className="hidden sm:inline-flex">
                Excel
              </Button>
              <Button variant="success" icon={isEditing ? "ti-device-floppy" : "ti-certificate"}
                onClick={handleSubmit}
                disabled={!canProceed}
                loading={isSubmitting}>
                {isEditing ? "Save changes" : "Submit & certify"}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
