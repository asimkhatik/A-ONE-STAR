import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  FileText, 
  Download, 
  Share2, 
  Phone, 
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
import { AnimatedNumber } from "../components/AnimatedNumber";
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
  const [isExporting, setIsExporting] = useState(false);

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
      <div className="p-12 text-center bg-[#0f172a] text-white rounded-3xl border border-slate-800 my-8 shadow-xl animate-fade-in-up">
        <h2 className="text-xl font-bold text-white">Customer Not Found</h2>
        <p className="text-slate-400 text-sm mt-1">The requested customer record does not exist.</p>
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
    setIsExporting(true);
    try {
      generateCustomerLedgerPDF(customer, ledgerItems, settings);
      toast.success("Statement PDF downloaded");
    } catch (err) {
      toast.error("Failed to generate PDF");
    } finally {
      setTimeout(() => setIsExporting(false), 800);
    }
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
    <div className="space-y-6 pb-12 font-sans text-white animate-fade-in-up">
      {/* Top Back & Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <button
          onClick={() => {
            if (window.history.length > 2) {
              navigate(-1);
            } else {
              navigate("/admin/customers");
            }
          }}
          className="flex items-center space-x-2 text-sm font-bold text-slate-300 hover:text-white bg-[#0f172a] px-4 py-2.5 rounded-xl border border-slate-800 transition active:scale-95 button-press-anim"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {customer.phone && (
            <button
              onClick={handleShareWhatsApp}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-lg transition active:scale-95 button-press-anim"
            >
              <Share2 className="w-4 h-4" />
              <span>Share WhatsApp</span>
            </button>
          )}

          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 bg-amber-400 hover:bg-amber-300 text-[#0b3d2e] font-extrabold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-lg transition active:scale-95 button-press-anim disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? "Generating PDF..." : "Download Statement PDF"}</span>
          </button>
        </div>
      </div>

      {/* Customer Header Card */}
      <div className="bg-[#0f172a] p-6 rounded-3xl border border-slate-800 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-6 items-center hover-card-anim">
        {/* Left */}
        <div className="md:col-span-2 space-y-2">
          <div className="flex items-center space-x-3">
            <h1 className="font-heading text-2xl font-bold text-white">
              {customer.name}
            </h1>
            <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
              customer.status === "active" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-slate-800 text-slate-400 border border-slate-700"
            }`}>
              {customer.status}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 pt-1 font-medium">
            {customer.phone && (
              <a href={`tel:${customer.phone}`} className="flex items-center gap-1.5 hover:text-amber-400 transition">
                <Phone className="w-4 h-4 text-amber-400" />
                <span>{customer.phone}</span>
              </a>
            )}
            {customer.address && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>{customer.address}</span>
              </span>
            )}
          </div>
        </div>

        {/* Right Balance Highlight */}
        <div className="bg-[#18233c] p-5 rounded-2xl border border-slate-700 flex flex-col justify-center items-center text-center">
          <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">
            Closing Account Balance
          </span>
          <div className={`text-3xl font-extrabold mt-1 font-sans tracking-tight ${
            customer.current_balance > 0 ? "text-rose-400" : "text-emerald-400"
          }`}>
            <AnimatedNumber value={customer.current_balance} prefix="₹ " />
          </div>
          <span className="text-xs text-slate-400 mt-1 font-medium">
            {customer.current_balance > 0 ? "Pending Balance Due" : "Account Settled"}
          </span>
        </div>
      </div>

      {/* Ledger Quick Actions Banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-[#0b3d2e] border border-emerald-800 text-white p-4 sm:p-5 rounded-2xl shadow-xl gap-4">
        <span className="font-heading font-bold text-sm text-white">
          Record New Entry for {customer.name}:
        </span>
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            onClick={() => onOpenSaleModalForCustomer(customer.id)}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 bg-amber-400 hover:bg-amber-300 text-[#0b3d2e] font-extrabold text-xs px-4 py-2.5 rounded-xl shadow transition active:scale-95 button-press-anim"
          >
            <ShoppingCart className="w-4 h-4 stroke-[2.5]" />
            <span>+ Record Sale</span>
          </button>
          <button
            onClick={() => onOpenPaymentModalForCustomer(customer.id)}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow transition active:scale-95 button-press-anim"
          >
            <CreditCard className="w-4 h-4 stroke-[2.5]" />
            <span>+ Record Payment</span>
          </button>
        </div>
      </div>

      {/* Customer Ledger Statement Table */}
      <div className="bg-[#0f172a] rounded-3xl border border-slate-800 shadow-xl overflow-hidden hover-card-anim">
        <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/50">
          <h3 className="font-heading font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <span>Date-wise Statement Ledger</span>
          </h3>
          <span className="text-xs text-slate-400 font-semibold">
            Total Entries: {ledgerItems.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans">
            <thead>
              <tr className="bg-[#18233c] border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Transaction / Description</th>
                <th className="py-3.5 px-4 text-center">Birds</th>
                <th className="py-3.5 px-4 text-right">Weight (kg)</th>
                <th className="py-3.5 px-4 text-right">Rate (₹)</th>
                <th className="py-3.5 px-4 text-right text-rose-400">Debit (+ Sale)</th>
                <th className="py-3.5 px-4 text-right text-emerald-400">Credit (- Pay)</th>
                <th className="py-3.5 px-4 text-right">Running Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {ledgerItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                    No ledger transactions recorded yet for this customer.
                  </td>
                </tr>
              ) : (
                ledgerItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/50 transition">
                    <td className="py-3.5 px-4 font-medium text-slate-300 whitespace-nowrap">
                      {formatDate(item.date)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white">
                      <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                        item.type === "Sale" ? "bg-amber-400" : item.type === "Payment" ? "bg-emerald-400" : "bg-slate-400"
                      }`} />
                      {item.description}
                    </td>
                    <td className="py-3.5 px-4 text-center font-medium text-slate-300">
                      {item.birds ? item.birds : "-"}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-200">
                      {item.weight_kg ? `${item.weight_kg} kg` : "-"}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-300">
                      {item.rate ? `₹${item.rate}` : "-"}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-rose-400 tabular-nums">
                      {item.debit > 0 ? formatCurrency(item.debit) : "-"}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-400 tabular-nums">
                      {item.credit > 0 ? formatCurrency(item.credit) : "-"}
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-white tabular-nums">
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
