import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  FileText, 
  Download, 
  Share2, 
  Phone, 
  Plus, 
  CreditCard, 
  ShoppingCart, 
  MapPin, 
  Calendar,
  AlertCircle
} from "lucide-react";
import { 
  getLocalCustomers, 
  getLocalSales, 
  getLocalPayments, 
  getLocalSettings, 
  subscribeToStore 
} from "../lib/firebase";
import { formatCurrency, formatDate } from "../lib/utils";
import { generateCustomerLedgerPDF } from "../lib/pdfGenerator";
import { toast } from "sonner";

export const CustomerLedger = ({
  onOpenSaleModalForCustomer,
  onOpenPaymentModalForCustomer
}) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [sales, setSales] = useState([]);
  const [payments, setPayments] = useState([]);

  const loadData = () => {
    if (!id) return;
    const custs = getLocalCustomers();
    const found = custs.find(c => c.id === id);
    if (!found) {
      setCustomer(null);
      return;
    }
    setCustomer(found);

    const allSales = getLocalSales().filter(s => s.customer_id === id);
    const allPayments = getLocalPayments().filter(p => p.customer_id === id);
    setSales(allSales);
    setPayments(allPayments);
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToStore(loadData);
    return () => unsubscribe();
  }, [id]);

  if (!customer) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 my-8">
        <h2 className="text-xl font-bold text-slate-800">Customer Not Found</h2>
        <p className="text-slate-500 text-sm mt-1">The requested customer record does not exist.</p>
        <Link to="/admin/customers" className="mt-4 inline-block text-sm font-semibold text-amber-400 hover:underline">
          ← Back to Customers Directory
        </Link>
      </div>
    );
  }

  // Construct chronologically sorted ledger items
  const ledgerRaw = [];

  // 1. Opening Balance
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

  // 2. Sales entries (Debit)
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

  // 3. Payment entries (Credit)
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

  // Sort ascending by date
  ledgerRaw.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Compute running balance
  let runningBalance = 0;
  const ledgerItems = ledgerRaw.map((item) => {
    runningBalance += item.debit - item.credit;
    return {
      ...item,
      balance: runningBalance,
    };
  });

  const settings = getLocalSettings();

  const handleExportPDF = () => {
    generateCustomerLedgerPDF(customer, ledgerItems, settings);
    toast.success("Statement PDF downloaded");
  };

  const handleShareWhatsApp = () => {
    if (!customer.phone) {
      toast.error("Customer phone number not available");
      return;
    }
    const cleanPhone = customer.phone.replace(/[^0-9]/g, "");
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

    const message = `Hello ${customer.name},\n\n` +
      `Here is your account statement summary from *${settings.shop_name}*:\n` +
      `--------------------------------\n` +
      `*Current Outstanding Balance: ${formatCurrency(customer.current_balance)}*\n` +
      `--------------------------------\n` +
      `Please review your ledger statement or clear the bill via UPI (${settings.upi_id || "Cash/GPay"}).\n\n` +
      `Thank you`;

    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Back & Action Bar */}
      <div className="flex flex-col sm-row items-start sm-center justify-between gap-4">
        <button
          onClick={() => {
            if (window.history.length > 2) {
              navigate(-1);
            } else {
              navigate("/admin/customers");
            }
          }}
          className="flex items-center space-x-2 text-sm font-semibold text-slate-300 hover:text-white bg-[#0f172a] px-3.5 py-2 rounded-xl border border-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm-auto">
          {customer.phone && (
            <button
              onClick={handleShareWhatsApp}
              className="flex-1 sm-none flex items-center justify-center space-x-1.5 bg-emerald-600 hover-emerald-500 text-white font-semibold text-sm px-3.5 py-2 rounded-xl shadow-sm transition"
            >
              <Share2 className="w-4 h-4" />
              <span>Share WhatsApp</span>
            </button>
          )}

          <button
            onClick={handleExportPDF}
            className="flex-1 sm-none flex items-center justify-center space-x-1.5 bg-slate-900 hover-slate-800 text-white font-semibold text-sm px-3.5 py-2 rounded-xl shadow-sm transition"
          >
            <Download className="w-4 h-4" />
            <span>Download Statement PDF</span>
          </button>
        </div>
      </div>

      {/* Customer Information Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 md-cols-3 gap-6 items-center">
        {/* Left */}
        <div className="md-span-2 space-y-2">
          <div className="flex items-center space-x-3">
            <h1 className="font-heading text-2xl font-bold text-slate-900">
              {customer.name}
            </h1>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase ${
              customer.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
            }`}>
              {customer.status}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 pt-1">
            {customer.phone && (
              <a href={`tel:${customer.phone}`} className="flex items-center gap-1.5 hover-emerald-700 hover">
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>{customer.phone}</span>
              </a>
            )}
            {customer.address && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>{customer.address}</span>
              </span>
            )}
          </div>
        </div>

        {/* Right Balance Highlight Card */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-center items-center text-center">
          <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">
            Current Outstanding Balance
          </span>
          <span className={`text-2xl font-extrabold mt-1 ${
            customer.current_balance > 0 ? "text-red-600" : "text-emerald-700"
          }`}>
            {formatCurrency(customer.current_balance)}
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5">
            {customer.current_balance > 0 ? "Customer owes money" : "Bill settled"}
          </span>
        </div>
      </div>

      {/* Ledger Quick Actions Banner */}
      <div className="flex items-center justify-between bg-emerald-900 text-white p-4 rounded-2xl shadow-sm">
        <span className="font-heading font-semibold text-sm">
          Add New Transaction for {customer.name}:
        </span>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onOpenSaleModalForCustomer(customer.id)}
            className="flex items-center space-x-1.5 bg-amber-400 hover-amber-300 text-brand-950 font-bold text-xs sm-sm px-3.5 py-2 rounded-lg transition"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>+ Add Sale</span>
          </button>
          <button
            onClick={() => onOpenPaymentModalForCustomer(customer.id)}
            className="flex items-center space-x-1.5 bg-emerald-700 hover-emerald-600 text-white font-medium text-xs sm-sm px-3.5 py-2 rounded-lg border border-emerald-500/50 transition"
          >
            <CreditCard className="w-4 h-4" />
            <span>+ Add Payment</span>
          </button>
        </div>
      </div>

      {/* Customer Ledger Statement Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-heading font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-700" />
            <span>Statement Ledger History</span>
          </h3>
          <span className="text-xs text-slate-500">
            Total entries: {ledgerItems.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Transaction / Description</th>
                <th className="py-3.5 px-4 text-center">Birds</th>
                <th className="py-3.5 px-4 text-right">Weight (kg)</th>
                <th className="py-3.5 px-4 text-right">Rate (₹)</th>
                <th className="py-3.5 px-4 text-right text-red-600">Debit (+ Sale)</th>
                <th className="py-3.5 px-4 text-right text-emerald-700">Credit (- Pay)</th>
                <th className="py-3.5 px-4 text-right">Running Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {ledgerItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    No ledger transactions recorded yet for this customer.
                  </td>
                </tr>
              ) : (
                ledgerItems.map((item) => (
                  <tr key={item.id} className="hover-slate-50 transition">
                    <td className="py-3.5 px-4 font-medium text-slate-600 whitespace-nowrap">
                      {formatDate(item.date)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                        item.type === "Sale" ? "bg-amber-500" : item.type === "Payment" ? "bg-emerald-600" : "bg-slate-400"
                      }`} />
                      {item.description}
                    </td>
                    <td className="py-3.5 px-4 text-center font-medium text-slate-600">
                      {item.birds ? item.birds : "-"}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-800">
                      {item.weight_kg ? `${item.weight_kg} kg` : "-"}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-600">
                      {item.rate ? `₹${item.rate}` : "-"}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-red-600">
                      {item.debit > 0 ? formatCurrency(item.debit) : "-"}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-700">
                      {item.credit > 0 ? formatCurrency(item.credit) : "-"}
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-slate-900">
                      {formatCurrency(item.balance)}
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
