import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAppSelector } from "../../hooks/useRedux";
import { adminApi } from "../../services/api";
import { Topbar } from "../../components/layout/Topbar";
import { Button } from "../../components/ui/Button";
import { Pagination } from "../../components/ui/Pagination";
import { UserCreateModal } from "../../components/admin/UserCreateModal";
import type { PaginationMeta } from "../../types";

interface User {
  _id:          string;
  name:         string;
  email:        string;
  phone?:       string;
  role:         "doctor" | "admin";
  isActive:     boolean;
  qualification: string;
  registrationNo: string;
  clinicName:   string;
  lastLogin?:   string;
  createdAt:    string;
}

interface Stats {
  total: number;
  admins: number;
  doctors: number;
  inactive: number;
}

export const UserManagementPage = () => {
  const navigate  = useNavigate();
  const currentUser = useAppSelector((s) => s.auth.user);

  const [users,   setUsers]   = useState<User[]>([]);
  const [stats,   setStats]   = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error,   setError]   = useState("");
  const [page,    setPage]    = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  // Redirect non-admins
  useEffect(() => {
    if (currentUser && currentUser.role !== "admin") navigate("/", { replace: true });
  }, [currentUser, navigate]);

  const load = async (p = page) => {
    setLoading(true);
    const [usersRes, statsRes] = await Promise.all([
      adminApi.listUsers(p) as Promise<{ success: boolean; data?: User[]; pagination?: PaginationMeta }>,
      adminApi.stats()      as Promise<{ success: boolean; data?: Stats }>,
    ]);
    if (usersRes.success) { setUsers(usersRes.data ?? []); setPagination(usersRes.pagination ?? null); }
    if (statsRes.success) setStats(statsRes.data ?? null);
    setLoading(false);
  };

  useEffect(() => { load(page); }, [page]);

  const handleRoleToggle = async (user: User) => {
    const newRole = user.role === "admin" ? "doctor" : "admin";
    if (!window.confirm(`Change ${user.name}'s role to ${newRole}?`)) return;
    setActionId(user._id); setError("");
    const res = await adminApi.changeRole(user._id, newRole) as { success: boolean; message: string };
    if (res.success) await load();
    else setError(res.message);
    setActionId(null);
  };

  const handleStatusToggle = async (user: User) => {
    const action = user.isActive ? "deactivate" : "activate";
    if (!window.confirm(`Are you sure you want to ${action} ${user.name}?`)) return;
    setActionId(user._id); setError("");
    const res = await adminApi.changeStatus(user._id, !user.isActive) as { success: boolean; message: string };
    if (res.success) await load();
    else setError(res.message);
    setActionId(null);
  };

  const handleDelete = async (user: User) => {
    if (!window.confirm(`Permanently delete ${user.name}? This cannot be undone.`)) return;
    setActionId(user._id); setError("");
    const res = await adminApi.deleteUser(user._id) as { success: boolean; message: string };
    if (res.success) await load();
    else setError(res.message);
    setActionId(null);
  };

  const formatDate = (iso?: string) => {
    if (!iso) return "Never";
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });
  };

  return (
    <div className="flex flex-col min-h-full">
      <Topbar
        icon="ti-shield-lock"
        title="User management"
        subtitle={pagination ? `Admin-only · ${pagination.total} users` : "Admin-only · Manage doctor accounts and roles"}
        actions={
          <div className="flex items-center gap-2">
            <Button icon="ti-refresh" onClick={() => load(page)}>Refresh</Button>
            <Button variant="primary" icon="ti-user-plus" onClick={() => setShowCreate(true)}>
              <span className="hidden sm:inline">Add user</span>
            </Button>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">

        {/* Stats row */}
        {stats && (
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Total users",   value: stats.total,    icon: "ti-users",        color: "text-gray-700" },
              { label: "Admins",        value: stats.admins,   icon: "ti-shield",       color: "text-brand-600" },
              { label: "Doctors",       value: stats.doctors,  icon: "ti-stethoscope",  color: "text-green-700" },
              { label: "Inactive",      value: stats.inactive, icon: "ti-user-off",     color: "text-red-600" },
            ].map(({ label, value, icon, color }) => (
              <div key={label} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0`}>
                  <i className={`ti ${icon} text-lg ${color}`} aria-hidden="true" />
                </div>
                <div>
                  <div className="text-xl font-semibold text-gray-900">{value}</div>
                  <div className="text-xs text-gray-400">{label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
            <i className="ti ti-alert-circle" aria-hidden="true" />
            {error}
          </div>
        )}

        {/* How roles work — info banner */}
        <div className="flex items-start gap-2.5 p-3 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700">
          <i className="ti ti-info-circle text-base flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <strong>How roles work:</strong> The first user to register is automatically made <strong>Admin</strong>.
            Admins can manage all users and access this page. <strong>Doctors</strong> can create and view reports but
            cannot manage users. You can promote any doctor to admin or demote any admin to doctor below.
          </div>
        </div>

        {/* User table */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <i className="ti ti-loader-2 text-3xl text-brand-600 spin" aria-hidden="true" />
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center text-center py-16 gap-2">
            <i className="ti ti-users-off text-4xl text-gray-200" aria-hidden="true" />
            <p className="text-[15px] font-medium text-gray-700">No users found</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-4 py-2.5 bg-gray-50 border-b border-gray-100 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <span>User</span>
              <span className="w-24 text-center">Role</span>
              <span className="w-20 text-center">Status</span>
              <span className="w-28 text-center">Last login</span>
              <span className="w-32 text-center">Actions</span>
            </div>

            {/* Rows */}
            {users.map((user) => {
              const isCurrentUser = user._id === currentUser?._id;
              const isLoading     = actionId === user._id;

              return (
                <div
                  key={user._id}
                  className={`grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-center
                    px-4 py-3 border-b border-gray-50 last:border-0
                    ${!user.isActive ? "opacity-60 bg-gray-50/50" : "hover:bg-gray-50/30"}`}
                >
                  {/* User info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center
                      text-xs font-semibold flex-shrink-0
                      ${user.role === "admin" ? "bg-brand-100 text-brand-700" : "bg-green-100 text-green-700"}`}>
                      {user.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 truncate">{user.name}</span>
                        {isCurrentUser && (
                          <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-medium">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 truncate">{user.email}</div>
                      {user.qualification && (
                        <div className="text-[11px] text-gray-300">{user.qualification} · {user.registrationNo}</div>
                      )}
                    </div>
                  </div>

                  {/* Role badge */}
                  <div className="w-24 flex justify-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
                      ${user.role === "admin"
                        ? "bg-brand-50 text-brand-700"
                        : "bg-green-50 text-green-700"}`}>
                      <i className={`ti ${user.role === "admin" ? "ti-shield" : "ti-stethoscope"} text-[11px]`}
                         aria-hidden="true" />
                      {user.role === "admin" ? "Admin" : "Doctor"}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="w-20 flex justify-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium
                      ${user.isActive
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-600"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? "bg-green-500" : "bg-red-400"}`} />
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {/* Last login */}
                  <div className="w-28 text-center text-xs text-gray-400">
                    {formatDate(user.lastLogin)}
                  </div>

                  {/* Actions */}
                  <div className="w-32 flex items-center justify-center gap-1.5">
                    {/* Role toggle — disabled for self */}
                    <button
                      onClick={() => handleRoleToggle(user)}
                      disabled={isCurrentUser || isLoading}
                      title={user.role === "admin" ? "Demote to doctor" : "Promote to admin"}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm border transition-colors
                        ${isCurrentUser
                          ? "border-gray-100 text-gray-200 cursor-not-allowed"
                          : user.role === "admin"
                            ? "border-amber-100 bg-amber-50 text-amber-600 hover:bg-amber-100"
                            : "border-brand-100 bg-brand-50 text-brand-600 hover:bg-brand-100"}`}
                    >
                      <i className={`ti ${user.role === "admin" ? "ti-arrow-down" : "ti-arrow-up"} text-xs`}
                         aria-hidden="true" />
                    </button>

                    {/* Activate/deactivate */}
                    <button
                      onClick={() => handleStatusToggle(user)}
                      disabled={isCurrentUser || isLoading}
                      title={user.isActive ? "Deactivate account" : "Activate account"}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm border transition-colors
                        ${isCurrentUser
                          ? "border-gray-100 text-gray-200 cursor-not-allowed"
                          : user.isActive
                            ? "border-orange-100 bg-orange-50 text-orange-600 hover:bg-orange-100"
                            : "border-green-100 bg-green-50 text-green-600 hover:bg-green-100"}`}
                    >
                      <i className={`ti ${user.isActive ? "ti-user-off" : "ti-user-check"} text-xs`}
                         aria-hidden="true" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(user)}
                      disabled={isCurrentUser || isLoading}
                      title="Delete user permanently"
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm border transition-colors
                        ${isCurrentUser
                          ? "border-gray-100 text-gray-200 cursor-not-allowed"
                          : "border-red-100 bg-red-50 text-red-600 hover:bg-red-100"}`}
                    >
                      {isLoading
                        ? <i className="ti ti-loader-2 text-xs spin" aria-hidden="true" />
                        : <i className="ti ti-trash text-xs" aria-hidden="true" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <Pagination meta={pagination} loading={loading} onPage={setPage} />
      </div>

      {showCreate && (
        <UserCreateModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { setPage(1); load(1); }}
        />
      )}
    </div>
  );
};
