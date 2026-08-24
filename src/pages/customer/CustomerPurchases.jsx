import React, { useState, useEffect } from "react";
import { ShoppingCart, Scale, DollarSign } from "lucide-react";
import { getCurrentUser } from "../../lib/auth";
import { getLocalSales, getLocalCustomers, subscribeToStore } from "../../lib/firebase";
import { formatCurrency, formatDate } from "../../lib/utils";

export const CustomerPurchases = () => {
  const user = getCurrentUser();
  const [sales, setSales] = useState([]);

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
      setSales(getLocalSales().filter((s) => s.customer_id === targetCustId));
    }
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToStore(loadData);
    return () => unsubscribe();
  }, []);

  const totalWeight = sales.reduce((sum, s) => sum + s.weight_kg, 0);
  const totalSpent = sales.reduce((sum, s) => sum + s.total_amount, 0);

  return (
    <div className="space-y-6 pb-12 font-sans text-white">
      {/* Title Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-white flex items-center gap-2">
          <ShoppingCart className="w-7 h-7 text-amber-400" />
          <span>My Live Broiler Purchases</span>
        </h1>
        <p className="text-sm text-slate-400">History of live chicken batches purchased from shop</p>
      </div>

      {/* Summary Box (Dark Theme) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#0f172a] p-5 rounded-3xl border border-slate-800 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase text-slate-400 block">Total Weight Purchased</span>
            <span className="text-2xl font-extrabold text-blue-400 block mt-0.5">
              {totalWeight.toFixed(1)} kg
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase text-slate-400 block">Total Purchases Bill</span>
            <span className="text-2xl font-extrabold text-emerald-400 block mt-0.5">
              {formatCurrency(totalSpent)}
            </span>
          </div>
        </div>
      </div>

      {/* Table (Dark Theme) */}
      <div className="bg-[#0f172a] rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-900/60 border-b border-slate-800 text-xs font-bold text-slate-400 uppercase">
                <th className="py-4 px-4">Date</th>
                <th className="py-4 px-4 text-center">Birds</th>
                <th className="py-4 px-4 text-right">Weight (kg)</th>
                <th className="py-4 px-4 text-right">Rate (₹/kg)</th>
                <th className="py-4 px-4 text-right">Total Amount (₹)</th>
                <th className="py-4 px-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    No purchase history found for your account.
                  </td>
                </tr>
              ) : (
                sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-medium text-slate-300">{formatDate(sale.sale_date)}</td>
                    <td className="py-3.5 px-4 text-center font-semibold text-slate-200">{sale.quantity_of_broilers || "-"}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-white">{sale.weight_kg} kg</td>
                    <td className="py-3.5 px-4 text-right text-slate-300">₹{sale.rate_per_kg}</td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-emerald-400">{formatCurrency(sale.total_amount)}</td>
                    <td className="py-3.5 px-4 text-xs text-slate-400 max-w-[200px] truncate">{sale.notes || "-"}</td>
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
