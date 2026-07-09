import type { FC } from "react";

interface BaseProps {
  label:     string;
  hint?:     string;
  error?:    string;
  required?: boolean;
  className?: string;
}

interface InputProps extends BaseProps {
  type?: "text" | "number" | "date" | "email" | "tel";
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  suffix?: string;
  min?: string;
  max?: string;
  step?: string;
}

interface SelectProps extends BaseProps {
  type: "select";
  value: string;
  onChange: (val: string) => void;
  options: readonly string[] | string[];
}

type FormFieldProps = InputProps | SelectProps;

export const FormField: FC<FormFieldProps> = (props) => {
  const { label, hint, error, required, className } = props;

  return (
    <div className={`flex flex-col gap-1 ${className ?? ""}`}>
      <label className="text-xs font-medium text-gray-500">
        {label}
        {required && <span className="text-red-600 ml-0.5">*</span>}
      </label>

      {props.type === "select" ? (
        <select
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
        >
          {(props as SelectProps).options.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      ) : (props as InputProps).suffix ? (
        <div className="flex items-center gap-2">
          <input
            type={(props as InputProps).type ?? "text"}
            value={props.value}
            onChange={(e) => props.onChange(e.target.value)}
            placeholder={(props as InputProps).placeholder}
            readOnly={(props as InputProps).readOnly}
            min={(props as InputProps).min}
            max={(props as InputProps).max}
            step={(props as InputProps).step}
          />
          <span className="text-xs text-gray-400 whitespace-nowrap">
            {(props as InputProps).suffix}
          </span>
        </div>
      ) : (
        <input
          type={(props as InputProps).type ?? "text"}
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          placeholder={(props as InputProps).placeholder}
          readOnly={(props as InputProps).readOnly}
          min={(props as InputProps).min}
          max={(props as InputProps).max}
          step={(props as InputProps).step}
        />
      )}

      {hint  && <span className="text-[11px] text-gray-400">{hint}</span>}
      {error && <span className="text-[11px] text-red-600">{error}</span>}
    </div>
  );
};
