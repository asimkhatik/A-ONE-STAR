import React, { useState, useEffect } from "react";
import { X, UserPlus, UserCheck } from "lucide-react";
import { saveCustomer } from "../lib/firebase";
import { getTodayString } from "../lib/utils";
import { toast } from "sonner";

export const CustomerFormModal = ({
  isOpen,
  onClose,
  customerToEdit,
  onSuccess
}) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState("active");
  const [openingBalance, setOpeningBalance] = useState("0");
  const [openingBalanceDate, setOpeningBalanceDate] = useState(getTodayString());
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (customerToEdit) {
        setName(customerToEdit.name || "");
        setPhone(customerToEdit.phone || "");
        setAddress(customerToEdit.address || "");
        setStatus(customerToEdit.status || "active");
        setOpeningBalance(String(customerToEdit.opening_balance || 0));
        setOpeningBalanceDate(customerToEdit.opening_balance_date || getTodayString());
        setNotes(customerToEdit.opening_balance_notes || "");
      } else {
        setName("");
        setPhone("");
        setAddress("");
        setStatus("active");
        setOpeningBalance("0");
        setOpeningBalanceDate(getTodayString());
        setNotes("");
      }
    }
  }, [isOpen, customerToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Customer name is required");
      return;
    }

    try {
      saveCustomer({
        id: customerToEdit ? customerToEdit.id : undefined,
        name: name.trim(),
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        status: status,
        opening_balance: parseFloat(openingBalance) || 0,
        opening_balance_date: openingBalanceDate,
        opening_balance_notes: notes.trim() || undefined
      });

      toast.success(
        customerToEdit
          ? `Customer "${name.trim()}" updated successfully`
          : `Customer "${name.trim()}" added successfully`
      );

      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err.message || "Failed to save customer");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in-down">
      <div className="bg-[#0f172a] text-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-800 animate-pop-in">
        {/* Modal Header */}
        <div className="bg-[#0b3d2e] px-6 py-4 flex items-center justify-between border-b border-emerald-800/80">
          <div className="flex items-center space-x-2">
            {customerToEdit ? (
              <UserCheck className="w-5 h-5 text-amber-400" />
            ) : (
              <UserPlus className="w-5 h-5 text-amber-400" />
            )}
            <h3 className="font-heading text-lg font-bold text-white">
              {customerToEdit ? "Edit Customer Record" : "Add New Wholesale Customer"}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="text-emerald-200 hover:text-white p-1 rounded-lg hover:bg-emerald-800/60 transition active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 font-sans">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Shop / Customer Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Al-Madina Chicken Shop"
              required
              className="w-full bg-[#18233c] border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Phone / Mobile
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543210"
                className="w-full bg-[#18233c] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Status *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-[#18233c] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-amber-400 transition"
              >
                <option value="active">Active Buyer</option>
                <option value="inactive">Inactive / Paused</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Shop / Delivery Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Wholesale Poultry Yard, Shop No. 14"
              className="w-full bg-[#18233c] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
            />
          </div>

          <div className="border-t border-slate-800 pt-3">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-2">
              Opening Balance Details
            </span>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Opening Balance (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={openingBalance}
                  onChange={(e) => setOpeningBalance(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-[#18233c] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  As of Date
                </label>
                <input
                  type="date"
                  value={openingBalanceDate}
                  onChange={(e) => setOpeningBalanceDate(e.target.value)}
                  className="w-full bg-[#18233c] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-amber-400 transition"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-bold text-xs hover:bg-slate-800 transition active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-[#0b3d2e] font-extrabold text-xs rounded-xl shadow-lg transition active:scale-95"
            >
              {customerToEdit ? "Update Customer" : "Save New Customer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
