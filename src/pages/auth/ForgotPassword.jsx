import React, { useState } from "react";
import { Link } from "react-router-dom";
import { KeyRound, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSent(true);
    toast.success("Password reset instructions sent to your email");
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative font-sans">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 z-10">
        <div className="bg-brand-900 text-white p-6 text-center border-b border-emerald-800 relative">
          <Link
            to="/login"
            className="absolute left-4 top-4 text-emerald-300 hover-white p-1 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-brand-950 flex items-center justify-center font-bold text-xl mx-auto shadow-md mb-2">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="font-heading font-extrabold text-2xl text-white">
            Reset Password
          </h2>
          <p className="text-xs text-amber-300 mt-1 uppercase font-semibold">
            Customer Self-Service
          </p>
        </div>

        <div className="p-6 space-y-4">
          {sent ? (
            <div className="text-center space-y-3 py-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="font-bold text-slate-900 text-lg">Check Your Email</h3>
              <p className="text-xs text-slate-600">
                We sent password reset instructions to <span className="font-bold">{email}</span>. Please check your inbox or contact shop admin.
              </p>
              <Link
                to="/login"
                className="inline-block mt-2 bg-brand-900 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow"
              >
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-slate-600">
                Enter your registered customer email address and we will send you instructions to reset your password.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-sm font-medium focus-2 focus-emerald-500"
                    placeholder="your-email@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-700 hover-emerald-600 text-white font-bold py-3 rounded-xl shadow-md transition text-sm"
              >
                Send Reset Link
              </button>

              <div className="text-center pt-2">
                <Link to="/login" className="text-xs font-semibold text-slate-600 hover">
                  ← Return to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
