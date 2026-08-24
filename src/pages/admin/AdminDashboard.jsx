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
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  Play,
  Bird,
  Calendar,
  Send
} from "lucide-react";
import { 
  getLocalCustomers, 
  getLocalSales, 
  getLocalPayments, 
  getLocalSettings,
  getLocalReminderLogs,
  saveSettings,
  subscribeToStore 
} from "../../lib/firebase";
import { runDailyWhatsAppReminders, sendWhatsAppReminderToCustomer } from "../../lib/whatsappReminder";
import { formatCurrency, formatDate, getTodayString } from "../../lib/utils";
import { AnimatedNumber } from "../../components/AnimatedNumber";
import { toast } from "sonner";

export const AdminDashboard = ({
  onOpenSaleModal,
  onOpenPaymentModal,
  onOpenCustomerModal
}) => {
  const [customers, setCustomers] = useState([]);
  const [sales, setSales] = useState([]);
  const [payments, setPayments] = useState([]);
  const [reminderLogs, setReminderLogs] = useState([]);
  const [settings, setSettings] = useState(getLocalSettings());

  const loadData = () => {
    setCustomers(getLocalCustomers());
    setSales(getLocalSales());
    setPayments(getLocalPayments());
    setReminderLogs(getLocalReminderLogs());
    setSettings(getLocalSettings());
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
  const todayBirdsSold = todaySalesList.reduce((sum, s) => sum + (s.quantity_of_broilers || 0), 0);
  const todayPaymentsCollected = todayPaymentsList.reduce((sum, p) => sum + p.amount, 0);
  const totalOutstandingBalance = customers.reduce((sum, c) => sum + (c.current_balance > 0 ? c.current_balance : 0), 0);
  const activeCustomersCount = customers.filter(c => c.status === "active").length;

  const handleToggleGlobalReminders = () => {
    const updated = saveSettings({
      reminder_enabled_global: !settings.reminder_enabled_global
    });
    setSettings(updated);
    toast.success(`WhatsApp Reminders globally ${updated.reminder_enabled_global ? "ENABLED" : "DISABLED"}`);
  };

  const handleRunRemindersNow = () => {
    const res = runDailyWhatsAppReminders(true);
    toast.success(`Reminders Processed: ${res.successful} sent, ${res.skipped} skipped, ${res.failed} failed.`);
    loadData();
  };

  const handleSendSingleReminder = (customer) => {
    const res = sendWhatsAppReminderToCustomer(customer, true);
    if (res.success) {
      toast.success(`WhatsApp Web launched for ${customer.name}`);
    } else {
      toast.error(res.message || "Failed to launch WhatsApp");
    }
    loadData();
  };

  return (
    <div className="space-y-6 pb-12 font-sans text-white">
      {/* Welcome & Quick Action Header Banner */}
      <div className="bg-[#0b3d2e] border border-emerald-800/80 p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center space-x-2 bg-amber-400/20 text-amber-300 text-xs px-3 py-1 rounded-full font-semibold border border-amber-400/30">
            <span>ADMIN WORKSTATION</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Business Overview & Control Panel
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200 flex items-center gap-1.5 font-medium">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>Today's Date: {formatDate(todayStr)}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto z-10">
          {onOpenSaleModal && (
            <button
              onClick={onOpenSaleModal}
              className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 bg-amber-400 hover:bg-amber-300 text-[#0b3d2e] font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-lg transition active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Record Sale</span>
            </button>
          )}
          {onOpenPaymentModal && (
            <button
              onClick={onOpenPaymentModal}
              className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-lg transition active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Payment</span>
            </button>
          )}
          {onOpenCustomerModal && (
            <button
              onClick={onOpenCustomerModal}
              className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl border border-slate-700 transition active:scale-95"
            >
              <Users className="w-4 h-4" />
              <span>+ Customer</span>
            </button>
          )}
        </div>
      </div>

      {/* Modern Dark Glassmorphism Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* 1. Today's Revenue */}
        <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800 shadow-xl hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Today's Sales Revenue</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-emerald-400 tracking-tight">
              <AnimatedNumber value={todaySalesRevenue} prefix="₹ " />
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              <span className="font-bold text-emerald-400">{todaySalesList.length}</span> sales recorded today
            </p>
          </div>
        </div>

        {/* 2. Weight Sold */}
        <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800 shadow-xl hover:border-blue-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Today's Weight Sold</span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-blue-400 tracking-tight">
              <AnimatedNumber value={todayWeightSold} decimals={1} suffix=" kg" />
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 font-medium">
              <Bird className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-bold text-slate-300">{todayBirdsSold}</span> broiler birds
            </p>
          </div>
        </div>

        {/* 3. Payments Received */}
        <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800 shadow-xl hover:border-amber-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Payments Collected</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-amber-400 tracking-tight">
              <AnimatedNumber value={todayPaymentsCollected} prefix="₹ " />
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              <span className="font-bold text-amber-400">{todayPaymentsList.length}</span> payments today
            </p>
          </div>
        </div>

        {/* 4. Total Outstanding */}
        <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800 shadow-xl hover:border-rose-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Outstanding</span>
            <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-rose-400 tracking-tight">
              <AnimatedNumber value={totalOutstandingBalance} prefix="₹ " />
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Across <span className="font-bold text-slate-300">{activeCustomersCount}</span> active buyers
            </p>
          </div>
        </div>
      </div>

      {/* WhatsApp Reminders Panel */}
      <div className="bg-[#0b3d2e] text-white rounded-3xl p-6 shadow-xl space-y-4 border border-emerald-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-emerald-800/80 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-800 text-amber-300 flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-lg text-white">
                Daily WhatsApp Payment Reminders Status
              </h3>
              <p className="text-xs text-emerald-300">
                Automated billing reminders for customers with outstanding balances
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              onClick={handleToggleGlobalReminders}
              className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase transition ${
                settings.reminder_enabled_global
                  ? "bg-amber-400 text-[#0b3d2e] shadow"
                  : "bg-red-500/20 text-red-300 border border-red-500/40"
              }`}
            >
              {settings.reminder_enabled_global ? "Reminders Enabled" : "Reminders Paused"}
            </button>

            <button
              onClick={handleRunRemindersNow}
              className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow transition active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Now (WhatsApp Web)</span>
            </button>
          </div>
        </div>

        {/* Reminders Status Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-1">
          <div className="bg-emerald-900/60 p-3.5 rounded-2xl border border-emerald-800">
            <span className="text-[11px] font-bold text-emerald-300 uppercase block">Scheduled Time</span>
            <span className="text-lg font-extrabold text-amber-300 flex items-center gap-1.5 mt-1 font-mono">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>{settings.reminder_time || "09 AM"} Daily</span>
            </span>
          </div>

          <div className="bg-emerald-900/60 p-3.5 rounded-2xl border border-emerald-800">
            <span className="text-[11px] font-bold text-emerald-300 uppercase block">Last Reminder Run</span>
            <span className="text-sm font-bold text-white mt-1 block">
              {settings.last_reminder_run ? formatDate(settings.last_reminder_run) : "Not run today"}
            </span>
          </div>

          <div className="bg-emerald-900/60 p-3.5 rounded-2xl border border-emerald-800">
            <span className="text-[11px] font-bold text-emerald-300 uppercase block">Successful Sent</span>
            <span className="text-lg font-extrabold text-emerald-400 flex items-center gap-1 mt-1 font-sans tabular-nums">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{settings.successful_reminders_count || 0} Reminders</span>
            </span>
          </div>

          <div className="bg-emerald-900/60 p-3.5 rounded-2xl border border-emerald-800">
            <span className="text-[11px] font-bold text-emerald-300 uppercase block">Failed / Errors</span>
            <span className="text-lg font-extrabold text-red-400 flex items-center gap-1 mt-1 font-sans tabular-nums">
              <XCircle className="w-4 h-4 text-red-400" />
              <span>{settings.failed_reminders_count || 0} Failed</span>
            </span>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Sales */}
        <div className="lg:col-span-2 bg-[#0f172a] rounded-3xl border border-slate-800 shadow-xl overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/50">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="w-5 h-5 text-amber-400" />
              <h3 className="font-heading font-bold text-white">Recent Live Chicken Sales</h3>
            </div>
            <Link to="/admin/sales" className="text-xs font-semibold text-amber-400 hover:underline flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-800/60 overflow-x-auto">
            {sales.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                No sales recorded yet. Click "+ Record Sale" to start.
              </div>
            ) : (
              sales.slice(0, 6).map((sale) => (
                <div key={sale.id} className="p-4 hover:bg-slate-800/50 flex items-center justify-between gap-4 transition">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold text-xs font-sans tabular-nums border border-amber-400/30">
                      {sale.weight_kg}kg
                    </div>
                    <div>
                      <Link to={`/admin/customers/${sale.customer_id}`} className="font-semibold text-white text-sm hover:text-amber-400 transition">
                        {sale.customer_name}
                      </Link>
                      <p className="text-xs text-slate-400">
                        {formatDate(sale.sale_date)} • {sale.quantity_of_broilers ? `${sale.quantity_of_broilers} birds @ ` : ""}₹ {sale.rate_per_kg}/kg
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-white text-sm block font-sans tabular-nums">
                      {formatCurrency(sale.total_amount)}
                    </span>
                    {sale.notes && <span className="text-[11px] text-slate-400 truncate max-w-[150px] inline-block">{sale.notes}</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Highest Outstanding Customers with Direct WhatsApp Reminder Button */}
        <div className="bg-[#0f172a] rounded-3xl border border-slate-800 shadow-xl overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/50">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-rose-400" />
              <h3 className="font-heading font-bold text-white">Highest Outstanding</h3>
            </div>
            <Link to="/admin/customers" className="text-xs font-semibold text-amber-400 hover:underline flex items-center gap-1">
              <span>All Buyers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-800/60 flex-1">
            {customers
              .filter(c => c.current_balance > 0)
              .sort((a, b) => b.current_balance - a.current_balance)
              .slice(0, 5)
              .map((customer) => (
                <div key={customer.id} className="p-4 hover:bg-slate-800/50 flex items-center justify-between gap-3 transition">
                  <div>
                    <Link to={`/admin/customers/${customer.id}`} className="font-semibold text-white text-sm hover:text-amber-400 block transition">
                      {customer.name}
                    </Link>
                    <span className="text-xs text-slate-400">{customer.phone || "No Phone"}</span>
                  </div>
                  <div className="text-right flex items-center space-x-2">
                    <div>
                      <span className="font-bold text-rose-400 text-sm block font-sans tabular-nums">
                        {formatCurrency(customer.current_balance)}
                      </span>
                      <Link to={`/admin/customers/${customer.id}`} className="text-[11px] font-medium text-amber-400 hover:underline">
                        View Ledger →
                      </Link>
                    </div>

                    <button
                      onClick={() => handleSendSingleReminder(customer)}
                      className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow transition"
                      title={`Send WhatsApp Reminder to ${customer.name}`}
                    >
                      <MessageSquare className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                </div>
              ))}
            {customers.filter(c => c.current_balance > 0).length === 0 && (
              <div className="p-8 text-center text-emerald-400 text-sm">
                No pending customer balances 🎉
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
