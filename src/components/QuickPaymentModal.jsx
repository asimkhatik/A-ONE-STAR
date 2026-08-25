import React, { useState, useEffect } from "react";
import { X, CreditCard, DollarSign } from "lucide-react";
import { addPayment, getLocalCustomers } from "../lib/firebase";
import { getTodayString, formatCurrency } from "../lib/utils";
import { toast } from "sonner";

export const QuickPaymentModal = ({
  isOpen,
  onClose,
  preselectedCustomerId,
  onSuccess
}) => {
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [paymentDate, setPaymentDate] = useState(getTodayString());
  const [amount, setAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (isOpen) {
      const custs = getLocalCustomers().filter(c => c.status === "active");
      setCustomers(custs);
      if (preselectedCustomerId) {
        setCustomerId(preselectedCustomerId);
      } else if (custs.length > 0) {
        setCustomerId(custs[0].id);
      }
    }
  }, [isOpen, preselectedCustomerId]);

  if (!isOpen) return null;

  const amountNum = parseFloat(amount) || 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customerId) {
      toast.error("Please select a customer");
      return;
    }
    if (amountNum <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    try {
      addPayment({
        customer_id: customerId,
        payment_date: paymentDate,
        amount: amountNum,
        payment_mode: paymentMode,
        notes: notes.trim() || undefined
      });

      toast.success(`Payment of ${formatCurrency(amountNum)} recorded`);
      setAmount("");
      setNotes("");
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err.message || "Failed to record payment");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in-down">
      <div className="bg-[#0f172a] text-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-800 animate-pop-in">
        {/* Modal Header */}
        <div className="bg-[#0b3d2e] px-6 py-4 flex items-center justify-between border-b border-emerald-800/80">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-amber-400" />
            <h3 className="font-heading text-lg font-bold text-white">Record Customer Payment</h3>
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
                  {c.name} - Outstanding: {formatCurrency(c.current_balance)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Payment Date *
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                required
                className="w-full bg-[#18233c] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-amber-400 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Payment Mode *
              </label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                required
                className="w-full bg-[#18233c] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-amber-400 transition"
              >
                <option value="Cash">Cash</option>
                <option value="UPI / PhonePe">UPI / PhonePe</option>
                <option value="Google Pay">Google Pay</option>
                <option value="Bank Transfer">Bank Transfer / NEFT</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Amount Received (₹) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-sm">₹</span>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
                className="w-full pl-8 pr-4 py-2.5 bg-[#18233c] border border-slate-700/80 rounded-xl text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Notes / Transaction ID
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. GPay Ref #98721"
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
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition active:scale-95"
            >
              Save Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
