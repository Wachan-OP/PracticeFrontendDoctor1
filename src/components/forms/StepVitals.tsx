import type { FC } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import { updateField } from "../../store/slices/formSlice";
import { calcBmi } from "../../utils";
import { SectionCard } from "../ui/SectionCard";
import { FormField } from "../ui/FormField";
import type { ReportFormState } from "../../types";

export const StepVitals: FC = () => {
  const dispatch = useAppDispatch();
  const data     = useAppSelector((s) => s.form.data);

  const field = (key: keyof ReportFormState) => (val: string) =>
    dispatch(updateField({ key, value: val }));

  const bmi = calcBmi(parseFloat(data.weightKg) || 0, parseFloat(data.heightMetres) || 0);
  const bmiDisplay = bmi > 0 ? bmi.toFixed(2) : "";
  const bmiCategory =
    bmi === 0      ? "" :
    bmi < 18.5     ? "Underweight" :
    bmi < 25       ? "Normal" :
    bmi < 30       ? "Overweight" : "Obese";

  const bmiColor =
    bmiCategory === "Normal"      ? "bg-green-100 text-green-700" :
    bmiCategory === "Underweight" ? "bg-amber-100 text-amber-700" :
    bmiCategory === "Overweight"  ? "bg-amber-100 text-amber-700" :
    bmiCategory === "Obese"       ? "bg-red-100   text-red-700"   : "";

  return (
    <SectionCard title="Vitals" icon="ti-activity">
      <div className="grid grid-cols-2 gap-3">

        {/* Pulse */}
        <FormField label="Pulse rate" type="number" value={data.pulseRate}
          onChange={field("pulseRate")} placeholder="82" suffix="/min" required />

        {/* BP — custom two-input row */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">
            Blood pressure <span className="text-red-600">*</span>
          </label>
          <div className="flex items-center gap-1.5">
            <input type="number" value={data.bpSystolic} placeholder="124" aria-label="Systolic"
              onChange={(e) => field("bpSystolic")(e.target.value)} />
            <span className="text-lg text-gray-300 flex-shrink-0">/</span>
            <input type="number" value={data.bpDiastolic} placeholder="78" aria-label="Diastolic"
              onChange={(e) => field("bpDiastolic")(e.target.value)} />
            <span className="text-xs text-gray-400 whitespace-nowrap">mmHg</span>
          </div>
        </div>

        <FormField label="Height" type="number" value={data.heightMetres}
          onChange={field("heightMetres")} placeholder="1.67" suffix="metres" step="0.01" required />

        <FormField label="Weight" type="number" value={data.weightKg}
          onChange={field("weightKg")} placeholder="64" suffix="kg" required />

        <FormField label="Chest inflation" type="number" value={data.chestInflationCm}
          onChange={field("chestInflationCm")} placeholder="10" suffix="cm" />

        {/* BMI — auto-calculated */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">
            BMI <span className="text-[11px] text-gray-400">(auto-calculated)</span>
          </label>
          <div className="flex items-center gap-2">
            <input type="text" value={bmiDisplay} readOnly placeholder="—" aria-label="BMI" />
            <span className="text-xs text-gray-400 whitespace-nowrap">kg/m²</span>
            {bmiCategory && (
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${bmiColor}`}>
                {bmiCategory}
              </span>
            )}
          </div>
        </div>

        <FormField label="Temperature" type="number" value={data.temperatureF}
          onChange={field("temperatureF")} placeholder="96.2" suffix="°F" step="0.1" required />

        <FormField label="SpO₂" type="number" value={data.spo2Percent}
          onChange={field("spo2Percent")} placeholder="97" suffix="%" min="0" max="100" required />
      </div>
    </SectionCard>
  );
};
