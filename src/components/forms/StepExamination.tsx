import type { FC } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import { updateField } from "../../store/slices/formSlice";
import { SectionCard } from "../ui/SectionCard";
import { FormField } from "../ui/FormField";
import type { ReportFormState, YesNo } from "../../types";

const YES_NO: YesNo[] = ["No", "Yes"];

export const StepExamination: FC = () => {
  const dispatch = useAppDispatch();
  const data     = useAppSelector((s) => s.form.data);

  const field = (key: keyof ReportFormState) => (val: string) =>
    dispatch(updateField({ key, value: val }));

  return (
    <div className="flex flex-col gap-3.5">

      {/* General exam */}
      <SectionCard title="General examination" icon="ti-clipboard-list">
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Pallor / Icterus"      value={data.pallor}             onChange={field("pallor")} />
          <FormField label="Lymphadenopathy"        value={data.lymphadenopathy}    onChange={field("lymphadenopathy")} />
          <div className="col-span-2">
            <FormField label="Respiratory system"   value={data.respiratorySystem}  onChange={field("respiratorySystem")} />
          </div>
          <FormField label="Heart"                  value={data.heart}              onChange={field("heart")} />
          <FormField label="Abdomen"                value={data.abdomen}            onChange={field("abdomen")} />
          <div className="col-span-2">
            <FormField label="Central nervous system" value={data.cns}             onChange={field("cns")} />
          </div>
          <FormField label="Physical handicapped"   value={data.physicalHandicapped} onChange={field("physicalHandicapped")} />
        </div>
      </SectionCard>

      {/* Eye & ear */}
      <SectionCard title="Eye & ear assessment" icon="ti-eye">
        <div className="grid grid-cols-2 gap-3">
          {/* Vision — two inputs */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Distant vision — Right / Left</label>
            <div className="flex items-center gap-2">
              <input type="text" value={data.distantVisionRight} placeholder="6/6" aria-label="Right eye"
                onChange={(e) => field("distantVisionRight")(e.target.value)} />
              <span className="text-gray-300 text-lg flex-shrink-0">/</span>
              <input type="text" value={data.distantVisionLeft} placeholder="6/6" aria-label="Left eye"
                onChange={(e) => field("distantVisionLeft")(e.target.value)} />
            </div>
          </div>
          <FormField label="Night blindness"         value={data.nightBlindness}  onChange={field("nightBlindness")} />
          <FormField label="Colour vision"           value={data.colourVision}    onChange={field("colourVision")} />
          <FormField label="Basic hearing ability"   value={data.hearingAbility}  onChange={field("hearingAbility")} />
        </div>
      </SectionCard>

      {/* Communicable disease */}
      <SectionCard title="Communicable disease screening" icon="ti-virus">
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Suspecting communicable / infectious disease?" type="select"
            value={data.communicableDisease} onChange={field("communicableDisease")} options={YES_NO} />
          <FormField label="Covid-19 symptoms?" type="select"
            value={data.covid19Symptoms} onChange={field("covid19Symptoms")} options={YES_NO} />
          {data.communicableDisease === "Yes" && (
            <div className="col-span-2">
              <FormField label="Description" value={data.communicableDiseaseDesc}
                onChange={field("communicableDiseaseDesc")} placeholder="Describe the condition" />
            </div>
          )}
          <div className="col-span-2">
            <FormField label="Remarks" value={data.remarks} onChange={field("remarks")} placeholder="Nil" />
          </div>
        </div>
      </SectionCard>
    </div>
  );
};
