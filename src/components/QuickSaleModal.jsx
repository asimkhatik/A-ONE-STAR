import React, { useState, useEffect } from "react";
import { X, ShoppingCart, Calculator } from "lucide-react";
import { addSale, getLocalCustomers, getLocalSettings } from "../lib/firebase";
import { getTodayString, formatCurrency } from "../lib/utils";
import { toast } from "sonner";

export const QuickSaleModal = ({
  isOpen,
  onClose,
  preselectedCustomerId,
  onSuccess
}) => {
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [saleDate, setSaleDate] = useState(getTodayString());
  const [birdsCount, setBirdsCount] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [ratePerKg, setRatePerKg] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (isOpen) {
      const custs = getLocalCustomers().filter(c => c.status === "active");
      setCustomers(custs);
      const settings = getLocalSettings();
      if (settings.default_rate_per_kg) {
        setRatePerKg(String(settings.default_rate_per_kg));
      }
      if (preselectedCustomerId) {
        setCustomerId(preselectedCustomerId);
      } else if (custs.length > 0) {
        setCustomerId(custs[0].id);
      }
    }
  }, [isOpen, preselectedCustomerId]);

  const weightNum = parseFloat(weightKg) || 0;
  const rateNum = parseFloat(ratePerKg) || 0;
  const totalAmount = Math.round(weightNum * rateNum);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customerId) {
      toast.error("Please select a customer");
      return;
    }
    if (weightNum <= 0) {
      toast.error("Please enter a valid weight in kg");
      return;
    }
    if (rateNum <= 0) {
      toast.error("Please enter a valid rate per kg");
      return;
    }

    try {
      addSale({
        customer_id: customerId,
        sale_date: saleDate,
        quantity_of_broilers: birdsCount ? parseInt(birdsCount) : undefined,
        weight_kg: weightNum,
        rate_per_kg: rateNum,
        total_amount: totalAmount,
        notes: notes.trim() || undefined
      });

      toast.success(`Sale of ${totalAmount.toLocaleString('en-IN')} recorded successfully`);
      // Reset form
      setWeightKg("");
      setBirdsCount("");
      setNotes("");
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error("Failed to record sale: " + err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="bg-brand-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5 text-amber-400" />
            <h3 className="font-heading text-lg font-bold">Record Live Chicken Sale</h3>
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
              Select Customer *
            </label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus-2 focus-emerald-500 focus-emerald-500 text-sm"
            >
              <option value="">-- Choose Customer --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.phone ? `(${c.phone})` : ""} - Current Bal: {formatCurrency(c.current_balance)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Sale Date *
              </label>
              <input
                type="date"
                value={saleDate}
                onChange={(e) => setSaleDate(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus-2 focus-emerald-500 focus-emerald-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Birds Count (Optional)
              </label>
              <input
                type="number"
                placeholder="e.g. 45"
                value={birdsCount}
                onChange={(e) => setBirdsCount(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus-2 focus-emerald-500 focus-emerald-500 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Weight (kg) *
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g. 105.5"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus-2 focus-emerald-500 focus-emerald-500 text-sm font-semibold text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Rate (₹ / kg) *
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 130"
                value={ratePerKg}
                onChange={(e) => setRatePerKg(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus-2 focus-emerald-500 focus-emerald-500 text-sm font-semibold text-slate-900"
              />
            </div>
          </div>

          {/* Computed Amount Display Box */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-emerald-800">
              <Calculator className="w-5 h-5 text-emerald-600" />
              <span className="text-xs font-semibold uppercase">Total Calculated Bill:</span>
            </div>
            <span className="text-xl font-extrabold text-emerald-900">
              {formatCurrency(totalAmount)}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Notes / Vehicles (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Vehicle MH-12-AB-1234 / Morning Batch"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus-2 focus-emerald-500 focus-emerald-500 text-sm"
            />
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
              className="px-5 py-2 text-sm font-bold text-slate-950 bg-amber-400 hover-amber-300 rounded-lg shadow-md transition"
            >
              Save Sale Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
