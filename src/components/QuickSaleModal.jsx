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
        quantity_of_broilers: parseInt(birdsCount) || 0,
        weight_kg: weightNum,
        rate_per_kg: rateNum,
        total_amount: totalAmount,
        notes: notes.trim() || undefined
      });

      toast.success("Sale entry recorded successfully!");
      if (onSuccess) onSuccess();
      onClose();

      // Reset
      setBirdsCount("");
      setWeightKg("");
      setNotes("");
    } catch (err) {
      toast.error(err.message || "Failed to record sale");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in-down">
      <div className="bg-[#0f172a] text-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-800 animate-pop-in">
        {/* Modal Header */}
        <div className="bg-[#0b3d2e] px-6 py-4 flex items-center justify-between border-b border-emerald-800/80">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5 text-amber-400" />
            <h3 className="font-heading text-lg font-bold text-white">Record Live Chicken Sale</h3>
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
              Select Customer *
            </label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              required
              className="w-full bg-[#18233c] border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-amber-400 transition"
            >
              <option value="">-- Choose Customer --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.phone ? `(${c.phone})` : ""} - Bal: {formatCurrency(c.current_balance)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Sale Date *
              </label>
              <input
                type="date"
                value={saleDate}
                onChange={(e) => setSaleDate(e.target.value)}
                required
                className="w-full bg-[#18233c] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-amber-400 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                No. of Birds (Optional)
              </label>
              <input
                type="number"
                value={birdsCount}
                onChange={(e) => setBirdsCount(e.target.value)}
                placeholder="e.g. 25"
                className="w-full bg-[#18233c] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Weight (kg) *
              </label>
              <input
                type="number"
                step="0.01"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                placeholder="0.00"
                required
                className="w-full bg-[#18233c] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Rate (₹ / kg) *
              </label>
              <input
                type="number"
                step="0.1"
                value={ratePerKg}
                onChange={(e) => setRatePerKg(e.target.value)}
                placeholder="130"
                required
                className="w-full bg-[#18233c] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
              />
            </div>
          </div>

          {/* Auto Calculation Preview */}
          <div className="bg-[#18233c] p-4 rounded-2xl border border-slate-700 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-slate-300 text-xs font-bold">
              <Calculator className="w-4 h-4 text-amber-400" />
              <span>Calculated Total Bill:</span>
            </div>
            <span className="text-xl font-extrabold text-amber-400 font-sans tabular-nums">
              {formatCurrency(totalAmount)}
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Notes / Vehicle Ref
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Batch #4, Driver Ramesh"
              className="w-full bg-[#18233c] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
            />
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
              Save & Record Sale
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
