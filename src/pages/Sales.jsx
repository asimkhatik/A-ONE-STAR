import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  ShoppingCart, 
  Plus, 
  Search, 
  FileSpreadsheet, 
  Trash2
} from "lucide-react";
import { getLocalSales, deleteSale, subscribeToStore } from "../lib/firebase";
import { formatCurrency, formatDate, getTodayString } from "../lib/utils";
import { exportSalesToExcel } from "../lib/excelExporter";
import { toast } from "sonner";

export const Sales = ({ onOpenSaleModal }) => {
  const [sales, setSales] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");

  const loadData = () => {
    setSales(getLocalSales());
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToStore(loadData);
    return () => unsubscribe();
  }, []);

  const handleDelete = (saleId, customerName) => {
    if (window.confirm(`Are you sure you want to delete this sale entry for "${customerName}"?`)) {
      deleteSale(saleId);
      toast.success("Sale entry deleted");
    }
  };

  const todayStr = getTodayString();
  
  const filteredSales = sales.filter((sale) => {
    const matchesSearch = 
      (sale.customer_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sale.notes || "").toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (dateFilter === "today") {
      return sale.sale_date === todayStr;
    } else if (dateFilter === "this_week") {
      const saleDate = new Date(sale.sale_date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return saleDate >= weekAgo;
    } else if (dateFilter === "this_month") {
      const saleDate = new Date(sale.sale_date);
      const now = new Date();
      return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
    }

    return true;
  });

  const totalWeight = filteredSales.reduce((sum, s) => sum + s.weight_kg, 0);
  const totalAmount = filteredSales.reduce((sum, s) => sum + s.total_amount, 0);
  const totalBirds = filteredSales.reduce((sum, s) => sum + (s.quantity_of_broilers || 0), 0);

  return (
    <div className="space-y-6 pb-12 font-sans text-white">
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white flex items-center gap-2">
            <ShoppingCart className="w-7 h-7 text-amber-400" />
            <span>Daily Live Chicken Sales</span>
          </h1>
          <p className="text-sm text-slate-400">Record and manage daily broiler chicken sales entries</p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            onClick={() => exportSalesToExcel(filteredSales)}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 font-semibold text-sm px-4 py-2.5 rounded-xl border border-emerald-700/60 transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-amber-400" />
            <span>Export Excel</span>
          </button>
          {onOpenSaleModal && (
            <button
              onClick={onOpenSaleModal}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 bg-amber-400 hover:bg-amber-300 text-[#0b3d2e] font-extrabold text-sm px-5 py-2.5 rounded-xl shadow-lg transition"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Record Sale</span>
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
            placeholder="Search buyer name or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#18233c] border border-slate-700/80 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-medium transition"
          />
        </div>

        {/* Date Filter Tabs */}
        <div className="flex items-center space-x-1 bg-[#18233c] p-1 rounded-xl border border-slate-700/80">
          <button
            onClick={() => setDateFilter("all")}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
              dateFilter === "all" ? "bg-amber-400 text-[#0b3d2e] shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            All Time
          </button>
          <button
            onClick={() => setDateFilter("today")}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
              dateFilter === "today" ? "bg-amber-400 text-[#0b3d2e] shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setDateFilter("this_week")}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
              dateFilter === "this_week" ? "bg-amber-400 text-[#0b3d2e] shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setDateFilter("this_month")}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
              dateFilter === "this_month" ? "bg-amber-400 text-[#0b3d2e] shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            This Month
          </button>
        </div>

        {/* Summary Metric */}
        <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl">
          <div>
            <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider block">
              Filtered Total
            </span>
            <span className="text-lg font-extrabold text-emerald-400">
              {formatCurrency(totalAmount)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-amber-300 block">
              {totalWeight.toFixed(1)} kg
            </span>
            <span className="text-[11px] text-slate-400">
              {totalBirds > 0 ? `${totalBirds} birds` : `${filteredSales.length} sales`}
            </span>
          </div>
        </div>
      </div>

      {/* Sales List Table (Dark Theme) */}
      <div className="bg-[#0f172a] rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-900/60 border-b border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-4">Date</th>
                <th className="py-4 px-4">Buyer / Customer</th>
                <th className="py-4 px-4 text-center">Birds Count</th>
                <th className="py-4 px-4 text-right">Weight (kg)</th>
                <th className="py-4 px-4 text-right">Rate (₹/kg)</th>
                <th className="py-4 px-4 text-right">Total Bill (₹)</th>
                <th className="py-4 px-4">Notes</th>
                <th className="py-4 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    No sales records found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-medium text-slate-300 whitespace-nowrap">
                      {formatDate(sale.sale_date)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      <Link to={`/admin/customers/${sale.customer_id}`} className="hover:text-amber-400 transition">
                        {sale.customer_name}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 text-center font-medium text-slate-300">
                      {sale.quantity_of_broilers ? sale.quantity_of_broilers : "-"}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-200">
                      {sale.weight_kg} kg
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-300">
                      ₹{sale.rate_per_kg}
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-emerald-400">
                      {formatCurrency(sale.total_amount)}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-400 max-w-[200px] truncate">
                      {sale.notes || "-"}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(sale.id, sale.customer_name || "Customer")}
                        className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition"
                        title="Delete Sale"
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
