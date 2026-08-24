import React, { useState, useEffect } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Scale, 
  CreditCard, 
  FileSpreadsheet, 
  AlertCircle
} from "lucide-react";
import { getLocalSales, getLocalPayments, getLocalCustomers, subscribeToStore } from "../lib/firebase";
import { formatCurrency, formatDate, getTodayString } from "../lib/utils";
import { exportSalesToExcel } from "../lib/excelExporter";

export const Reports = () => {
  const [sales, setSales] = useState([]);
  const [payments, setPayments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [dateRange, setDateRange] = useState("this_month");

  const loadData = () => {
    setSales(getLocalSales());
    setPayments(getLocalPayments());
    setCustomers(getLocalCustomers());
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToStore(loadData);
    return () => unsubscribe();
  }, []);

  const todayStr = getTodayString();

  const filterByDate = (items) => {
    if (dateRange === "all") return items;
    const now = new Date();

    return items.filter((item) => {
      const dStr = item.sale_date || item.payment_date;
      if (!dStr) return true;

      if (dateRange === "today") {
        return dStr === todayStr;
      } else if (dateRange === "this_week") {
        const d = new Date(dStr);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return d >= weekAgo;
      } else if (dateRange === "this_month") {
        const d = new Date(dStr);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }
      return true;
    });
  };

  const filteredSales = filterByDate(sales);
  const filteredPayments = filterByDate(payments);

  const totalSalesRevenue = filteredSales.reduce((sum, s) => sum + s.total_amount, 0);
  const totalWeightSold = filteredSales.reduce((sum, s) => sum + s.weight_kg, 0);
  const totalPaymentsCollected = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalOutstanding = customers.reduce((sum, c) => sum + (c.current_balance > 0 ? c.current_balance : 0), 0);

  const timeRanges = [
    { key: "today", label: "Today" },
    { key: "this_week", label: "This Week" },
    { key: "this_month", label: "This Month" },
    { key: "all", label: "All Time" },
  ];

  return (
    <div className="space-y-6 pb-12 font-sans text-white">
      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-amber-400" />
            <span>Business Reports & Analytics</span>
          </h1>
          <p className="text-sm text-slate-400">Summary reports of sales, weight, collections, and outstanding ledgers</p>
        </div>

        <button
          onClick={() => exportSalesToExcel(filteredSales, `Business_Report_${dateRange}.xlsx`)}
          className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm px-4 py-2.5 rounded-xl shadow-lg transition"
        >
          <FileSpreadsheet className="w-4 h-4 text-amber-300" />
          <span>Export Analytics Report</span>
        </button>
      </div>

      {/* Filter Tabs (Dark Theme) */}
      <div className="bg-[#0f172a] p-4 rounded-3xl border border-slate-800 shadow-xl flex items-center space-x-2 overflow-x-auto">
        <span className="text-xs font-semibold text-slate-400 mr-2 shrink-0">Timeframe:</span>
        {timeRanges.map((range) => (
          <button
            key={range.key}
            onClick={() => setDateRange(range.key)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition whitespace-nowrap ${
              dateRange === range.key
                ? "bg-amber-400 text-[#0b3d2e] shadow-md"
                : "bg-[#18233c] text-slate-400 hover:text-white"
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>

      {/* Metrics Grid (Dark Theme) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Sales Revenue</span>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-emerald-400 mt-2 block">
            {formatCurrency(totalSalesRevenue)}
          </span>
          <span className="text-xs text-slate-400 mt-1 block">From {filteredSales.length} sales entries</span>
        </div>

        <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Total Weight Sold</span>
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
              <Scale className="w-5 h-5" />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-blue-400 mt-2 block">
            {totalWeightSold.toFixed(1)} <span className="text-base font-normal">kg</span>
          </span>
          <span className="text-xs text-slate-400 mt-1 block">Live broilers</span>
        </div>

        <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Payments Collected</span>
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-amber-400 mt-2 block">
            {formatCurrency(totalPaymentsCollected)}
          </span>
          <span className="text-xs text-slate-400 mt-1 block">From {filteredPayments.length} transactions</span>
        </div>

        <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Total Outstanding</span>
            <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-rose-400 mt-2 block">
            {formatCurrency(totalOutstanding)}
          </span>
          <span className="text-xs text-slate-400 mt-1 block">Receivable balance</span>
        </div>
      </div>

      {/* Filtered Sales Breakdown (Dark Theme) */}
      <div className="bg-[#0f172a] rounded-3xl border border-slate-800 shadow-xl p-6 space-y-4">
        <h3 className="font-heading font-bold text-white text-lg">
          Sales Summary Breakdown
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-900/60 border-b border-slate-800 text-xs font-bold text-slate-400 uppercase">
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4 text-right">Weight (kg)</th>
                <th className="py-3.5 px-4 text-right">Rate (₹/kg)</th>
                <th className="py-3.5 px-4 text-right">Total (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredSales.slice(0, 10).map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4 font-medium text-slate-300">{formatDate(sale.sale_date)}</td>
                  <td className="py-3.5 px-4 font-bold text-white">{sale.customer_name}</td>
                  <td className="py-3.5 px-4 text-right font-medium text-slate-200">{sale.weight_kg} kg</td>
                  <td className="py-3.5 px-4 text-right text-slate-300">₹{sale.rate_per_kg}</td>
                  <td className="py-3.5 px-4 text-right font-extrabold text-emerald-400">{formatCurrency(sale.total_amount)}</td>
                </tr>
              ))}
              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400">No records found for selected period.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
