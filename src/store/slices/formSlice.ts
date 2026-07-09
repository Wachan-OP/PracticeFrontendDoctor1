import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { FormWizardState, ReportFormState } from "../../types";
import { EMPTY_FORM, TOTAL_STEPS } from "../../constants";
import { todayIso } from "../../utils";

const initialState: FormWizardState = {
  currentStep: 0,
  totalSteps: TOTAL_STEPS,
  data: { ...EMPTY_FORM, date: todayIso() },
  isDirty: false,
  isSubmitting: false,
  editingReportId: null,
};

export const formSlice = createSlice({
  name: "form",
  initialState,
  reducers: {
    setStep(state, action: PayloadAction<number>) {
      state.currentStep = Math.max(0, Math.min(action.payload, TOTAL_STEPS - 1));
    },
    nextStep(state) {
      if (state.currentStep < TOTAL_STEPS - 1) state.currentStep++;
    },
    prevStep(state) {
      if (state.currentStep > 0) state.currentStep--;
    },
    updateField(
      state,
      action: PayloadAction<{ key: keyof ReportFormState; value: unknown }>
    ) {
      (state.data as Record<string, unknown>)[action.payload.key] =
        action.payload.value;
      state.isDirty = true;
    },
    patchForm(state, action: PayloadAction<Partial<ReportFormState>>) {
      state.data = { ...state.data, ...action.payload };
      state.isDirty = true;
    },
    // Load an existing report into the wizard for editing
    beginEditReport(
      state,
      action: PayloadAction<{ reportId: string; data: Partial<ReportFormState> }>
    ) {
      state.data = { ...EMPTY_FORM, ...action.payload.data };
      state.editingReportId = action.payload.reportId;
      state.currentStep = 0;
      state.isDirty = false;
      state.isSubmitting = false;
    },
    resetForm(state) {
      state.data = { ...EMPTY_FORM, date: todayIso() };
      state.currentStep = 0;
      state.isDirty = false;
      state.isSubmitting = false;
      state.editingReportId = null;
    },
    setSubmitting(state, action: PayloadAction<boolean>) {
      state.isSubmitting = action.payload;
    },
  },
});

export const {
  setStep,
  nextStep,
  prevStep,
  updateField,
  patchForm,
  beginEditReport,
  resetForm,
  setSubmitting,
} = formSlice.actions;

export const selectFormData = (state: { form: FormWizardState }) =>
  state.form.data;

export const selectCurrentStep = (state: { form: FormWizardState }) =>
  state.form.currentStep;

export const selectIsDirty = (state: { form: FormWizardState }) =>
  state.form.isDirty;

export default formSlice.reducer;
