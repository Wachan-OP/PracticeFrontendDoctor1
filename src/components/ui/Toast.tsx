import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import { removeToast } from "../../store/slices/uiSlice";

export const ToastContainer: FC = () => {
  const toasts = useAppSelector((s) => s.ui.toasts);
  return (
    <div
      className="fixed bottom-5 right-5 flex flex-col gap-2 z-50"
      role="status"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} id={t.id} type={t.type} message={t.message} />
      ))}
    </div>
  );
};

interface ToastItemProps {
  id:      string;
  type:    "success" | "error" | "info";
  message: string;
}

const iconMap = {
  success: "ti-circle-check",
  error:   "ti-circle-x",
  info:    "ti-info-circle",
};

const colorMap = {
  success: "text-green-700",
  error:   "text-red-700",
  info:    "text-brand-600",
};

const ToastItem: FC<ToastItemProps> = ({ id, type, message }) => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    const t = setTimeout(() => dispatch(removeToast(id)), 3500);
    return () => clearTimeout(t);
  }, [id, dispatch]);

  return (
    <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-white border border-gray-200
                    rounded-xl shadow-md text-sm min-w-[280px] max-w-[380px]
                    animate-[slideIn_.2s_ease]">
      <i className={`ti ${iconMap[type]} text-base ${colorMap[type]}`} aria-hidden="true" />
      <span className="flex-1 text-gray-800">{message}</span>
      <button
        onClick={() => dispatch(removeToast(id))}
        className="text-gray-400 hover:text-gray-600 flex items-center"
        aria-label="Dismiss"
      >
        <i className="ti ti-x text-sm" aria-hidden="true" />
      </button>
    </div>
  );
};
