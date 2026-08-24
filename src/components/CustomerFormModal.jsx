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
        opening_balance_notes: openingBalanceNotes.trim() || undefined
      });

      toast.success(
        customerToEdit
          ? `Customer "${name}" updated successfully`
          : `Customer "${name}" created successfully`
      );

      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error("Error saving customer: " + err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="bg-brand-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {customerToEdit ? <UserCheck className="w-5 h-5 text-amber-400" /> : <UserPlus className="w-5 h-5 text-amber-400" />}
            <h3 className="font-heading text-lg font-bold">
              {customerToEdit ? "Edit Customer Details" : "Add New Customer / Buyer"}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="text-emerald-200 hover-white p-1 rounded-lg hover-emerald-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Customer / Shop Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Al-Madina Chicken Center"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus-2 focus-emerald-500 focus-emerald-500 text-sm font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus-2 focus-emerald-500 focus-emerald-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Account Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value )}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus-2 focus-emerald-500 focus-emerald-500 text-sm"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Address / Area
            </label>
            <input
              type="text"
              placeholder="e.g. Main Market, Shop #15"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus-2 focus-emerald-500 focus-emerald-500 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Opening Balance (₹)
              </label>
              <input
                type="number"
                step="1"
                placeholder="0"
                value={openingBalance}
                onChange={(e) => setOpeningBalance(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus-2 focus-emerald-500 focus-emerald-500 text-sm font-semibold"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                + Positive if customer owes money
              </span>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                As Of Date
              </label>
              <input
                type="date"
                value={openingBalanceDate}
                onChange={(e) => setOpeningBalanceDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus-2 focus-emerald-500 focus-emerald-500 text-sm"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover-slate-900 bg-slate-100 hover-slate-200 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-bold text-brand-950 bg-amber-400 hover-amber-300 rounded-lg shadow-md transition"
            >
              {customerToEdit ? "Save Changes" : "Create Customer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
