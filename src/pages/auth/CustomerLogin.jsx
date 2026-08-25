import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser, getCurrentUser } from "../../lib/auth";
import { getLocalSettings } from "../../lib/firebase";
import { toast } from "sonner";

export const CustomerLogin = () => {
  const navigate = useNavigate();
  const settings = getLocalSettings();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const existingUser = getCurrentUser();
    if (existingUser) {
      if (existingUser.role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email.trim() || !password) {
      setErrorMsg("Please enter both email address and password.");
      return;
    }

    setLoading(true);

    try {
      const user = loginUser(email, password);
      
      if (user.role === "admin") {
        toast.success(`Welcome Admin, ${user.name}!`);
        navigate("/admin/dashboard", { replace: true });
      } else {
        toast.success(`Welcome back, ${user.name}!`);
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      setErrorMsg(err.message || "Invalid credentials.");
      toast.error(err.message || "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070c18] text-white flex items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Animated Glowing Ambient Aura */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-float" />

      {/* Main Animated Card */}
      <div className="bg-[#0f172a]/95 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl max-w-md w-full p-8 sm:p-10 z-10 relative space-y-6 animate-pop-in">
        
        {/* Title */}
        <div className="text-center space-y-1.5 animate-fade-in-down">
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-white tracking-tight flex items-center justify-center gap-2">
            <span>Welcome Back</span>
            <span className="text-3xl animate-bounce">👋</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium">
            Sign in with your Email & Password to access your portal
          </p>
        </div>

        {/* Animated Navigation Tabs */}
        <div className="bg-[#162036] p-1.5 rounded-2xl flex items-center border border-slate-700/50 shadow-inner">
          <button
            type="button"
            className="flex-1 py-2.5 text-xs sm:text-sm font-bold bg-[#2563eb] text-white rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-1.5 transition-all duration-200"
          >
            <span>🔐</span>
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => navigate("/register")}
            className="flex-1 py-2.5 text-xs sm:text-sm font-semibold text-slate-400 hover:text-white rounded-xl transition-all duration-200 flex items-center justify-center space-x-1.5 hover:bg-slate-800/40"
          >
            <span>✨</span>
            <span>New Customer Signup</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/40 text-red-400 text-xs p-3 rounded-xl font-medium animate-fade-in-down">
              {errorMsg}
            </div>
          )}

          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300">
              Email Address *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full bg-[#18233c] border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-medium transition-all duration-200"
              placeholder="name@example.com"
            />
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-300">
                Password *
              </label>
              <Link 
                to="/forgot-password" 
                className="text-xs text-slate-400 hover:text-blue-400 font-medium flex items-center gap-1 transition-colors"
              >
                <span>🔑</span>
                <span>Forgot Password?</span>
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full bg-[#18233c] border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-medium transition-all duration-200"
              placeholder="••••••••"
            />
          </div>

          {/* Animated Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2563eb] hover:bg-blue-500 active:scale-[0.98] text-white font-extrabold py-3.5 rounded-xl shadow-lg shadow-blue-600/30 transition-all duration-200 text-base mt-2 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            ) : (
              <span>Secure Sign In</span>
            )}
          </button>
        </form>

        {/* Footer Info */}
        <div className="border-t border-slate-800/80 pt-5 text-center space-y-1">
          <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5 font-medium">
            <span>📍</span>
            <span>{settings.address || "Main Wholesale Market Yard"} • {settings.phone || "+91 9876543210"}</span>
          </p>
          <p className="text-[11px] text-slate-500 font-medium">
            © {new Date().getFullYear()} {settings.shop_name || "A ONE STAR"}. All Rights Reserved.
          </p>
        </div>

      </div>
    </div>
  );
};
