import React, { useState, useEffect } from "react";
import { 
  Settings as SettingsIcon, 
  Store, 
  Database, 
  ShieldCheck, 
  Save, 
  Smartphone, 
  HelpCircle,
  CheckCircle2
} from "lucide-react";
import { getLocalSettings, saveSettings } from "../lib/firebase";
import { toast } from "sonner";

export const Settings = () => {
  const [shopName, setShopName] = useState("");
  const [tagline, setTagline] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [upiId, setUpiId] = useState("");
  const [defaultRate, setDefaultRate] = useState("130");

  useEffect(() => {
    const current = getLocalSettings();
    setShopName(current.shop_name || "A ONE STAR");
    setTagline(current.tagline || "Poultry Business Management");
    setPhone(current.phone || "");
    setAddress(current.address || "");
    setUpiId(current.upi_id || "");
    setDefaultRate(String(current.default_rate_per_kg || 130));
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    if (!shopName.trim()) {
      toast.error("Shop name is required");
      return;
    }

    saveSettings({
      shop_name: shopName.trim(),
      tagline: tagline.trim(),
      phone: phone.trim(),
      address: address.trim(),
      upi_id: upiId.trim(),
      default_rate_per_kg: parseFloat(defaultRate) || 130
    });

    toast.success("Business profile & settings updated successfully");
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Title Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-slate-900 flex items-center gap-2">
          <SettingsIcon className="w-7 h-7 text-emerald-700" />
          <span>Business Settings & Configuration</span>
        </h1>
        <p className="text-sm text-slate-500">Configure your shop branding, default rates, and database synchronization</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Shop Branding Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-brand-900 border-b border-slate-100 pb-3">
            <Store className="w-5 h-5 text-amber-500" />
            <h3 className="font-heading font-bold text-lg text-slate-900">Shop Profile & Branding</h3>
          </div>

          <div className="grid grid-cols-1 md-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Business / Shop Name *
              </label>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                required
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus-2 focus-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Tagline / Subtitle
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus-2 focus-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus-2 focus-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                UPI ID for Bill Payments
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="aonestar@upi"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus-2 focus-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Shop Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Wholesale Poultry Market, Shop #4"
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus-2 focus-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Default Live Chicken Rate (₹ / kg)
            </label>
            <input
              type="number"
              value={defaultRate}
              onChange={(e) => setDefaultRate(e.target.value)}
              className="w-36 px-3.5 py-2 border border-slate-300 rounded-xl text-sm font-bold focus-2 focus-emerald-500"
            />
            <span className="text-xs text-slate-500 ml-2">Pre-fills when recording sales</span>
          </div>
        </div>

        {/* Firebase & Database Sync Status Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-brand-900 border-b border-slate-100 pb-3">
            <Database className="w-5 h-5 text-emerald-700" />
            <h3 className="font-heading font-bold text-lg text-slate-900">Database & Firebase Sync</h3>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-emerald-950">Firebase Storage Active</h4>
                <p className="text-xs text-emerald-800">
                  Data is cached locally & synchronized with Firebase Cloud Firestore.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-700 text-white uppercase">
              Online Sync
            </span>
          </div>
        </div>

        {/* Save Changes Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center space-x-2 bg-amber-400 hover-amber-300 text-brand-950 font-bold px-6 py-3 rounded-xl shadow-md transition active-95"
          >
            <Save className="w-5 h-5" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
