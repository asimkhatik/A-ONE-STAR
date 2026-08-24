import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerCustomer } from "../../lib/auth";
import { getLocalSettings } from "../../lib/firebase";
import { toast } from "sonner";

export const CustomerRegister = () => {
  const navigate = useNavigate();
  const settings = getLocalSettings();

  const [shopName, setShopName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!shopName.trim() || !email.trim() || !password) {
      setErrorMsg("Please fill out all required fields.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const user = registerCustomer({
        name: shopName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        password: password,
      });

      toast.success(`Account created Welcome, ${user.name}`);
      navigate("/dashboard");
    } catch (err) {
      setErrorMsg(err.message || "Failed to register.");
      toast.error(err.message || "Registration Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070c18] text-white flex items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Card */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-3xl shadow-2xl max-w-md w-full p-8 sm-10 z-10 relative space-y-6">
        
        {/* Title & Subtitle Requested by User */}
        <div className="text-center space-y-1">
          <h1 className="font-heading font-extrabold text-3xl text-white tracking-wide">
            A ONE STAR
          </h1>
          <p className="text-sm font-semibold text-amber-400">
            Bharosa Bhi, Hisaab Bhi
          </p>
        </div>

        {/* Simple Top Pills Switcher */}
        <div className="bg-[#162036] p-1.5 rounded-2xl flex items-center border border-slate-700/50">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="flex-1 py-2.5 text-xs sm-sm font-semibold text-slate-400 hover-white rounded-xl transition flex items-center justify-center space-x-1.5"
          >
            <span>🔐</span>
            <span>Sign In</span>
          </button>

          <button
            type="button"
            className="flex-1 py-2.5 text-xs sm-sm font-bold bg-[#2563eb] text-white rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-1.5"
          >
            <span>✨</span>
            <span>New Customer Signup</span>
          </button>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/40 text-red-400 text-xs p-3 rounded-xl">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Shop / Customer Name *
            </label>
            <input
              type="text"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              required
              className="w-full bg-[#18233c] border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus-none focus-blue-500"
              placeholder="e.g. Al-Madina Chicken Shop"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Email Address *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#18233c] border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus-none focus-blue-500"
              placeholder="name@example.com"
            />
          </div>

          <div className="grid grid-cols-1 sm-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Mobile Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#18233c] border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus-none focus-blue-500"
                placeholder="9876543210"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Password *
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-[#18233c] border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus-none focus-blue-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Delivery Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-[#18233c] border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus-none focus-blue-500"
              placeholder="Market Road, Shop No. 12"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2563eb] hover-blue-500 text-white font-extrabold py-3.5 rounded-xl shadow-lg shadow-blue-600/25 transition duration-150 active-[0.99] text-base mt-2"
          >
            {loading ? "Creating Account..." : "Create Account & Sign In"}
          </button>
        </form>

        {/* Footer Info */}
        <div className="border-t border-slate-800/80 pt-5 text-center space-y-1">
          <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5 font-medium">
            <span>📍</span>
            <span>{settings.address || "Main Wholesale Market Yard"} • {settings.phone || "+91 9876543210"}</span>
          </p>
          <p className="text-[11px] text-slate-500 font-medium">
            © {new Date().getFullYear()} A ONE STAR. All Rights Reserved.
          </p>
        </div>

      </div>
    </div>
  );
};
