import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { KeyRound, ArrowLeft, ShieldCheck, RefreshCw, Loader2 } from "lucide-react";
import { verifyMobileOtp, sendOtpToMobile } from "../../lib/auth";
import { getLocalSettings } from "../../lib/firebase";
import { toast } from "sonner";

export const VerifyOtp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const settings = getLocalSettings();

  const mobileNumber = location.state?.mobile || "9876543210";
  const [otp, setOtp] = useState("123456");
  const [timeLeft, setTimeLeft] = useState(60);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleResend = () => {
    try {
      sendOtpToMobile(mobileNumber);
      setTimeLeft(60);
      toast.success("New OTP sent to your mobile number");
    } catch (err) {
      toast.error(err.message || "Failed to resend OTP");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const user = verifyMobileOtp(mobileNumber, otp);
      toast.success(`OTP Verified Welcome, ${user.name}`);
      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setErrorMsg(err.message || "OTP verification failed.");
      toast.error(err.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070c18] text-white flex items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="bg-[#0f172a] border border-slate-800 rounded-3xl shadow-2xl max-w-md w-full p-8 sm-10 z-10 relative space-y-6">
        
        {/* Title */}
        <div className="text-center space-y-1">
          <Link to="/login" className="text-xs text-slate-400 hover-white flex items-center justify-center gap-1 mb-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Login</span>
          </Link>
          <h1 className="font-heading font-extrabold text-3xl text-white tracking-wide">
            Verify Mobile OTP
          </h1>
          <p className="text-xs text-slate-400">
            Enter the 6-digit code sent to <span className="font-bold text-amber-300">+91 {mobileNumber}</span>
          </p>
        </div>

        {/* Demo OTP Banner */}
        <div className="bg-blue-600/10 border border-blue-500/30 p-3 rounded-xl text-xs text-blue-300 text-center font-mono">
          💡 Demo Verification Code: <span className="font-bold text-white">123456</span>
        </div>

        {/* OTP Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/40 text-red-400 text-xs p-3 rounded-xl">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2 text-center">
              6-Digit Security Code
            </label>
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              className="w-full text-center tracking-[0.5em] text-2xl font-mono font-extrabold bg-[#18233c] border border-slate-700/80 rounded-2xl py-3.5 text-amber-300 focus-none focus-blue-500"
              placeholder="123456"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              {timeLeft > 0 ? `Resend code in ${timeLeft}s` : "Didn't receive code?"}
            </span>
            <button
              type="button"
              disabled={timeLeft > 0}
              onClick={handleResend}
              className={`font-bold transition ${
                timeLeft > 0 ? "text-slate-600 cursor-not-allowed" : "text-blue-400 hover"
              }`}
            >
              Resend OTP
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2563eb] hover-blue-500 text-white font-extrabold py-3.5 rounded-xl shadow-lg shadow-blue-600/25 transition duration-150 active-[0.99] text-base flex items-center justify-center space-x-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span>Verify & Sign In</span>
            )}
          </button>
        </form>

        {/* Footer Info */}
        <div className="border-t border-slate-800/80 pt-5 text-center space-y-1">
          <p className="text-[11px] text-slate-500 font-medium">
            © {new Date().getFullYear()} {settings.shop_name.toUpperCase()}. All Rights Reserved.
          </p>
        </div>

      </div>
    </div>
  );
};
