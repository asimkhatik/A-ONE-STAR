import React, { useState, useEffect } from "react";
import { User, Phone, MapPin, Mail, Save, Store } from "lucide-react";
import { getCurrentUser } from "../../lib/auth";
import { getLocalCustomers, saveCustomer } from "../../lib/firebase";
import { toast } from "sonner";

export const CustomerProfile = () => {
  const user = getCurrentUser();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [targetCustomer, setTargetCustomer] = useState(null);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
      setEmail(user.email || "");

      const custs = getLocalCustomers();
      let found = custs.find((c) => c.id === user.customer_id);
      if (!found && user.phone) {
        found = custs.find((c) => c.phone === user.phone);
      }
      if (!found && custs.length > 0) {
        found = custs[0];
      }

      if (found) {
        setTargetCustomer(found);
        if (found.name) setName(found.name);
        if (found.phone) setPhone(found.phone);
        if (found.address) setAddress(found.address);
      }
    }
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Shop name is required");
      return;
    }

    if (targetCustomer) {
      saveCustomer({
        ...targetCustomer,
        name: name.trim(),
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
      });
    }

    toast.success("Profile details updated successfully");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12 font-sans text-white">
      <div>
        <h1 className="font-heading text-2xl font-bold text-white flex items-center gap-2">
          <User className="w-7 h-7 text-amber-400" />
          <span>My Profile & Business Details</span>
        </h1>
        <p className="text-sm text-slate-400">View and update your shop contact info for invoices</p>
      </div>

      <form onSubmit={handleSave} className="bg-[#0f172a] p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
            Shop / Customer Name *
          </label>
          <div className="relative">
            <Store className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-[#18233c] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Registered Email (Account Login)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
              <input
                type="email"
                value={email}
                disabled
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#18233c] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-white focus:outline-none focus:border-amber-400 transition"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
            Shop Delivery Address
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Market Road, Shop No. 12"
              className="w-full bg-[#18233c] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="flex items-center space-x-2 bg-amber-400 hover:bg-amber-300 text-[#0b3d2e] font-extrabold px-6 py-2.5 rounded-xl shadow-lg transition active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Update Profile</span>
          </button>
        </div>
      </form>
    </div>
  );
};
