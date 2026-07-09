import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import { loginThunk, clearError } from "../../store/slices/authSlice";
import { Button } from "../../components/ui/Button";

export const LoginPage = () => {
  const dispatch  = useAppDispatch();
  const navigate  = useNavigate();
  const { loading, error } = useAppSelector((s) => s.auth);
  const [form, setForm] = useState({ email: "", password: "" });
  const [show, setShow] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(clearError());
    setForm((f) => ({ ...f, [k]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(loginThunk(form));
    if (loginThunk.fulfilled.match(result)) navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen min-h-dvh bg-gray-50 flex flex-col">

      {/* Top decoration */}
      <div className="bg-brand-600 h-48 rounded-b-[2.5rem] flex flex-col
                      items-center justify-end pb-8 px-6 flex-shrink-0">
        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur
                        flex items-center justify-center mb-3">
          <i className="ti ti-stethoscope text-white text-2xl" aria-hidden="true" />
        </div>
        <h1 className="text-white text-xl font-bold">MedFit</h1>
        <p className="text-white/70 text-sm mt-1">Medical Fitness Certificates</p>
      </div>

      {/* Card */}
      <div className="flex-1 px-5 -mt-6 max-w-md w-full mx-auto">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-5">Sign in</h2>

          {error && (
            <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-100
                            rounded-2xl mb-4 text-sm text-red-700">
              <i className="ti ti-alert-circle flex-shrink-0 mt-0.5" aria-hidden="true" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 ml-1">Email address</label>
              <input type="email" value={form.email} onChange={set("email")}
                placeholder="doctor@clinic.com" required autoComplete="email" />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between ml-1">
                <label className="text-xs font-semibold text-gray-500">Password</label>
                <Link to="/forgot-password" className="text-xs text-brand-600 font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input type={show ? "text" : "password"} value={form.password}
                  onChange={set("password")} placeholder="••••••••"
                  required autoComplete="current-password" className="pr-12" />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                             w-8 h-8 flex items-center justify-center
                             text-gray-400 hover:text-gray-600 rounded-lg"
                  aria-label={show ? "Hide password" : "Show password"}>
                  <i className={`ti ${show ? "ti-eye-off" : "ti-eye"} text-base`} aria-hidden="true" />
                </button>
              </div>
            </div>

            <Button variant="primary" loading={loading} className="w-full mt-1 text-base py-3">
              Sign in
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-400 mt-5 pb-8">
          No account?{" "}
          <Link to="/register" className="text-brand-600 font-semibold">Register</Link>
        </p>
      </div>
    </div>
  );
};
