import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  CreditCard, 
  User as UserIcon, 
  LogOut 
} from "lucide-react";
import { logout, getCurrentUser } from "../lib/auth";
import { getLocalSettings } from "../lib/firebase";
import { toast } from "sonner";

export const CustomerLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getCurrentUser();
  const settings = getLocalSettings();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const navItems = [
    { label: "My Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { label: "My Sales History", icon: ShoppingCart, path: "/dashboard/purchases" },
    { label: "Payment History", icon: CreditCard, path: "/dashboard/payments" },
    { label: "Profile & Settings", icon: UserIcon, path: "/dashboard/profile" },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-[#0b3d2e] border-b border-emerald-800/80 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          
          {/* Brand Header with Official Logo */}
          <Link to="/dashboard" className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 p-0.5 border border-amber-400/40 shadow overflow-hidden shrink-0">
              <img
                src="/logo.jpg"
                alt="A ONE STAR Logo"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div>
              <span className="font-heading font-extrabold text-lg text-white tracking-wide block leading-tight">
                {settings.shop_name || "A ONE STAR"}
              </span>
              <span className="text-[10px] font-semibold text-amber-400 block">
                {settings.tagline || "Bharosa Bhi, Hisaab Bhi"}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                    isActive
                      ? "bg-amber-400 text-[#0b3d2e] shadow-lg shadow-amber-400/20"
                      : "text-emerald-100 hover:bg-emerald-800/60 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Status & Sign Out */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2 text-xs font-semibold text-emerald-200 bg-emerald-900/60 px-3 py-1.5 rounded-xl border border-emerald-800">
              <span>👤 {user?.name || "Customer"}</span>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-emerald-200 hover:text-red-300 hover:bg-red-500/20 border border-emerald-800 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden border-t border-emerald-800/60 bg-[#082a20] px-2 py-1.5 flex items-center justify-around overflow-x-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center py-1 px-2.5 rounded-lg text-[10px] font-bold transition shrink-0 ${
                  isActive ? "text-amber-400" : "text-emerald-200 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4 mb-0.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </header>

      {/* Main Page Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[#071f17] border-t border-emerald-900 text-center py-4 text-xs text-emerald-400 space-y-1">
        <p>© {new Date().getFullYear()} {settings.shop_name || "A ONE STAR"} • {settings.tagline || "Bharosa Bhi, Hisaab Bhi"}</p>
        <p className="text-[10px] font-extrabold text-amber-400 tracking-wider uppercase">Developed by ASIM KHATIK</p>
      </footer>
    </div>
  );
};
