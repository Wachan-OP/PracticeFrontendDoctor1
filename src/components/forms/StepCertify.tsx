import type { FC } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import { updateField } from "../../store/slices/formSlice";
import { SectionCard } from "../ui/SectionCard";
import { FormField } from "../ui/FormField";
import { Toggle } from "../ui/Toggle";
import type { ReportFormState } from "../../types";

export const StepCertify: FC = () => {
  const dispatch = useAppDispatch();
  const data     = useAppSelector((s) => s.form.data);

  const field  = (key: keyof ReportFormState) => (val: string)  => dispatch(updateField({ key, value: val }));
  const toggle = (key: keyof ReportFormState) => (val: boolean) => dispatch(updateField({ key, value: val }));

  return (
    <div className="flex flex-col gap-3.5">

      {/* Declaration */}
      <SectionCard title="Medical fitness declaration" icon="ti-certificate">
        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600 leading-relaxed mb-5">
          <p>
            This is to certify that{" "}
            <strong className="text-gray-900">{data.name || "the above-named employee"}</strong>{" "}
            employed at <strong className="text-gray-900">{data.company}</strong> has been
            carefully examined on{" "}
            <strong className="text-gray-900">{data.date}</strong>. Based on the medical
            examination conducted, he/she is found free from obvious infectious diseases and is
            physically and mentally{" "}
            <strong className="text-green-700">"FIT"</strong> to work in this organization.
          </p>
          <p className="text-[11px] text-gray-400 mt-3">
            Note: This certificate has been issued on interest/demand of the applicant for issuing
            medical fitness. Not for medicolegal purpose.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Doctor name"       value={data.doctorName}           onChange={field("doctorName")}           placeholder="Dr. R. S. Patil" required />
          <FormField label="Qualification"     value={data.doctorQualification}  onChange={field("doctorQualification")}  placeholder="M.B.B.S." />
          <div className="col-span-2">
            <FormField label="Registration number" value={data.doctorRegistration} onChange={field("doctorRegistration")} placeholder="Reg. No. 2007040750" required />
          </div>
        </div>
      </SectionCard>

      {/* Output options */}
      <SectionCard title="Output options" icon="ti-settings-2">
        <Toggle id="save-db"      label="Save patient & report to database"
          description="Stores this record in MongoDB so it can be retrieved later"
          checked={data.saveToDb}       onChange={toggle("saveToDb")} />
        <Toggle id="append-excel" label="Append row to Excel report"
          description="Adds a row to the shared Excel sheet for this patient's company"
          checked={data.appendToExcel}  onChange={toggle("appendToExcel")} />
        <Toggle id="gen-pdf"      label="Generate PDF certificate"
          description="Produces a downloadable certificate matching the clinic template"
          checked={data.generatePdf}    onChange={toggle("generatePdf")} />
      </SectionCard>
    </div>
  );
};
