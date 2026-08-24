import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  CreditCard, 
  Plus, 
  Search, 
  FileSpreadsheet, 
  Trash2
} from "lucide-react";
import { getLocalPayments, deletePayment, subscribeToStore } from "../lib/firebase";
import { formatCurrency, formatDate } from "../lib/utils";
import { exportPaymentsToExcel } from "../lib/excelExporter";
import { toast } from "sonner";

export const Payments = ({ onOpenPaymentModal }) => {
  const [payments, setPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [modeFilter, setModeFilter] = useState("all");

  const loadData = () => {
    setPayments(getLocalPayments());
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToStore(loadData);
    return () => unsubscribe();
  }, []);

  const handleDelete = (id, customerName, amount) => {
    if (window.confirm(`Are you sure you want to delete this payment of ${formatCurrency(amount)} for "${customerName}"?`)) {
      deletePayment(id);
      toast.success("Payment entry deleted");
    }
  };

  const filteredPayments = payments.filter((p) => {
    const matchesSearch = 
      (p.customer_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.notes || "").toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (modeFilter !== "all" && p.payment_mode !== modeFilter) return false;
    return true;
  });

  const totalCollected = filteredPayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6 pb-12 font-sans text-white">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white flex items-center gap-2">
            <CreditCard className="w-7 h-7 text-amber-400" />
            <span>Payments Received History</span>
          </h1>
          <p className="text-sm text-slate-400">Track and manage bill collections from buyers</p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            onClick={() => exportPaymentsToExcel(filteredPayments)}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 font-semibold text-sm px-4 py-2.5 rounded-xl border border-emerald-700/60 transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-amber-400" />
            <span>Export Excel</span>
          </button>
          {onOpenPaymentModal && (
            <button
              onClick={onOpenPaymentModal}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm px-5 py-2.5 rounded-xl shadow-lg transition"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Record Payment</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter & Summary Banner (Dark Theme) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#0f172a] p-5 rounded-3xl border border-slate-800 shadow-xl">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer name or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#18233c] border border-slate-700/80 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-medium transition"
          />
        </div>

        {/* Mode Filter Dropdown */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-400 shrink-0">Mode:</span>
          <select
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value)}
            className="w-full bg-[#18233c] border border-slate-700/80 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 font-medium transition"
          >
            <option value="all">All Modes</option>
            <option value="Cash">Cash</option>
            <option value="UPI">UPI / GPay</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Cheque">Cheque</option>
          </select>
        </div>

        {/* Total Collected Summary Box */}
        <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl">
          <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
            Total Payments Collected
          </span>
          <span className="text-lg font-extrabold text-amber-400">
            {formatCurrency(totalCollected)}
          </span>
        </div>
      </div>

      {/* Payments Table (Dark Theme) */}
      <div className="bg-[#0f172a] rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-900/60 border-b border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-4">Date</th>
                <th className="py-4 px-4">Buyer / Customer</th>
                <th className="py-4 px-4">Payment Mode</th>
                <th className="py-4 px-4 text-right">Amount Received (₹)</th>
                <th className="py-4 px-4">Notes / Ref</th>
                <th className="py-4 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((pay) => (
                  <tr key={pay.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-medium text-slate-300 whitespace-nowrap">
                      {formatDate(pay.payment_date)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      <Link to={`/admin/customers/${pay.customer_id}`} className="hover:text-amber-400 transition">
                        {pay.customer_name}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                        {pay.payment_mode}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-emerald-400">
                      {formatCurrency(pay.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-400 max-w-[200px] truncate">
                      {pay.notes || "-"}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(pay.id, pay.customer_name || "Customer", pay.amount)}
                        className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition"
                        title="Delete Payment Entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
