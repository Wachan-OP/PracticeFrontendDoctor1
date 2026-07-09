import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { authApi } from "../../services/api";
import { Button } from "../../components/ui/Button";

type Step = "email" | "otp" | "password" | "done";

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  const [step,       setStep]       = useState<Step>("email");
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");
  const [email,      setEmail]      = useState("");
  const [otp,        setOtp]        = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPass,    setNewPass]    = useState("");
  const [show,       setShow]       = useState(false);

  const clearErr = () => setError("");

  const STEPS: Step[] = ["email", "otp", "password"];
  const stepLabels = ["Email", "Verify OTP", "New password"];

  // ─── Step 1: Submit email ─────────────────────────────────────────────────
  const submitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); clearErr();
    const res = await authApi.forgotPassword({ email }) as { success: boolean; message: string };
    setLoading(false);
    if (res.success) setStep("otp");
    else setError(res.message);
  };

  // ─── Step 2: Verify OTP ───────────────────────────────────────────────────
  const submitOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); clearErr();
    const res = await authApi.verifyOtp({ email, otp }) as {
      success: boolean; message: string; data?: { resetToken: string };
    };
    setLoading(false);
    if (res.success && res.data?.resetToken) {
      setResetToken(res.data.resetToken);
      setStep("password");
    } else {
      setError(res.message);
    }
  };

  // ─── Step 3: Reset password ───────────────────────────────────────────────
  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); clearErr();
    const res = await authApi.resetPassword({ resetToken, newPassword: newPass }) as {
      success: boolean; message: string;
    };
    setLoading(false);
    if (res.success) setStep("done");
    else setError(res.message);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-brand-600 flex items-center justify-center mb-3">
            <i className="ti ti-stethoscope text-white text-2xl" aria-hidden="true" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Reset password</h1>
          <p className="text-sm text-gray-400 mt-0.5">We'll send an OTP to your email</p>
        </div>

        {/* Step indicators */}
        {step !== "done" && (
          <div className="flex items-center justify-center gap-1.5 mb-6">
            {STEPS.map((s, i) => {
              const currentIdx = STEPS.indexOf(step);
              const isDone   = i < currentIdx;
              const isActive = i === currentIdx;
              return (
                <div key={s} className="flex items-center gap-1.5">
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors
                    ${isActive  ? "bg-brand-600 text-white" :
                      isDone    ? "bg-green-100 text-green-700" :
                                  "bg-gray-100 text-gray-400"}`}>
                    {isDone
                      ? <i className="ti ti-check text-[10px]" aria-hidden="true" />
                      : <span className="w-3.5 h-3.5 flex items-center justify-center text-[10px] font-bold">{i + 1}</span>}
                    <span>{stepLabels[i]}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`w-4 h-px ${i < currentIdx ? "bg-green-300" : "bg-gray-200"}`} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg mb-4 text-sm text-red-700">
              <i className="ti ti-alert-circle flex-shrink-0" aria-hidden="true" />
              {error}
            </div>
          )}

          {/* ── Step 1: Email ─────────────────────────────────────────────── */}
          {step === "email" && (
            <form onSubmit={submitEmail} className="flex flex-col gap-4">
              <div>
                <h2 className="text-[15px] font-medium text-gray-900">Enter your email</h2>
                <p className="text-sm text-gray-400 mt-1">
                  We'll send a 6-digit OTP to your registered email address.
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { clearErr(); setEmail(e.target.value); }}
                  placeholder="doctor@clinic.com"
                  required
                  autoFocus
                  autoComplete="email"
                />
              </div>
              <Button variant="primary" loading={loading} className="w-full justify-center">
                Send OTP
              </Button>
            </form>
          )}

          {/* ── Step 2: OTP ───────────────────────────────────────────────── */}
          {step === "otp" && (
            <form onSubmit={submitOtp} className="flex flex-col gap-4">
              <div>
                <h2 className="text-[15px] font-medium text-gray-900">Enter the OTP</h2>
                <p className="text-sm text-gray-400 mt-1">
                  A 6-digit code was sent to{" "}
                  <strong className="text-gray-700">{email}</strong>.
                  Valid for <strong>10 minutes</strong>.
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500">6-digit OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => { clearErr(); setOtp(e.target.value.replace(/\D/g, "").slice(0, 6)); }}
                  placeholder="• • • • • •"
                  required
                  maxLength={6}
                  className="text-center text-2xl tracking-[0.6em] font-mono"
                  inputMode="numeric"
                  autoFocus
                  autoComplete="one-time-code"
                />
              </div>
              <Button
                variant="primary"
                loading={loading}
                disabled={otp.length !== 6}
                className="w-full justify-center"
              >
                Verify OTP
              </Button>
              <button
                type="button"
                onClick={() => { setStep("email"); setOtp(""); clearErr(); }}
                className="text-sm text-gray-400 hover:text-gray-600 text-center"
              >
                ← Use a different email
              </button>
            </form>
          )}

          {/* ── Step 3: New password ──────────────────────────────────────── */}
          {step === "password" && (
            <form onSubmit={submitPassword} className="flex flex-col gap-4">
              <div>
                <h2 className="text-[15px] font-medium text-gray-900">Set a new password</h2>
                <p className="text-sm text-gray-400 mt-1">
                  Must be at least 8 characters with an uppercase letter, number, and special character.
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500">New password</label>
                <div className="relative">
                  <input
                    type={show ? "text" : "password"}
                    value={newPass}
                    onChange={(e) => { clearErr(); setNewPass(e.target.value); }}
                    placeholder="••••••••"
                    required
                    className="pr-10"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <i className={`ti ${show ? "ti-eye-off" : "ti-eye"} text-sm`} aria-hidden="true" />
                  </button>
                </div>
              </div>
              <Button variant="primary" loading={loading} className="w-full justify-center">
                Reset password
              </Button>
            </form>
          )}

          {/* ── Done ─────────────────────────────────────────────────────── */}
          {step === "done" && (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                <i className="ti ti-circle-check text-green-600 text-3xl" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-[15px] font-medium text-gray-900">Password reset!</h2>
                <p className="text-sm text-gray-400 mt-1">
                  You can now sign in with your new password.
                </p>
              </div>
              <Button variant="primary" onClick={() => navigate("/login")} className="w-full justify-center">
                Go to login
              </Button>
            </div>
          )}
        </div>

        {step !== "done" && (
          <p className="text-center text-sm text-gray-400 mt-4">
            <Link to="/login" className="text-brand-600 hover:text-brand-800">
              ← Back to login
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};
