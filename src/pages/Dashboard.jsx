import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  TrendingUp, 
  Scale, 
  CreditCard, 
  Users, 
  Plus, 
  ArrowRight, 
  ShoppingCart, 
  AlertCircle,
  FileText,
  Calendar
} from "lucide-react";
import { 
  getLocalCustomers, 
  getLocalSales, 
  getLocalPayments, 
  subscribeToStore 
} from "../lib/firebase";
import { formatCurrency, formatDate, getTodayString } from "../lib/utils";

export const Dashboard = ({
  onOpenSaleModal,
  onOpenPaymentModal,
  onOpenCustomerModal
}) => {
  const [customers, setCustomers] = useState([]);
  const [sales, setSales] = useState([]);
  const [payments, setPayments] = useState([]);

  const loadData = () => {
    setCustomers(getLocalCustomers());
    setSales(getLocalSales());
    setPayments(getLocalPayments());
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToStore(loadData);
    return () => unsubscribe();
  }, []);

  const todayStr = getTodayString();
  const todaySalesList = sales.filter(s => s.sale_date === todayStr);
  const todayPaymentsList = payments.filter(p => p.payment_date === todayStr);

  const todaySalesRevenue = todaySalesList.reduce((sum, s) => sum + s.total_amount, 0);
  const todayWeightSold = todaySalesList.reduce((sum, s) => sum + s.weight_kg, 0);
  const todayPaymentsCollected = todayPaymentsList.reduce((sum, p) => sum + p.amount, 0);
  const totalOutstandingBalance = customers.reduce((sum, c) => sum + c.current_balance, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome & Quick Action Bar */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md-row items-start md-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-slate-900">
            Business Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>Today's Date: {formatDate(todayStr)}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md-auto">
          <button
            onClick={onOpenSaleModal}
            className="flex-1 md-none flex items-center justify-center space-x-1.5 bg-amber-400 hover-amber-300 text-brand-950 font-bold text-sm px-4 py-2.5 rounded-xl shadow-sm transition active-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Record Sale</span>
          </button>
          <button
            onClick={onOpenPaymentModal}
            className="flex-1 md-none flex items-center justify-center space-x-1.5 bg-brand-900 hover-brand-800 text-white font-medium text-sm px-4 py-2.5 rounded-xl shadow-sm transition active-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Payment</span>
          </button>
          <button
            onClick={onOpenCustomerModal}
            className="flex-1 md-none flex items-center justify-center space-x-1.5 bg-slate-100 hover-slate-200 text-slate-700 font-medium text-sm px-4 py-2.5 rounded-xl border border-slate-200 transition active-95"
          >
            <Users className="w-4 h-4" />
            <span>+ Customer</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm-cols-2 lg-cols-4 gap-5">
        {/* Today's Sales */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover-emerald-500 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's Sales</span>
            <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900">
              {formatCurrency(todaySalesRevenue)}
            </span>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span className="font-semibold text-emerald-600">{todaySalesList.length}</span> sales entries today
            </p>
          </div>
        </div>

        {/* Today's Weight Sold */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover-emerald-500 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Weight Sold (Today)</span>
            <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
              <Scale className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900">
              {todayWeightSold.toFixed(1)} <span className="text-base font-medium text-slate-600">kg</span>
            </span>
            <p className="text-xs text-slate-500 mt-1">Live Broiler Chicken</p>
          </div>
        </div>

        {/* Today's Payments Collected */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover-emerald-500 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Payments Collected</span>
            <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900">
              {formatCurrency(todayPaymentsCollected)}
            </span>
            <p className="text-xs text-slate-500 mt-1">
              <span className="font-semibold text-blue-600">{todayPaymentsList.length}</span> payments today
            </p>
          </div>
        </div>

        {/* Total Outstanding Balance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover-red-400 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Outstanding</span>
            <div className="p-2.5 bg-red-100 text-red-700 rounded-xl">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-red-600">
              {formatCurrency(totalOutstandingBalance)}
            </span>
            <p className="text-xs text-slate-500 mt-1">
              Across <span className="font-semibold text-slate-700">{customers.length}</span> buyers
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg-cols-3 gap-6">
        {/* Recent Sales (2 Columns) */}
        <div className="lg-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="w-5 h-5 text-brand-900" />
              <h3 className="font-heading font-bold text-slate-900">Recent Live Chicken Sales</h3>
            </div>
            <Link to="/sales" className="text-xs font-semibold text-emerald-700 hover-emerald-800 flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 overflow-x-auto">
            {sales.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                No sales recorded yet. Click "+ Record Sale" to start.
              </div>
            ) : (
              sales.slice(0, 6).map((sale) => (
                <div key={sale.id} className="p-4 hover-slate-50 flex items-center justify-between gap-4 transition">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                      {sale.weight_kg}kg
                    </div>
                    <div>
                      <Link to={`/customers/${sale.customer_id}`} className="font-semibold text-slate-900 text-sm hover">
                        {sale.customer_name}
                      </Link>
                      <p className="text-xs text-slate-500">
                        {formatDate(sale.sale_date)} • {sale.quantity_of_broilers ? `${sale.quantity_of_broilers} birds @ ` : ""}₹{sale.rate_per_kg}/kg
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-extrabold text-slate-900 text-sm block">
                      {formatCurrency(sale.total_amount)}
                    </span>
                    {sale.notes && <span className="text-[11px] text-slate-400 truncate max-w-[150px] inline-block">{sale.notes}</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Outstanding Customers (1 Column) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-red-600" />
              <h3 className="font-heading font-bold text-slate-900">Highest Outstanding</h3>
            </div>
            <Link to="/customers" className="text-xs font-semibold text-emerald-700 hover-emerald-800 flex items-center gap-1">
              <span>All Buyers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 flex-1">
            {customers
              .filter(c => c.current_balance > 0)
              .sort((a, b) => b.current_balance - a.current_balance)
              .slice(0, 5)
              .map((customer) => (
                <div key={customer.id} className="p-4 hover-slate-50 flex items-center justify-between gap-3">
                  <div>
                    <Link to={`/customers/${customer.id}`} className="font-semibold text-slate-900 text-sm hover block">
                      {customer.name}
                    </Link>
                    <span className="text-xs text-slate-500">{customer.phone || "No Phone"}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-red-600 text-sm block">
                      {formatCurrency(customer.current_balance)}
                    </span>
                    <Link to={`/customers/${customer.id}`} className="text-[11px] font-medium text-emerald-700 hover">
                      View Ledger →
                    </Link>
                  </div>
                </div>
              ))}
            {customers.filter(c => c.current_balance > 0).length === 0 && (
              <div className="p-8 text-center text-emerald-600 text-sm">
                No pending customer balances 🎉
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
