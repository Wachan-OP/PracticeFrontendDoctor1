import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Report, ReportState, PaginationMeta, ListParams, DashboardSummary } from "../../types";
import { reportApi } from "../../services/api";

const initialState: ReportState = {
  list:       [],
  loading:    false,
  error:      null,
  pagination: null,
  summary:    null,
};

// The backend populates `patientId` with a patient object
// ({ _id, patientId, name, empId, company }) on list/create responses,
// but the rest of the app expects `report.patientId` to be the human-readable
// patient ID string. Normalize here so every report has a consistent shape,
// keeping the populated details as display fallbacks.
function normalizeReport(raw: unknown): Report {
  const r = raw as Record<string, unknown>;
  const pid = r.patientId;

  if (pid && typeof pid === "object") {
    const p = pid as Record<string, unknown>;
    return {
      ...(r as unknown as Report),
      patientId:      (p.patientId as string) ?? (p._id as string) ?? "",
      patientName:    p.name    as string | undefined,
      patientEmpId:   p.empId   as string | undefined,
      patientCompany: p.company as string | undefined,
    };
  }

  return r as unknown as Report;
}

// ─── Thunks ───────────────────────────────────────────────────────────────────
export const fetchReports = createAsyncThunk(
  "reports/fetchAll",
  async (params: ListParams | void, { rejectWithValue }) => {
    const res = await reportApi.list(params || undefined) as
      { success: boolean; message: string; data?: Report[]; pagination?: PaginationMeta };
    if (!res.success) return rejectWithValue(res.message);
    return {
      list:       (res.data ?? []).map(normalizeReport),
      pagination: res.pagination ?? null,
    };
  }
);

export const fetchReportSummary = createAsyncThunk(
  "reports/summary",
  async (_, { rejectWithValue }) => {
    const res = await reportApi.summary() as { success: boolean; message: string; data?: DashboardSummary };
    if (!res.success) return rejectWithValue(res.message);
    return res.data ?? null;
  }
);

export const submitReportThunk = createAsyncThunk(
  "reports/submit",
  async (data: unknown, { rejectWithValue }) => {
    const res = await reportApi.create(data) as { success: boolean; message: string; data?: { report: Report } };
    if (!res.success) return rejectWithValue(res.message);
    return res.data?.report ? normalizeReport(res.data.report) : null;
  }
);

export const editReportThunk = createAsyncThunk(
  "reports/edit",
  async (
    { reportId, data }: { reportId: string; data: unknown },
    { rejectWithValue }
  ) => {
    const res = await reportApi.update(reportId, data) as { success: boolean; message: string; data?: { report: Report } };
    if (!res.success) return rejectWithValue(res.message);
    return res.data?.report ? normalizeReport(res.data.report) : null;
  }
);

export const deleteReportThunk = createAsyncThunk(
  "reports/delete",
  async (reportId: string, { rejectWithValue }) => {
    const res = await reportApi.remove(reportId) as { success: boolean; message: string };
    if (!res.success) return rejectWithValue(res.message);
    return reportId;
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────
export const reportSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {
    addReport(state, action: PayloadAction<Report>) {
      state.list.unshift(action.payload);
    },
    updateReport(state, action: PayloadAction<Report>) {
      const idx = state.list.findIndex((r) => r.reportId === action.payload.reportId);
      if (idx !== -1) state.list[idx] = action.payload;
    },
    // Cascade helper — used when a patient is deleted
    removeReportsByPatient(state, action: PayloadAction<string>) {
      state.list = state.list.filter((r) => r.patientId !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReports.pending,   (state) => { state.loading = true; state.error = null; })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.list       = action.payload.list;
        state.pagination = action.payload.pagination;
        state.loading    = false;
      })
      .addCase(fetchReports.rejected,  (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
      });

    builder
      .addCase(fetchReportSummary.fulfilled, (state, action) => {
        state.summary = action.payload;
      });

    builder
      .addCase(submitReportThunk.fulfilled, (state, action) => {
        if (action.payload) state.list.unshift(action.payload);
      });

    builder
      .addCase(editReportThunk.fulfilled, (state, action) => {
        if (!action.payload) return;
        const idx = state.list.findIndex((r) => r.reportId === action.payload!.reportId);
        if (idx !== -1) state.list[idx] = action.payload;
      });

    builder
      .addCase(deleteReportThunk.fulfilled, (state, action) => {
        state.list = state.list.filter((r) => r.reportId !== action.payload);
      });
  },
});

export const { addReport, updateReport, removeReportsByPatient } = reportSlice.actions;
export default reportSlice.reducer;
