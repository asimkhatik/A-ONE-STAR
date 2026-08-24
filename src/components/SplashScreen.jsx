import React, { useEffect, useState } from "react";

export const SplashScreen = ({ onFinish }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setFadeOut(true);
    }, 1800);

    const timer2 = setTimeout(() => {
      if (onFinish) onFinish();
    }, 2300);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[100] bg-[#070c18] text-white flex flex-col items-center justify-center p-6 transition-opacity duration-500 ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Background Radial Glow */}
      <div className="absolute w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Logo Container */}
      <div className="relative z-10 flex flex-col items-center space-y-6 text-center animate-fade-in">
        <div className="w-32 h-32 sm-40 sm-40 rounded-3xl p-2 bg-[#0f172a] border border-amber-400/30 shadow-2xl shadow-blue-900/50 overflow-hidden flex items-center justify-center transform hover-105 transition">
          <img
            src="/logo.jpg"
            alt="A ONE STAR Logo"
            className="w-full h-full object-cover rounded-2xl"
          />
        </div>

        <div className="space-y-1.5">
          <h1 className="font-heading font-extrabold text-3xl sm-4xl text-white tracking-wide">
            Welcome to A ONE STAR
          </h1>
          <p className="text-base font-semibold text-amber-400">
            Bharosa Bhi, Hisaab Bhi
          </p>
        </div>

        {/* Loading Progress Bar */}
        <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-4">
          <div className="h-full bg-gradient-to-r from-blue-500 via-amber-400 to-blue-500 w-full animate-pulse rounded-full" />
        </div>
      </div>
    </div>
  );
};
