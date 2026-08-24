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
      toast.error("Failed to record payment: " + err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="bg-emerald-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-amber-300" />
            <h3 className="font-heading text-lg font-bold">Record Customer Payment</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-emerald-200 hover-white p-1 rounded-lg hover-emerald-700 transition"
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
                Payment Date *
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus-2 focus-emerald-500 focus-emerald-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Payment Mode *
              </label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value )}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus-2 focus-emerald-500 focus-emerald-500 text-sm"
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI / GPay / PhonePe</option>
                <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Amount Received (₹) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
              <input
                type="number"
                step="1"
                placeholder="e.g. 5000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus-2 focus-emerald-500 focus-emerald-500 text-lg font-bold text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Payment Reference / Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. UPI Ref #12345678"
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
              className="px-5 py-2 text-sm font-bold text-white bg-emerald-700 hover-emerald-600 rounded-lg shadow-md transition"
            >
              Save Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
