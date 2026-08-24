import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  CreditCard, 
  BarChart3, 
  Settings, 
  PlusCircle, 
  DollarSign,
  Bird,
  UserCheck,
  ShieldAlert,
  ChevronDown
} from "lucide-react";
import { 
  getLocalSettings, 
  getActiveRole, 
  setActiveRole, 
  getActiveCustomerId, 
  subscribeToStore 
} from "../lib/firebase";

export const AppHeader = ({
  onOpenSaleModal,
  onOpenPaymentModal
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [settings, setSettings] = useState(getLocalSettings());
  const [role, setRole] = useState(getActiveRole());
  const [activeCustId, setActiveCustId] = useState(getActiveCustomerId());

  const loadData = () => {
    setSettings(getLocalSettings());
    setRole(getActiveRole());
    setActiveCustId(getActiveCustomerId());
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToStore(loadData);
    return () => unsubscribe();
  }, []);

  const toggleRole = (newRole) => {
    setActiveRole(newRole);
    setRole(newRole);
    if (newRole === 'customer') {
      navigate('/portal');
    } else {
      navigate('/');
    }
  };

  const adminNavItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Customers", path: "/admin/customers", icon: Users },
    { label: "Sales", path: "/admin/sales", icon: ShoppingCart },
    { label: "Payments", path: "/admin/payments", icon: CreditCard },
    { label: "Reports", path: "/admin/reports", icon: BarChart3 },
    { label: "Settings", path: "/admin/settings", icon: Settings },
  ];

  const customerNavItems = [
    { label: "Portal", path: "/portal", icon: UserCheck },
    { label: "Ledger", path: `/customers/${activeCustId}`, icon: ShoppingCart },
  ];

  const currentNavItems = role === 'admin' ? adminNavItems : customerNavItems;

  return (
    <header className="bg-brand-900 text-white shadow-lg sticky top-0 z-40">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm-6 lg-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand Name */}
          <Link to={role === 'admin' ? '/' : '/portal'} className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-brand-950 flex items-center justify-center font-bold text-xl shadow-md group-hover-105 transition-transform">
              <Bird className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-heading font-extrabold text-xl sm-2xl tracking-wide text-white">
                  {settings.shop_name.toUpperCase()}
                </span>
                <span className="bg-amber-400/20 text-amber-300 text-xs px-2 py-0.5 rounded-full border border-amber-400/30 font-medium">
                  POULTRY
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 hidden sm">
                {settings.tagline || "Poultry Business Management"}
              </p>
            </div>
          </Link>

          {/* Role Switcher & Action Buttons */}
          <div className="flex items-center space-x-2 sm-x-3">
            {/* Role Switcher Selector */}
            <div className="bg-emerald-950/80 p-1 rounded-xl border border-emerald-700/50 flex items-center">
              <button
                onClick={() => toggleRole('admin')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                  role === 'admin'
                    ? "bg-amber-400 text-brand-950 shadow"
                    : "text-emerald-200 hover-white"
                }`}
              >
                👑 Admin
              </button>
              <button
                onClick={() => toggleRole('customer')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                  role === 'customer'
                    ? "bg-amber-400 text-brand-950 shadow"
                    : "text-emerald-200 hover-white"
                }`}
              >
                👤 Customer
              </button>
            </div>

            {/* Quick Action Buttons (Visible in Admin Mode) */}
            {role === 'admin' && (
              <>
                <button
                  onClick={onOpenSaleModal}
                  className="hidden sm items-center space-x-1.5 bg-amber-500 hover-amber-400 text-brand-950 font-semibold text-xs sm-sm px-3 sm-4 py-2 rounded-lg shadow transition active-95"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ Record Sale</span>
                </button>
                <button
                  onClick={onOpenPaymentModal}
                  className="hidden sm items-center space-x-1.5 bg-emerald-700 hover-emerald-600 text-white font-medium text-xs sm-sm px-3 sm-4 py-2 rounded-lg border border-emerald-500/50 shadow transition active-95"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>+ Payment</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <nav className="flex space-x-1 sm-x-4 overflow-x-auto py-2 border-t border-emerald-800/60 no-scrollbar">
          {currentNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-md text-xs sm-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-emerald-800 text-amber-300 font-semibold shadow-inner"
                    : "text-emerald-100 hover-emerald-800/40 hover-white"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-amber-300" : "text-emerald-300"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
