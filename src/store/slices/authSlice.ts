import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { authApi } from "../../services/api";

export interface AuthUser {
  _id:            string;
  name:           string;
  email:          string;
  phone:          string;
  role:           "doctor" | "admin";
  qualification:  string;
  registrationNo: string;
  clinicName:     string;
}

interface AuthState {
  user:        AuthUser | null;
  loading:     boolean;
  error:       string | null;
  initialized: boolean;
}

type AuthResponse = { success: boolean; message: string; data?: { user: AuthUser } };

export const initAuth = createAsyncThunk("auth/init", async () => {
  const res = await authApi.getMe() as AuthResponse;
  if (!res.success) return null;
  return res.data?.user ?? null;
});

export const loginThunk = createAsyncThunk(
  "auth/login",
  async (data: { email: string; password: string }, { rejectWithValue }) => {
    const res = await authApi.login(data) as AuthResponse;
    if (!res.success) return rejectWithValue(res.message);
    return res.data?.user ?? null;
  }
);

export const registerThunk = createAsyncThunk(
  "auth/register",
  async (data: unknown, { rejectWithValue }) => {
    const res = await authApi.register(data) as AuthResponse;
    if (!res.success) return rejectWithValue(res.message);
    return res.data?.user ?? null;
  }
);

export const logoutThunk = createAsyncThunk("auth/logout", async () => {
  await authApi.logout();
  return null;
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user:        null,
    loading:     false,
    error:       null,
    initialized: false,
  } as AuthState,
  reducers: {
    clearError(state) { state.error = null; },
    forceLogout(state) {
      state.user        = null;
      state.initialized = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initAuth.pending,    (state) => { state.loading = true; })
      .addCase(initAuth.fulfilled,  (state, action: PayloadAction<AuthUser | null>) => {
        state.user = action.payload; state.initialized = true; state.loading = false;
      })
      .addCase(initAuth.rejected,   (state) => {
        state.user = null; state.initialized = true; state.loading = false;
      });

    builder
      .addCase(loginThunk.pending,   (state) => { state.loading = true; state.error = null; })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.user = action.payload; state.loading = false; state.error = null;
      })
      .addCase(loginThunk.rejected,  (state, action) => {
        state.loading = false; state.error = action.payload as string;
      });

    builder
      .addCase(registerThunk.pending,   (state) => { state.loading = true; state.error = null; })
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.user = action.payload; state.loading = false; state.error = null;
      })
      .addCase(registerThunk.rejected,  (state, action) => {
        state.loading = false; state.error = action.payload as string;
      });

    builder.addCase(logoutThunk.fulfilled, (state) => {
      state.user = null; state.loading = false;
    });
  },
});

export const { clearError, forceLogout } = authSlice.actions;
export default authSlice.reducer;
