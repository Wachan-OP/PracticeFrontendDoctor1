import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import { registerThunk, clearError } from "../../store/slices/authSlice";
import { Button } from "../../components/ui/Button";

export const RegisterPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((s) => s.auth);

  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "",
    qualification: "", registrationNo: "", clinicName: "Navodaya Clinic",
  });
  const [show, setShow] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(clearError());
    setForm((f) => ({ ...f, [k]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(registerThunk(form));
    if (registerThunk.fulfilled.match(result)) navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-brand-600 flex items-center justify-center mb-3">
            <i className="ti ti-stethoscope text-white text-2xl" aria-hidden="true" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900">MedFit</h1>
          <p className="text-sm text-gray-400 mt-0.5">Create your doctor account</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg mb-4 text-sm text-red-700">
              <i className="ti ti-alert-circle flex-shrink-0" aria-hidden="true" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">

            {/* Section: Account */}
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest pt-1">Account</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500">Full name</label>
                <input type="text" value={form.name} onChange={set("name")} placeholder="Dr. R. S. Patil" required />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500">Email</label>
                <input type="email" value={form.email} onChange={set("email")} placeholder="doctor@clinic.com" required />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500">Mobile number</label>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 flex-shrink-0">+91</span>
                  <input type="tel" value={form.phone} onChange={set("phone")} placeholder="9876543210" required maxLength={10} pattern="[6-9]\d{9}" />
                </div>
              </div>
              <div className="col-span-2 flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500">Password</label>
                <div className="relative">
                  <input type={show ? "text" : "password"} value={form.password} onChange={set("password")}
                    placeholder="Min 8 chars, uppercase, number, special char" required className="pr-10" />
                  <button type="button" onClick={() => setShow(!show)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <i className={`ti ${show ? "ti-eye-off" : "ti-eye"} text-sm`} aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>

            {/* Section: Professional */}
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest pt-2">Professional details</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500">Qualification</label>
                <input type="text" value={form.qualification} onChange={set("qualification")} placeholder="M.B.B.S." />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500">Registration No.</label>
                <input type="text" value={form.registrationNo} onChange={set("registrationNo")} placeholder="Reg. No. 2007040750" />
              </div>
              <div className="col-span-2 flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500">Clinic name</label>
                <input type="text" value={form.clinicName} onChange={set("clinicName")} placeholder="Navodaya Clinic" />
              </div>
            </div>

            <Button variant="primary" loading={loading} className="w-full justify-center mt-2">
              Create account
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-400 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-brand-600 hover:text-brand-800 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
};
