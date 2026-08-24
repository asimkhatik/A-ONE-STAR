import React, { useState, useEffect } from "react";
import { 
  User, 
  CreditCard, 
  ShoppingCart, 
  Download, 
  QrCode, 
  Phone, 
  MapPin, 
  CheckCircle,
  FileText,
  DollarSign,
  Share2
} from "lucide-react";
import { 
  getLocalCustomers, 
  getLocalSales, 
  getLocalPayments, 
  getLocalSettings,
  getActiveCustomerId,
  setActiveCustomerId,
  subscribeToStore 
} from "../lib/firebase";
import { formatCurrency, formatDate } from "../lib/utils";
import { generateCustomerLedgerPDF } from "../lib/pdfGenerator";
import { toast } from "sonner";

export const CustomerPortal = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [sales, setSales] = useState([]);
  const [payments, setPayments] = useState([]);
  const [isUpiModalOpen, setIsUpiModalOpen] = useState(false);

  const loadData = () => {
    const custs = getLocalCustomers();
    setCustomers(custs);

    const activeId = getActiveCustomerId();
    const validId = custs.some(c => c.id === activeId) ? activeId : (custs[0]?.id || "");
    setSelectedCustomerId(validId);

    if (validId) {
      setSales(getLocalSales().filter(s => s.customer_id === validId));
      setPayments(getLocalPayments().filter(p => p.customer_id === validId));
    }
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToStore(loadData);
    return () => unsubscribe();
  }, []);

  const handleCustomerChange = (id) => {
    setSelectedCustomerId(id);
    setActiveCustomerId(id);
    setSales(getLocalSales().filter(s => s.customer_id === id));
    setPayments(getLocalPayments().filter(p => p.customer_id === id));
  };

  const currentCustomer = customers.find(c => c.id === selectedCustomerId);
  const settings = getLocalSettings();

  if (!currentCustomer) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 my-8">
        <h2 className="text-xl font-bold text-slate-800">No Customer Selected</h2>
        <p className="text-slate-500 text-sm mt-1">Please add a customer to access the Customer Portal.</p>
      </div>
    );
  }

  // Calculate metrics
  const totalPurchases = sales.reduce((sum, s) => sum + s.total_amount, 0);
  const totalWeightBought = sales.reduce((sum, s) => sum + s.weight_kg, 0);
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

  // Construct ledger items for PDF
  const ledgerRaw = [];

  if (currentCustomer.opening_balance && currentCustomer.opening_balance !== 0) {
    ledgerRaw.push({
      id,
      date.opening_balance_date || currentCustomer.created_at || "2026-08-01",
      type,
      description.opening_balance_notes || "Opening Balance",
      debit.opening_balance > 0 ? currentCustomer.opening_balance,
      credit.opening_balance < 0 ? Math.abs(currentCustomer.opening_balance) : 0,
    });
  }

  sales.forEach((s) => {
    ledgerRaw.push({
      id.id,
      date.sale_date,
      type,
      description: `Live Chicken Sale (${s.weight_kg}kg @ ₹${s.rate_per_kg}${s.notes ? ` - ${s.notes}` : ""})`,
      birds.quantity_of_broilers,
      weight_kg.weight_kg,
      rate.rate_per_kg,
      debit.total_amount,
      credit,
    });
  });

  payments.forEach((p) => {
    ledgerRaw.push({
      id.id,
      date.payment_date,
      type,
      description: `Payment Received (${p.payment_mode}${p.notes ? ` - ${p.notes}` : ""})`,
      debit,
      credit.amount,
    });
  });

  ledgerRaw.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let runningBal = 0;
  const ledgerItems = ledgerRaw.map((item) => {
    runningBal += item.debit - item.credit;
    return { ...item, balance };
  });

  const handleDownloadPDF = () => {
    generateCustomerLedgerPDF(currentCustomer, ledgerItems, settings);
    toast.success("Downloaded your ledger statement PDF");
  };

  const upiLink = `upi://pay?pa=${encodeURIComponent(settings.upi_id || "aonestar@upi")}&pn=${encodeURIComponent(settings.shop_name)}&am=${currentCustomer.current_balance}&cu=INR&tn=Bill%20Payment`;

  return (
    <div className="space-y-6 pb-12">
      {/* Account Switcher Bar (For Demo/Testing) */}
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex flex-col sm-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <User className="w-5 h-5 text-amber-700" />
          <span className="text-xs font-bold text-amber-900 uppercase">Customer Self-Service Account:</span>
        </div>
        <select
          value={selectedCustomerId}
          onChange={(e) => handleCustomerChange(e.target.value)}
          className="px-3.5 py-1.5 border border-amber-300 rounded-xl text-sm font-bold text-slate-900 bg-white focus-2 focus-amber-500"
        >
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} {c.phone ? `(${c.phone})` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Customer Header Banner */}
      <div className="bg-brand-900 text-white p-6 sm-8 rounded-3xl shadow-xl flex flex-col md-row items-start md-center justify-between gap-6 relative overflow-hidden">
        {/* Background decorative graphic */}
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />

        <div className="space-y-2 z-10">
          <div className="inline-flex items-center space-x-2 bg-amber-400/20 text-amber-300 text-xs px-3 py-1 rounded-full font-semibold border border-amber-400/30">
            <span>CUSTOMER SELF-SERVICE PORTAL</span>
          </div>
          <h1 className="font-heading text-3xl sm-4xl font-extrabold tracking-tight">
            Welcome, {currentCustomer.name}!
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs sm-sm text-emerald-200">
            {currentCustomer.phone && (
              <span className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-amber-300" />
                <span>{currentCustomer.phone}</span>
              </span>
            )}
            {currentCustomer.address && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-300" />
                <span>{currentCustomer.address}</span>
              </span>
            )}
          </div>
        </div>

        {/* Outstanding Balance & Pay Button */}
        <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20 text-center w-full md-auto z-10 flex flex-col items-center">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
            Your Current Outstanding Bill
          </span>
          <span className={`text-3xl font-extrabold my-1 ${
            currentCustomer.current_balance > 0 ? "text-amber-300" : "text-emerald-300"
          }`}>
            {formatCurrency(currentCustomer.current_balance)}
          </span>

          <div className="flex items-center space-x-2 mt-2 w-full">
            {currentCustomer.current_balance > 0 && (
              <button
                onClick={() => setIsUpiModalOpen(true)}
                className="flex-1 flex items-center justify-center space-x-1.5 bg-amber-400 hover-amber-300 text-brand-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow transition active-95"
              >
                <QrCode className="w-4 h-4" />
                <span>Pay Bill via UPI</span>
              </button>
            )}
            <button
              onClick={handleDownloadPDF}
              className="flex-1 flex items-center justify-center space-x-1.5 bg-emerald-800 hover-emerald-700 text-white font-medium text-xs px-4 py-2.5 rounded-xl border border-emerald-600 transition"
            >
              <Download className="w-4 h-4" />
              <span>Statement PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Total Purchases</span>
            <ShoppingCart className="w-5 h-5 text-amber-500" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900 mt-2 block">
            {formatCurrency(totalPurchases)}
          </span>
          <span className="text-xs text-slate-500 mt-1 block">Total Weight: {totalWeightBought.toFixed(1)} kg</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Total Amount Paid</span>
            <CreditCard className="w-5 h-5 text-emerald-600" />
          </div>
          <span className="text-2xl font-extrabold text-emerald-700 mt-2 block">
            {formatCurrency(totalPaid)}
          </span>
          <span className="text-xs text-slate-500 mt-1 block">From {payments.length} payments</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Net Balance Due</span>
            <DollarSign className="w-5 h-5 text-red-500" />
          </div>
          <span className={`text-2xl font-extrabold mt-2 block ${
            currentCustomer.current_balance > 0 ? "text-red-600" : "text-emerald-700"
          }`}>
            {formatCurrency(currentCustomer.current_balance)}
          </span>
          <span className="text-xs text-slate-500 mt-1 block">
            {currentCustomer.current_balance > 0 ? "Payment pending" : "All clear"}
          </span>
        </div>
      </div>

      {/* Transaction History Tables */}
      <div className="grid grid-cols-1 lg-cols-2 gap-6">
        {/* Recent Purchases */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h3 className="font-heading font-bold text-slate-900 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-amber-500" />
              <span>Your Broiler Chicken Purchases</span>
            </h3>
            <span className="text-xs text-slate-500">{sales.length} orders</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Weight (kg)</th>
                  <th className="py-3 px-4 text-right">Rate</th>
                  <th className="py-3 px-4 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sales.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">No purchases recorded yet.</td>
                  </tr>
                ) : (
                  sales.map((sale) => (
                    <tr key={sale.id} className="hover-slate-50">
                      <td className="py-3 px-4 font-medium text-slate-600">{formatDate(sale.sale_date)}</td>
                      <td className="py-3 px-4 text-right font-bold">{sale.weight_kg} kg</td>
                      <td className="py-3 px-4 text-right text-slate-600">₹{sale.rate_per_kg}</td>
                      <td className="py-3 px-4 text-right font-extrabold text-slate-900">{formatCurrency(sale.total_amount)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payments Made */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h3 className="font-heading font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              <span>Payments Made</span>
            </h3>
            <span className="text-xs text-slate-500">{payments.length} payments</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Mode</th>
                  <th className="py-3 px-4 text-right">Amount Paid (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-slate-400">No payments recorded yet.</td>
                  </tr>
                ) : (
                  payments.map((pay) => (
                    <tr key={pay.id} className="hover-slate-50">
                      <td className="py-3 px-4 font-medium text-slate-600">{formatDate(pay.payment_date)}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700">
                          {pay.payment_mode}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold text-emerald-700">{formatCurrency(pay.amount)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pay via UPI Modal */}
      {isUpiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <QrCode className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-heading font-bold text-lg text-slate-900">Pay Bill via UPI</h3>
              <p className="text-xs text-slate-500 mt-1">
                Scan or click below to open GPay, PhonePe, or Paytm
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-xs text-slate-700">
              UPI ID: <span className="font-bold text-slate-900">{settings.upi_id || "aonestar@upi"}</span>
              <div className="mt-2 text-base font-extrabold text-emerald-800">
                Amount: {formatCurrency(currentCustomer.current_balance)}
              </div>
            </div>

            <a
              href={upiLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center space-x-2 bg-emerald-700 hover-emerald-600 text-white font-bold py-3 rounded-xl shadow transition"
            >
              <span>Open UPI App (GPay / PhonePe)</span>
            </a>

            <button
              onClick={() => setIsUpiModalOpen(false)}
              className="w-full py-2 text-xs font-semibold text-slate-500 hover-slate-800"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
