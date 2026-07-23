import { useState } from "react";
import type { FC } from "react";
import { useAppDispatch } from "../../hooks/useRedux";
import { addToast } from "../../store/slices/uiSlice";
import { adminApi } from "../../services/api";
import { FormField } from "../ui/FormField";
import { Button } from "../ui/Button";

interface Props {
  onClose:   () => void;
  onCreated: () => void;
}

export const UserCreateModal: FC<Props> = ({ onClose, onCreated }) => {
  const dispatch = useAppDispatch();

  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "",
    role: "doctor", qualification: "", registrationNo: "", clinicName: "Navodaya Clinic",
  });
  const [saving, setSaving] = useState(false);

  const set = (key: keyof typeof form) => (val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  // Mirror the backend password policy so we can hint before submitting
  const pwOk = form.password.length >= 8 && /[A-Z]/.test(form.password) &&
    /[0-9]/.test(form.password) && /[^A-Za-z0-9]/.test(form.password);
  const canSave = form.name.trim().length >= 2 && /^\S+@\S+\.\S+$/.test(form.email) && pwOk;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      role: form.role,
      qualification: form.qualification.trim(),
      registrationNo: form.registrationNo.trim(),
      clinicName: form.clinicName.trim(),
      ...(form.phone.trim() ? { phone: form.phone.trim() } : {}),
    };
    const res = await adminApi.createUser(payload) as { success: boolean; message: string };
    setSaving(false);

    if (!res.success) {
      dispatch(addToast({ type: "error", message: res.message || "Could not create user." }));
      return;
    }
    dispatch(addToast({ type: "success", message: `${form.name} created.` }));
    onCreated();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <i className="ti ti-user-plus text-brand-600 text-lg" aria-hidden="true" />
            <h2 className="font-semibold text-gray-900">Add user</h2>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100"
            aria-label="Close">
            <i className="ti ti-x text-lg" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <FormField label="Full name" value={form.name} onChange={set("name")} required />
            </div>
            <div className="col-span-2">
              <FormField label="Email" type="email" value={form.email} onChange={set("email")} placeholder="doctor@clinic.com" required />
            </div>
            <FormField label="Phone" type="tel" value={form.phone} onChange={set("phone")} placeholder="10-digit mobile" />
            <FormField label="Role" type="select" value={form.role} onChange={set("role")} options={["doctor", "admin"]} />

            {/* Password (masked — FormField has no password type) */}
            <div className="col-span-2 flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500">
                Temporary password<span className="text-red-600 ml-0.5">*</span>
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => set("password")(e.target.value)}
                placeholder="Min 8 chars, 1 uppercase, 1 number, 1 symbol"
                autoComplete="new-password"
              />
              {form.password.length > 0 && !pwOk && (
                <span className="text-[11px] text-red-600">
                  Needs 8+ chars with an uppercase letter, a number, and a symbol.
                </span>
              )}
            </div>

            <FormField label="Qualification" value={form.qualification} onChange={set("qualification")} placeholder="M.B.B.S." />
            <FormField label="Registration No." value={form.registrationNo} onChange={set("registrationNo")} />
            <div className="col-span-2">
              <FormField label="Clinic name" value={form.clinicName} onChange={set("clinicName")} />
            </div>
          </div>
          <p className="text-[11px] text-gray-400 mt-3">
            Share the temporary password with the user; they can change it after logging in.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100">
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" icon="ti-user-plus" onClick={handleSave} disabled={!canSave} loading={saving}>
            Create user
          </Button>
        </div>
      </div>
    </div>
  );
};
