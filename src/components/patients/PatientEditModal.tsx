import { useState } from "react";
import type { FC } from "react";
import { useAppDispatch } from "../../hooks/useRedux";
import { editPatientThunk } from "../../store/slices/patientSlice";
import { addToast } from "../../store/slices/uiSlice";
import { BLOOD_GROUPS, GENDER_OPTIONS } from "../../constants";
import { FormField } from "../ui/FormField";
import { Button } from "../ui/Button";
import type { Patient } from "../../types";

interface Props {
  patient: Patient;
  onClose: () => void;
}

export const PatientEditModal: FC<Props> = ({ patient, onClose }) => {
  const dispatch = useAppDispatch();

  const [form, setForm] = useState({
    name:               patient.name,
    empId:              patient.empId,
    company:            patient.company,
    age:                String(patient.age),
    gender:             patient.gender,
    bloodGroup:         patient.bloodGroup,
    address:            patient.address,
    designation:        patient.designation,
    identificationMark: patient.identificationMark,
  });
  const [saving, setSaving] = useState(false);

  const set = (key: keyof typeof form) => (val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const canSave = form.name.trim() && form.empId.trim() && form.company.trim();

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    const result = await dispatch(editPatientThunk({
      patientId: patient.patientId,
      data: {
        ...form,
        age: parseInt(form.age) || 0,
      },
    }));
    setSaving(false);

    if (editPatientThunk.rejected.match(result)) {
      dispatch(addToast({ type: "error", message: `Update failed: ${result.payload}` }));
      return;
    }
    dispatch(addToast({ type: "success", message: `${form.name} updated successfully.` }));
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center
                 bg-black/40 p-0 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl
                   max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <i className="ti ti-user-edit text-brand-600 text-lg" aria-hidden="true" />
            <h2 className="font-semibold text-gray-900">Edit patient</h2>
            <span className="text-[11px] text-gray-300 font-mono">{patient.patientId}</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center
                       text-gray-400 hover:bg-gray-100"
            aria-label="Close"
          >
            <i className="ti ti-x text-lg" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Employee name" value={form.name}  onChange={set("name")}  required />
            <FormField label="Employee ID"   value={form.empId} onChange={set("empId")} required />
            <div className="col-span-2">
              <FormField label="Company name" value={form.company} onChange={set("company")} required />
            </div>
            <FormField label="Age" type="number" value={form.age} onChange={set("age")} suffix="years" />
            <FormField label="Gender" type="select" value={form.gender} onChange={set("gender")} options={GENDER_OPTIONS} />
            <FormField label="Blood group" type="select" value={form.bloodGroup} onChange={set("bloodGroup")} options={BLOOD_GROUPS} />
            <FormField label="Designation" value={form.designation} onChange={set("designation")} />
            <div className="col-span-2">
              <FormField label="Work address" value={form.address} onChange={set("address")} />
            </div>
            <div className="col-span-2">
              <FormField label="Identification mark" value={form.identificationMark} onChange={set("identificationMark")} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100">
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            icon="ti-device-floppy"
            onClick={handleSave}
            disabled={!canSave}
            loading={saving}
          >
            Save changes
          </Button>
        </div>
      </div>
    </div>
  );
};
