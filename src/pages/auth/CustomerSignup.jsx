import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerCustomer } from "../../lib/auth";
import { getLocalSettings } from "../../lib/firebase";
import { toast } from "sonner";

export const CustomerSignup = () => {
  const navigate = useNavigate();
  const settings = getLocalSettings();

  const [shopName, setShopName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!shopName.trim()) {
      setErrorMsg("Please enter your Shop or Customer Name.");
      return;
    }

    if (!email.trim() || !password) {
      setErrorMsg("Email address and password are required.");
      return;
    }

    setLoading(true);
    try {
      const user = registerCustomer({
        name: shopName.trim(),
        email: email.trim(),
        phone: mobile.trim() || undefined,
        address: address.trim() || undefined,
        password: password,
      });

      toast.success(`Registration successful! Welcome, ${user.name}`);
      navigate("/dashboard");
    } catch (err) {
      setErrorMsg(err.message || "Registration failed.");
      toast.error(err.message || "Registration Error");
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
        
        {/* Logo & Brand Header */}
        <div className="text-center space-y-2 animate-fade-in-down">
          {/* Logo Badge */}
          <div className="flex justify-center mb-3">
            <div className="w-20 h-20 rounded-2xl bg-slate-900 p-1 border-2 border-amber-400/50 shadow-2xl shadow-amber-400/20 overflow-hidden shrink-0 animate-pulse-glow">
              <img
                src="/logo.jpg"
                alt="A ONE STAR Logo"
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
          </div>

          {/* Shop Name */}
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-white tracking-wide">
            A ONE STAR
          </h1>

          {/* Tagline */}
          <p className="text-xs sm:text-sm font-bold text-amber-400 tracking-wider uppercase">
            Bharosa Bhi, Hisaab Bhi
          </p>
        </div>

        {/* Animated Navigation Tabs */}
        <div className="bg-[#162036] p-1.5 rounded-2xl flex items-center border border-slate-700/50 shadow-inner">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="flex-1 py-2.5 text-xs sm:text-sm font-semibold text-slate-400 hover:text-white rounded-xl transition-all duration-200 flex items-center justify-center space-x-1.5 hover:bg-slate-800/40"
          >
            <span>🔐</span>
            <span>Sign In</span>
          </button>

          <button
            type="button"
            className="flex-1 py-2.5 text-xs sm:text-sm font-bold bg-[#2563eb] text-white rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-1.5 transition-all duration-200"
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

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-300">
              Shop / Customer Name *
            </label>
            <input
              type="text"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              required
              className="w-full bg-[#18233c] border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-medium transition-all duration-200"
              placeholder="e.g. Al-Madina Chicken Shop"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-300">
              Email Address *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#18233c] border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-medium transition-all duration-200"
              placeholder="name@example.com"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-300">
              Password *
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-[#18233c] border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-medium transition-all duration-200"
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-300">
              Mobile Number (Contact Phone)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-slate-400 font-bold text-sm">+91</span>
              <input
                type="tel"
                maxLength={10}
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[#18233c] border border-slate-700/80 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                placeholder="9876543210"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-300">
              Shop Delivery Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-[#18233c] border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-medium transition-all duration-200"
              placeholder="Market Road, Shop No. 12"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2563eb] hover:bg-blue-500 active:scale-[0.98] text-white font-extrabold py-3.5 rounded-xl shadow-lg shadow-blue-600/30 transition-all duration-200 text-base mt-2 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            ) : (
              <span>Create Account & Sign In</span>
            )}
          </button>
        </form>

        {/* Footer Info */}
        <div className="border-t border-slate-800/80 pt-5 text-center space-y-1.5 font-sans">
          <p className="text-xs text-slate-300 font-medium flex items-center justify-center gap-1.5 px-2">
            <span className="shrink-0">📍</span>
            <span className="break-words">Nath pai circle, Shahapur, Belagavi, Karnataka 590005</span>
          </p>

          <p className="text-xs text-slate-200 font-bold tracking-wide flex items-center justify-center gap-1.5">
            <span className="shrink-0">📞</span>
            <span className="whitespace-nowrap">+91 9035126865</span>
          </p>

          <p className="text-[11px] text-slate-400 font-medium pt-0.5">
            © {new Date().getFullYear()} A ONE STAR. All Rights Reserved.
          </p>
        </div>

      </div>
    </div>
  );
};
