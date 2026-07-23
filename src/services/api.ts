// All API calls go through this single service.
// Credentials: "include" sends httpOnly cookies automatically.

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?:   T;
  errors?: Record<string, string[]>;
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<ApiResponse<T>> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    credentials: "include",               // send httpOnly cookies
    headers:     { "Content-Type": "application/json" },
    body:        body ? JSON.stringify(body) : undefined,
  });

  const json = (await res.json()) as ApiResponse<T>;

  // On 401 — try refreshing token once, then give up
  if (res.status === 401 && path !== "/auth/refresh" && path !== "/auth/login") {
    const refreshed = await request<null>("POST", "/auth/refresh");
    if (refreshed.success) {
      return request<T>(method, path, body);
    }
    // Refresh failed — force logout by clearing state
    window.dispatchEvent(new CustomEvent("auth:logout"));
  }

  return json;
}

const get  = <T>(path: string)               => request<T>("GET",    path);
const post = <T>(path: string, body: unknown) => request<T>("POST",   path, body);
const put  = <T>(path: string, body: unknown) => request<T>("PUT",    path, body);
const del  = <T>(path: string)               => request<T>("DELETE",  path);

// Build a query string from a params object, skipping empty values
function qs(params: Record<string, unknown> = {}): string {
  const p = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") p.set(k, String(v));
  });
  const s = p.toString();
  return s ? `?${s}` : "";
}

// ─── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  register:       (data: unknown) => post("/auth/register",        data),
  login:          (data: unknown) => post("/auth/login",           data),
  logout:         ()              => post("/auth/logout",          {}),
  getMe:          ()              => get ("/auth/me"),
  forgotPassword: (data: unknown) => post("/auth/forgot-password", data),
  verifyOtp:      (data: unknown) => post("/auth/verify-otp",      data),
  resetPassword:  (data: unknown) => post("/auth/reset-password",  data),
  changePassword: (data: unknown) => post("/auth/change-password", data),
};

// ─── Patients ─────────────────────────────────────────────────────────────────
export const patientApi = {
  list:       (params?: import("../types").ListParams) => get(`/patients${qs(params)}`),
  get:        (id: string)        => get(`/patients/${id}`),
  create:     (data: unknown)     => post("/patients", data),
  update:     (id: string, data: unknown) => put(`/patients/${id}`, data),
  remove:     (id: string)        => del(`/patients/${id}`),
  reports:    (id: string)        => get(`/patients/${id}/reports`),
};

// ─── Reports ──────────────────────────────────────────────────────────────────
export const reportApi = {
  list:         (params?: import("../types").ListParams) => get(`/reports${qs(params)}`),
  summary:      ()                => get("/reports/summary"),
  get:          (id: string)      => get(`/reports/${id}`),
  create:       (data: unknown)   => post("/reports", data),
  update:       (id: string, data: unknown) => put(`/reports/${id}`, data),
  updateStatus: (id: string, status: string) =>
    request("PATCH", `/reports/${id}/status`, { status }),
  remove:       (id: string)      => del(`/reports/${id}`),
};

// ─── Export ───────────────────────────────────────────────────────────────────
export const exportApi = {
  excel:       (patientId: string) => get(`/export/excel?patientId=${patientId}`),
  certificate: (reportId: string)  => get(`/export/certificate/${reportId}`),
};

// ─── Admin ────────────────────────────────────────────────────────────────────
export const adminApi = {
  stats:        ()                          => get("/admin/stats"),
  listUsers:    (page = 1)                  => get(`/admin/users?page=${page}`),
  createUser:   (data: unknown)             => post("/admin/users", data),
  getUser:      (id: string)                => get(`/admin/users/${id}`),
  changeRole:   (id: string, role: string)  => request("PATCH", `/admin/users/${id}/role`,   { role }),
  changeStatus: (id: string, isActive: boolean) => request("PATCH", `/admin/users/${id}/status`, { isActive }),
  deleteUser:   (id: string)                => del(`/admin/users/${id}`),
};
