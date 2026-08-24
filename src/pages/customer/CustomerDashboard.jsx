import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  User, 
  CreditCard, 
  ShoppingCart, 
  Download, 
  QrCode, 
  Phone, 
  MapPin, 
  DollarSign,
  FileText,
  ArrowRight
} from "lucide-react";
import { getCurrentUser } from "../../lib/auth";
import { 
  getLocalCustomers, 
  getLocalSales, 
  getLocalPayments, 
  getLocalSettings, 
  subscribeToStore 
} from "../../lib/firebase";
import { formatCurrency, formatDate } from "../../lib/utils";
import { generateCustomerLedgerPDF } from "../../lib/pdfGenerator";
import { PayNowModal } from "../../components/PayNowModal";
import { AnimatedNumber } from "../../components/AnimatedNumber";
import { toast } from "sonner";

export const CustomerDashboard = () => {
  const user = getCurrentUser();
  const [customer, setCustomer] = useState(null);
  const [sales, setSales] = useState([]);
  const [payments, setPayments] = useState([]);
  const [isPayNowModalOpen, setIsPayNowModalOpen] = useState(false);

  const loadData = () => {
    if (!user) return;

    const custs = getLocalCustomers();
    let found = custs.find((c) => c.id === user.customer_id);
    if (!found && user.phone) {
      found = custs.find((c) => c.phone === user.phone);
    }
    if (!found) {
      found = custs[0] || null;
    }

    setCustomer(found);

    if (found) {
      setSales(getLocalSales().filter((s) => s.customer_id === found.id));
      setPayments(getLocalPayments().filter((p) => p.customer_id === found.id));
    }
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToStore(loadData);
    return () => unsubscribe();
  }, []);

  const settings = getLocalSettings();

  if (!customer) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 my-8">
        <h2 className="text-xl font-bold text-slate-800">Account Setup In Progress</h2>
        <p className="text-slate-500 text-sm mt-1">Your customer profile is currently being synchronized.</p>
      </div>
    );
  }

  const totalPurchases = sales.reduce((sum, s) => sum + s.total_amount, 0);
  const totalWeightBought = sales.reduce((sum, s) => sum + s.weight_kg, 0);
  const totalPaid = payments.filter(p => p.payment_status === "successful" || !p.payment_status).reduce((sum, p) => sum + p.amount, 0);

  // Construct ledger items for PDF
  const ledgerRaw = [];

  if (customer.opening_balance && customer.opening_balance !== 0) {
    ledgerRaw.push({
      id: "op-bal",
      date: customer.opening_balance_date || customer.created_at || "2026-08-01",
      type: "Opening Balance",
      description: customer.opening_balance_notes || "Opening Balance",
      debit: customer.opening_balance > 0 ? customer.opening_balance : 0,
      credit: customer.opening_balance < 0 ? Math.abs(customer.opening_balance) : 0,
    });
  }

  sales.forEach((s) => {
    ledgerRaw.push({
      id: s.id,
      date: s.sale_date,
      type: "Sale",
      description: `Live Chicken Sale (${s.weight_kg}kg @ ₹${s.rate_per_kg}${s.notes ? ` - ${s.notes}` : ""})`,
      birds: s.quantity_of_broilers,
      weight_kg: s.weight_kg,
      rate: s.rate_per_kg,
      debit: s.total_amount,
      credit: 0,
    });
  });

  payments.forEach((p) => {
    ledgerRaw.push({
      id: p.id,
      date: p.payment_date,
      type: "Payment",
      description: `Payment Received (${p.payment_mode}${p.notes ? ` - ${p.notes}` : ""})`,
      debit: 0,
      credit: p.amount,
    });
  });

  ledgerRaw.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let runningBal = 0;
  const ledgerItems = ledgerRaw.map((item) => {
    runningBal += item.debit - item.credit;
    return { ...item, balance: runningBal };
  });

  const handleDownloadPDF = () => {
    generateCustomerLedgerPDF(customer, ledgerItems, settings);
    toast.success("Downloaded your ledger statement PDF");
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Customer Header Banner */}
      <div className="bg-brand-900 text-white p-6 sm-8 rounded-3xl shadow-xl flex flex-col md-row items-start md-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center space-x-2 bg-amber-400/20 text-amber-300 text-xs px-3 py-1 rounded-full font-semibold border border-amber-400/30">
            <span>CUSTOMER DASHBOARD</span>
          </div>
          <h1 className="font-heading text-3xl sm-4xl font-extrabold tracking-tight">
            Welcome, {customer.name}!
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs sm-sm text-emerald-200">
            {customer.phone && (
              <span className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-amber-300" />
                <span>{customer.phone}</span>
              </span>
            )}
            {customer.address && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-300" />
                <span>{customer.address}</span>
              </span>
            )}
          </div>
        </div>

        {/* Outstanding Balance Highlight & Pay Now Button */}
        <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20 text-center w-full md-auto z-10 flex flex-col items-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-200">
            Current Outstanding Bill
          </span>
          <div className={`text-3xl font-extrabold my-1 font-sans tracking-tight ${
            customer.current_balance > 0 ? "text-amber-300" : "text-emerald-300"
          }`}>
            <AnimatedNumber value={customer.current_balance} prefix="₹ " />
          </div>

          <div className="flex items-center space-x-2 mt-2 w-full">
            {customer.current_balance > 0 && (
              <button
                onClick={() => setIsPayNowModalOpen(true)}
                className="flex-1 flex items-center justify-center space-x-1.5 bg-blue-600 hover-blue-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-lg transition active-95 animate-pulse"
              >
                <QrCode className="w-4 h-4" />
                <span>Pay Now (UPI / GPay)</span>
              </button>
            )}
            <button
              onClick={handleDownloadPDF}
              className="flex-1 flex items-center justify-center space-x-1.5 bg-emerald-800 hover-emerald-700 text-white font-medium text-xs px-4 py-2.5 rounded-xl border border-emerald-600 transition"
            >
              <Download className="w-4 h-4" />
              <span>PDF Statement</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overview Metric Cards Grid */}
      <div className="grid grid-cols-1 sm-cols-3 gap-5">
        
        {/* Total Purchases -> Royal Blue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover-md transition">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            <span>Total Purchases</span>
            <ShoppingCart className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-extrabold text-blue-600 tracking-tight mt-2">
            <AnimatedNumber value={totalPurchases} prefix="₹ " />
          </div>
          <span className="text-xs text-slate-400 mt-1 block font-medium">
            Weight Bought: <AnimatedNumber value={totalWeightBought} decimals={1} suffix=" kg" />
          </span>
        </div>

        {/* Total Paid -> Gold / Emerald */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover-md transition">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            <span>Total Amount Paid</span>
            <CreditCard className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-amber-600 tracking-tight mt-2">
            <AnimatedNumber value={totalPaid} prefix="₹ " />
          </div>
          <span className="text-xs text-slate-400 mt-1 block font-medium">{payments.length} transactions</span>
        </div>

        {/* Net Balance Due -> Elegant Red */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover-md transition">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            <span>Net Balance Due</span>
            <DollarSign className="w-4 h-4 text-rose-600" />
          </div>
          <div className={`text-3xl font-extrabold tracking-tight mt-2 ${
            customer.current_balance > 0 ? "text-rose-600" : "text-emerald-700"
          }`}>
            <AnimatedNumber value={customer.current_balance} prefix="₹ " />
          </div>
          <span className="text-xs text-slate-400 mt-1 block font-medium">
            {customer.current_balance > 0 ? "Pending Bill Payment" : "Account Settled"}
          </span>
        </div>

      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
            <h3 className="font-heading font-bold text-slate-900 text-base">Recent Purchases</h3>
            <Link to="/dashboard/purchases" className="text-xs font-semibold text-emerald-700 hover">
              View All →
            </Link>
          </div>
          <div className="divide-y divide-slate-100 text-sm">
            {sales.slice(0, 5).map((sale) => (
              <div key={sale.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900">{sale.weight_kg} kg ({sale.quantity_of_broilers || 0} birds)</span>
                  <span className="text-xs text-slate-500 block">{formatDate(sale.sale_date)}</span>
                </div>
                <span className="font-bold text-slate-900 font-sans tabular-nums">{formatCurrency(sale.total_amount)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
            <h3 className="font-heading font-bold text-slate-900 text-base">Recent Payments</h3>
            <Link to="/dashboard/payments" className="text-xs font-semibold text-emerald-700 hover">
              View All →
            </Link>
          </div>
          <div className="divide-y divide-slate-100 text-sm">
            {payments.slice(0, 5).map((pay) => (
              <div key={pay.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900">{pay.payment_mode} ({pay.payment_gateway || 'Manual'})</span>
                  <span className="text-xs text-slate-500 block">{formatDate(pay.payment_date)} • {pay.transaction_id || ''}</span>
                </div>
                <span className="font-bold text-emerald-700 font-sans tabular-nums">{formatCurrency(pay.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pay Now Online Gateway Modal */}
      {isPayNowModalOpen && (
        <PayNowModal
          isOpen={isPayNowModalOpen}
          onClose={() => setIsPayNowModalOpen(false)}
          customer={customer}
          onSuccess={loadData}
        />
      )}
    </div>
  );
};
