import type { FC } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import { setStep } from "../../store/slices/formSlice";
import { FORM_STEPS } from "../../constants";
import { isStepValid } from "../../utils";

export const StepTabs: FC = () => {
  const dispatch    = useAppDispatch();
  const currentStep = useAppSelector((s) => s.form.currentStep);
  const data        = useAppSelector((s) => s.form.data);

  return (
    <div className="flex gap-1.5 bg-gray-100 rounded-2xl p-1.5"
         role="tablist" aria-label="Form steps">
      {FORM_STEPS.map((s, i) => {
        const done       = i < currentStep && isStepValid(i, data);
        const active     = i === currentStep;
        const accessible = i <= currentStep;

        return (
          <button
            key={s.key}
            role="tab"
            aria-selected={active}
            tabIndex={accessible ? 0 : -1}
            onClick={() => accessible && dispatch(setStep(i))}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl
              text-xs font-medium transition-all min-h-[40px]
              ${active
                ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                : done
                  ? "text-green-700 cursor-pointer"
                  : accessible
                    ? "text-gray-500 cursor-pointer hover:text-gray-700"
                    : "text-gray-300 cursor-not-allowed"}`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center
              text-[10px] font-bold flex-shrink-0
              ${active  ? "bg-brand-600 text-white"  :
                done    ? "bg-green-100 text-green-700" :
                          "bg-gray-200 text-gray-500"}`}>
              {done
                ? <i className="ti ti-check text-[9px]" aria-hidden="true" />
                : i + 1}
            </span>
            <span className="hidden sm:inline">{s.label}</span>
          </button>
        );
      })}
    </div>
  );
};
