import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Users, 
  UserPlus, 
  Search, 
  FileSpreadsheet, 
  Edit3, 
  Trash2, 
  ChevronRight,
  Power,
  MessageSquare
} from "lucide-react";
import { getLocalCustomers, deleteCustomer, saveCustomer, subscribeToStore } from "../../lib/firebase";
import { sendWhatsAppReminderToCustomer } from "../../lib/whatsappReminder";
import { formatCurrency } from "../../lib/utils";
import { exportCustomersToExcel } from "../../lib/excelExporter";
import { toast } from "sonner";

export const AdminCustomers = ({ onOpenCustomerModal }) => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadData = () => {
    setCustomers(getLocalCustomers());
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToStore(loadData);
    return () => unsubscribe();
  }, []);

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete customer "${name}"? This will remove all associated sales & payment history.`)) {
      deleteCustomer(id);
      toast.success(`Customer "${name}" deleted`);
    }
  };

  const handleToggleStatus = (customer) => {
    const newStatus = customer.status === "active" ? "inactive" : "active";
    saveCustomer({
      ...customer,
      status: newStatus,
    });
    toast.success(`Customer "${customer.name}" status changed to ${newStatus.toUpperCase()}`);
  };

  const handleSendWhatsApp = (customer) => {
    const res = sendWhatsAppReminderToCustomer(customer, true);
    if (res.success) {
      toast.success(`WhatsApp Web launched for ${customer.name}`);
    } else {
      toast.error(res.message || "Failed to launch WhatsApp");
    }
    loadData();
  };

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone || "").includes(searchTerm) ||
      (c.address || "").toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    return true;
  });

  const totalOutstanding = customers.reduce((sum, c) => sum + (c.current_balance > 0 ? c.current_balance : 0), 0);

  return (
    <div className="space-y-6 pb-12 font-sans text-white">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-7 h-7 text-amber-400" />
            <span>Admin Customer Management</span>
          </h1>
          <p className="text-sm text-slate-400">View, add, edit, activate, or deactivate buyer accounts</p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            onClick={() => exportCustomersToExcel(filteredCustomers)}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 font-semibold text-sm px-4 py-2.5 rounded-xl border border-emerald-700/60 transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-amber-400" />
            <span>Export Excel</span>
          </button>
          <button
            onClick={() => onOpenCustomerModal()}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 bg-amber-400 hover:bg-amber-300 text-[#0b3d2e] font-extrabold text-sm px-5 py-2.5 rounded-xl shadow-lg transition"
          >
            <UserPlus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Add Customer</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#0f172a] p-5 rounded-3xl border border-slate-800 shadow-xl">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, phone, address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#18233c] border border-slate-700/80 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-medium transition"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-1 bg-[#18233c] p-1 rounded-xl border border-slate-700/80">
          <button
            onClick={() => setStatusFilter("all")}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
              statusFilter === "all" ? "bg-amber-400 text-[#0b3d2e] shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            All ({customers.length})
          </button>
          <button
            onClick={() => setStatusFilter("active")}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
              statusFilter === "active" ? "bg-amber-400 text-[#0b3d2e] shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setStatusFilter("inactive")}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
              statusFilter === "inactive" ? "bg-amber-400 text-[#0b3d2e] shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            Inactive
          </button>
        </div>

        {/* Outstanding Total Banner */}
        <div className="flex items-center justify-between bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl">
          <span className="text-xs font-bold text-rose-300 uppercase">Total Outstanding</span>
          <span className="text-lg font-extrabold text-rose-400">
            {formatCurrency(totalOutstanding)}
          </span>
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="bg-[#0f172a] rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-900/60 border-b border-slate-800 text-xs font-bold text-slate-400 uppercase">
                <th className="py-4 px-4">Customer Name</th>
                <th className="py-4 px-4">Contact Phone</th>
                <th className="py-4 px-4">Address</th>
                <th className="py-4 px-4 text-center">Account Status</th>
                <th className="py-4 px-4 text-right">Ledger Balance</th>
                <th className="py-4 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    No matching customer records found.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-bold text-white">
                      <Link to={`/admin/customers/${customer.id}`} className="hover:text-amber-400 transition">
                        {customer.name}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">{customer.phone || "N/A"}</td>
                    <td className="py-3.5 px-4 text-slate-300 max-w-[200px] truncate">{customer.address || "N/A"}</td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(customer)}
                        className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-extrabold uppercase transition ${
                          customer.status === "active"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
                            : "bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30"
                        }`}
                        title="Click to toggle Active/Inactive"
                      >
                        <Power className="w-3 h-3" />
                        <span>{customer.status}</span>
                      </button>
                    </td>
                    <td className={`py-3.5 px-4 text-right font-extrabold ${
                      customer.current_balance > 0 ? "text-rose-400" : "text-emerald-400"
                    }`}>
                      {formatCurrency(customer.current_balance)}
                    </td>
                    <td className="py-3.5 px-4 text-center space-x-1.5 whitespace-nowrap">
                      {customer.current_balance > 0 && (
                        <button
                          onClick={() => handleSendWhatsApp(customer)}
                          className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition"
                          title={`Send WhatsApp Reminder to ${customer.name}`}
                        >
                          <MessageSquare className="w-4 h-4 fill-current" />
                        </button>
                      )}
                      <button
                        onClick={() => onOpenCustomerModal(customer)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                        title="Edit Customer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(customer.id, customer.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition"
                        title="Delete Customer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <Link
                        to={`/admin/customers/${customer.id}`}
                        className="inline-block p-1.5 bg-[#0b3d2e] text-amber-400 rounded-lg hover:bg-emerald-800 border border-emerald-700/60 shadow transition"
                        title="View Ledger Statement"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
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
