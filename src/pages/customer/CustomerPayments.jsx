import React, { useState, useEffect } from "react";
import { CreditCard, DollarSign } from "lucide-react";
import { getCurrentUser } from "../../lib/auth";
import { getLocalPayments, getLocalCustomers, subscribeToStore } from "../../lib/firebase";
import { formatCurrency, formatDate } from "../../lib/utils";

export const CustomerPayments = () => {
  const user = getCurrentUser();
  const [payments, setPayments] = useState([]);

  const loadData = () => {
    if (!user) return;
    const custs = getLocalCustomers();
    let targetCustId = user.customer_id;
    if (!targetCustId && user.phone) {
      const found = custs.find((c) => c.phone === user.phone);
      if (found) targetCustId = found.id;
    }
    if (!targetCustId && custs.length > 0) {
      targetCustId = custs[0].id;
    }

    if (targetCustId) {
      setPayments(getLocalPayments().filter((p) => p.customer_id === targetCustId));
    }
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToStore(loadData);
    return () => unsubscribe();
  }, []);

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6 pb-12 font-sans text-white">
      {/* Title Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-white flex items-center gap-2">
          <CreditCard className="w-7 h-7 text-amber-400" />
          <span>My Payments History</span>
        </h1>
        <p className="text-sm text-slate-400">Record of payments received by shop for your account</p>
      </div>

      {/* Summary (Dark Theme) */}
      <div className="bg-[#0f172a] p-5 rounded-3xl border border-slate-800 shadow-xl max-w-sm flex items-center space-x-3">
        <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
          <DollarSign className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs font-bold uppercase text-slate-400 block">Total Amount Paid</span>
          <span className="text-2xl font-extrabold text-amber-400 block mt-0.5">
            {formatCurrency(totalPaid)}
          </span>
        </div>
      </div>

      {/* Table (Dark Theme) */}
      <div className="bg-[#0f172a] rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-900/60 border-b border-slate-800 text-xs font-bold text-slate-400 uppercase">
                <th className="py-4 px-4">Payment Date</th>
                <th className="py-4 px-4">Payment Mode</th>
                <th className="py-4 px-4 text-right">Amount Received (₹)</th>
                <th className="py-4 px-4">Notes / Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-slate-400">
                    No payment history found for your account.
                  </td>
                </tr>
              ) : (
                payments.map((pay) => (
                  <tr key={pay.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-medium text-slate-300">{formatDate(pay.payment_date)}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                        {pay.payment_mode}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-emerald-400">{formatCurrency(pay.amount)}</td>
                    <td className="py-3.5 px-4 text-xs text-slate-400 max-w-[200px] truncate">{pay.notes || "-"}</td>
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
