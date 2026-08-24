import React from "react";
import { Link } from "react-router-dom";
import { 
  Bird, 
  ShieldCheck, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  TrendingUp, 
  CreditCard, 
  FileText 
} from "lucide-react";
import { getLocalSettings } from "../lib/firebase";

export const LandingPage = () => {
  const settings = getLocalSettings();

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans flex flex-col justify-between relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="max-w-7xl mx-auto px-6 py-6 w-full flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-400 text-brand-950 flex items-center justify-center font-bold text-2xl shadow-lg">
            <Bird className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div>
            <span className="font-heading font-extrabold text-2xl tracking-wide text-white block">
              {settings.shop_name.toUpperCase()}
            </span>
            <span className="text-xs text-amber-300 font-semibold tracking-wider uppercase block">
              {settings.tagline || "Poultry Business Management"}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/login"
            className="text-xs sm-sm font-semibold text-emerald-200 hover-white px-3 py-2 transition"
          >
            Customer Sign In
          </Link>
          <Link
            to="/admin/login"
            className="text-xs sm-sm font-bold bg-amber-400 hover-amber-300 text-brand-950 px-4 py-2 rounded-xl shadow transition"
          >
            Admin Portal
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-12 text-center z-10 flex-1 flex flex-col justify-center">
        <div className="inline-flex items-center space-x-2 bg-emerald-800/40 border border-emerald-500/30 text-amber-300 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6 mx-auto">
          <span>Enterprise Poultry & Live Broiler Sales Management</span>
        </div>

        <h1 className="font-heading text-4xl sm-6xl font-extrabold tracking-tight text-white leading-tight max-w-4xl mx-auto">
          Manage Daily Broiler Chicken Sales, Ledgers & Payments Effortlessly
        </h1>
        <p className="text-base sm-lg text-slate-300 max-w-2xl mx-auto mt-4">
          Complete dual-portal solution for shop owners and wholesale buyers. Track live weight, automated bills, UPI payments, and instant PDF statements.
        </p>

        {/* Dual Portal Selection Cards */}
        <div className="grid grid-cols-1 md-cols-2 gap-6 max-w-3xl mx-auto mt-12 w-full text-left">
          {/* Customer Portal Card */}
          <div className="bg-slate-800/90 border border-slate-700 hover-emerald-500 rounded-3xl p-6 sm-8 shadow-2xl transition group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xl group-hover-110 transition-transform">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-2xl text-white">Customer Portal</h3>
                <p className="text-xs sm-sm text-slate-400 mt-1">
                  For wholesale buyers and shops to view purchases, check outstanding bills, pay via UPI, and download PDF receipts.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>View live outstanding bill balance</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Pay bills instantly via GPay / PhonePe UPI</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Download itemized ledger statement PDFs</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 flex items-center space-x-3">
              <Link
                to="/login"
                className="flex-1 flex items-center justify-center space-x-2 bg-emerald-600 hover-emerald-500 text-white font-bold py-3 rounded-xl shadow-lg transition"
              >
                <span>Customer Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/register"
                className="flex-1 flex items-center justify-center space-x-2 bg-slate-700 hover-slate-600 text-white font-semibold py-3 rounded-xl transition text-xs"
              >
                <span>New Register</span>
              </Link>
            </div>
          </div>

          {/* Admin Portal Card */}
          <div className="bg-slate-800/90 border border-slate-700 hover-amber-400 rounded-3xl p-6 sm-8 shadow-2xl transition group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold text-xl group-hover-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-2xl text-white">Admin Management</h3>
                <p className="text-xs sm-sm text-slate-400 mt-1">
                  For shop owners & admins to record daily sales, manage customer accounts, collect payments, and view analytics.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Record live chicken weight & daily rates</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Manage customer accounts & activation status</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Full business analytics & Excel reports</span>
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <Link
                to="/admin/login"
                className="w-full flex items-center justify-center space-x-2 bg-amber-400 hover-amber-300 text-brand-950 font-extrabold py-3 rounded-xl shadow-lg transition"
              >
                <ShieldCheck className="w-4 h-4 text-brand-950" />
                <span>Admin Login Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-6 w-full text-center text-xs text-slate-500 z-10 border-t border-slate-800">
        © {new Date().getFullYear()} {settings.shop_name}. All rights reserved. Powered by Firebase.
      </footer>
    </div>
  );
};
