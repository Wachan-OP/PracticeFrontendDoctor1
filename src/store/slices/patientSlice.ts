import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Patient, PatientState, PaginationMeta, ListParams } from "../../types";
import { patientApi } from "../../services/api";

const initialState: PatientState = {
  list:              [],
  searchQuery:       "",
  selectedPatientId: null,
  loading:           false,
  error:             null,
  pagination:        null,
};

// Backend returns { success, data: Patient[], pagination }
type ListResponse = { success: boolean; message: string; data?: Patient[]; pagination?: PaginationMeta };
type CreateResponse = { success: boolean; message: string; data?: { patient: Patient } };

export const fetchPatients = createAsyncThunk(
  "patients/fetchAll",
  async (params: ListParams | void, { rejectWithValue }) => {
    const res = await patientApi.list(params || undefined) as ListResponse;
    if (!res.success) return rejectWithValue(res.message);
    return { list: res.data ?? [], pagination: res.pagination ?? null };
  }
);

export const createPatientThunk = createAsyncThunk(
  "patients/create",
  async (data: unknown, { rejectWithValue }) => {
    const res = await patientApi.create(data) as CreateResponse;
    if (!res.success) return rejectWithValue(res.message);
    return res.data?.patient ?? null;
  }
);

export const editPatientThunk = createAsyncThunk(
  "patients/edit",
  async (
    { patientId, data }: { patientId: string; data: unknown },
    { rejectWithValue }
  ) => {
    const res = await patientApi.update(patientId, data) as CreateResponse;
    if (!res.success) return rejectWithValue(res.message);
    return res.data?.patient ?? null;
  }
);

export const deletePatientThunk = createAsyncThunk(
  "patients/delete",
  async (patientId: string, { rejectWithValue }) => {
    const res = await patientApi.remove(patientId) as { success: boolean; message: string };
    if (!res.success) return rejectWithValue(res.message);
    return patientId;
  }
);

export const patientSlice = createSlice({
  name: "patients",
  initialState,
  reducers: {
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    selectPatient(state, action: PayloadAction<string | null>) {
      state.selectedPatientId = action.payload;
    },
    addPatient(state, action: PayloadAction<Patient>) {
      state.list.unshift(action.payload);
    },
    updatePatient(state, action: PayloadAction<Patient>) {
      const idx = state.list.findIndex((p) => p.patientId === action.payload.patientId);
      if (idx !== -1) state.list[idx] = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatients.pending,   (state) => { state.loading = true; state.error = null; })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.list = action.payload.list;
        state.pagination = action.payload.pagination;
        state.loading = false;
      })
      .addCase(fetchPatients.rejected,  (state, action) => {
        state.loading = false; state.error = action.payload as string;
      });

    builder.addCase(createPatientThunk.fulfilled, (state, action) => {
      if (action.payload) state.list.unshift(action.payload);
    });

    builder.addCase(editPatientThunk.fulfilled, (state, action) => {
      if (!action.payload) return;
      const idx = state.list.findIndex((p) => p.patientId === action.payload!.patientId);
      if (idx !== -1) state.list[idx] = action.payload;
    });

    builder.addCase(deletePatientThunk.fulfilled, (state, action) => {
      state.list = state.list.filter((p) => p.patientId !== action.payload);
    });
  },
});

export const { setSearchQuery, selectPatient, addPatient, updatePatient } = patientSlice.actions;

export const selectFilteredPatients = (state: { patients: PatientState }) => {
  const q = state.patients.searchQuery.toLowerCase().trim();
  if (!q) return state.patients.list;
  return state.patients.list.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.empId.toLowerCase().includes(q) ||
      p.company.toLowerCase().includes(q)
  );
};

export default patientSlice.reducer;
