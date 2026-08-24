import React, { useState, useEffect } from "react";
import { 
  Settings as SettingsIcon, 
  Store, 
  Database, 
  MessageSquare, 
  Save, 
  CheckCircle2,
  Play
} from "lucide-react";
import { getLocalSettings, saveSettings } from "../../lib/firebase";
import { runDailyWhatsAppReminders } from "../../lib/whatsappReminder";
import { toast } from "sonner";

export const AdminSettings = () => {
  const [shopName, setShopName] = useState("");
  const [tagline, setTagline] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [upiId, setUpiId] = useState("");
  const [defaultRate, setDefaultRate] = useState("130");
  
  // WhatsApp Reminder Config
  const [reminderGlobal, setReminderGlobal] = useState(true);
  const [reminderTime, setReminderTime] = useState("09");

  useEffect(() => {
    const current = getLocalSettings();
    setShopName(current.shop_name || "A ONE STAR");
    setTagline(current.tagline || "Bharosa Bhi, Hisaab Bhi");
    setPhone(current.phone || "");
    setAddress(current.address || "");
    setUpiId(current.upi_id || "");
    setDefaultRate(String(current.default_rate_per_kg || 130));
    setReminderGlobal(current.reminder_enabled_global !== false);
    setReminderTime(current.reminder_time || "09");
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
      default_rate_per_kg: parseFloat(defaultRate) || 130,
      reminder_enabled_global: reminderGlobal,
      reminder_time: reminderTime
    });

    toast.success("Business settings & WhatsApp reminder schedule updated");
  };

  const handleRunRemindersNow = () => {
    const res = runDailyWhatsAppReminders();
    toast.success(`WhatsApp Reminders Triggered: ${res.successful} sent, ${res.skipped} skipped, ${res.failed} failed.`);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto font-sans text-white">
      {/* Title Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-white flex items-center gap-2">
          <SettingsIcon className="w-7 h-7 text-amber-400" />
          <span>Shop Settings & WhatsApp Configuration</span>
        </h1>
        <p className="text-sm text-slate-400">Configure business branding, live chicken rates, and WhatsApp reminder schedules</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Shop Branding Card (Dark Theme) */}
        <div className="bg-[#0f172a] p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 text-amber-400 border-b border-slate-800/80 pb-3">
            <Store className="w-5 h-5 text-amber-400" />
            <h3 className="font-heading font-bold text-lg text-white">Shop Profile & Branding</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Business / Shop Name *
              </label>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                required
                className="w-full bg-[#18233c] border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Tagline / Subtitle
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full bg-[#18233c] border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-[#18233c] border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                UPI ID for Online Payments
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="aonestar@upi"
                className="w-full bg-[#18233c] border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Shop Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Wholesale Poultry Market, Shop #4"
              className="w-full bg-[#18233c] border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Default Live Chicken Rate (₹ / kg)
            </label>
            <input
              type="number"
              value={defaultRate}
              onChange={(e) => setDefaultRate(e.target.value)}
              className="w-36 bg-[#18233c] border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-amber-400 transition"
            />
            <span className="text-xs text-slate-400 ml-2">Pre-fills when recording sales</span>
          </div>
        </div>

        {/* WhatsApp Reminders Settings Card (Dark Theme) */}
        <div className="bg-[#0f172a] p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center space-x-2 text-emerald-400">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
              <h3 className="font-heading font-bold text-lg text-white">WhatsApp Payment Reminders Configuration</h3>
            </div>

            <button
              type="button"
              onClick={handleRunRemindersNow}
              className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow transition"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run Reminders Now</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 bg-[#18233c] rounded-xl border border-slate-700/80">
              <div>
                <span className="text-xs font-bold text-white block">Global WhatsApp Reminders</span>
                <span className="text-[11px] text-slate-400 block">Enable/Disable automated reminders for all buyers</span>
              </div>
              <input
                type="checkbox"
                checked={reminderGlobal}
                onChange={(e) => setReminderGlobal(e.target.checked)}
                className="w-5 h-5 accent-amber-400 rounded cursor-pointer"
              />
            </div>

            <div className="p-4 bg-[#18233c] rounded-xl border border-slate-700/80 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Daily Scheduled Time</span>
                <span className="text-[11px] text-slate-400 block">Time to send daily balance reminders</span>
              </div>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="bg-[#0f172a] border border-slate-700 rounded-lg px-3 py-1.5 text-sm font-bold text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>

        {/* Database & Firebase Sync Status Card */}
        <div className="bg-[#0f172a] p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 text-emerald-400 border-b border-slate-800/80 pb-3">
            <Database className="w-5 h-5 text-emerald-400" />
            <h3 className="font-heading font-bold text-lg text-white">Database & Firebase Sync</h3>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-white">Firebase Cloud Storage Active</h4>
                <p className="text-xs text-emerald-300">
                  Data cached locally & synchronized in real-time with Firebase Cloud Firestore.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-600 text-white uppercase">
              Online Sync
            </span>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center space-x-2 bg-amber-400 hover:bg-amber-300 text-[#0b3d2e] font-extrabold px-6 py-3 rounded-xl shadow-lg transition active:scale-95"
          >
            <Save className="w-5 h-5" />
            <span>Save All Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
