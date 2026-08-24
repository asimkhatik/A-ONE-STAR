import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Users, 
  UserPlus, 
  Search, 
  FileSpreadsheet, 
  Edit3, 
  Trash2, 
  Phone, 
  MapPin, 
  ChevronRight,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { getLocalCustomers, deleteCustomer, subscribeToStore } from "../lib/firebase";
import { formatCurrency } from "../lib/utils";
import { exportCustomersToExcel } from "../lib/excelExporter";
import { toast } from "sonner";

export const Customers = ({ onOpenCustomerModal }) => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");

  const loadData = () => {
    setCustomers(getLocalCustomers());
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToStore(loadData);
    return () => unsubscribe();
  }, []);

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete customer "${name}"? This will also remove associated sales & payments.`)) {
      deleteCustomer(id);
      toast.success(`Customer "${name}" deleted`);
    }
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
    <div className="space-y-6 pb-12">
      {/* Title Header */}
      <div className="flex flex-col sm-row items-start sm-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-7 h-7 text-emerald-700" />
            <span>Customers & Buyers Directory</span>
          </h1>
          <p className="text-sm text-slate-500">Manage buyer details, opening balances, and view customer ledgers</p>
        </div>

        <div className="flex items-center space-x-3 w-full sm-auto">
          <button
            onClick={() => exportCustomersToExcel(filteredCustomers)}
            className="flex-1 sm-none flex items-center justify-center space-x-1.5 bg-emerald-100 hover-emerald-200 text-emerald-800 font-semibold text-sm px-4 py-2.5 rounded-xl border border-emerald-300 transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span>Export Excel</span>
          </button>
          <button
            onClick={() => onOpenCustomerModal()}
            className="flex-1 sm-none flex items-center justify-center space-x-1.5 bg-brand-900 hover-brand-800 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add Customer</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 md-cols-3 gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, phone, or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus-2 focus-emerald-500 focus-emerald-500"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setStatusFilter("active")}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
              statusFilter === "active" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover-slate-900"
            }`}
          >
            Active ({customers.filter(c => c.status === "active").length})
          </button>
          <button
            onClick={() => setStatusFilter("inactive")}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
              statusFilter === "inactive" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover-slate-900"
            }`}
          >
            Inactive
          </button>
          <button
            onClick={() => setStatusFilter("all")}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
              statusFilter === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover-slate-900"
            }`}
          >
            All
          </button>
        </div>

        {/* Total Outstanding Summary Banner */}
        <div className="flex items-center justify-between bg-red-50 border border-red-200 p-3 rounded-xl">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-xs font-bold text-red-900 uppercase tracking-wider">
              Total Outstanding
            </span>
          </div>
          <span className="text-lg font-extrabold text-red-600">
            {formatCurrency(totalOutstanding)}
          </span>
        </div>
      </div>

      {/* Customer Directory Grid / Table */}
      <div className="grid grid-cols-1 md-cols-2 lg-cols-3 gap-5">
        {filteredCustomers.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400">
            No customers found matching your criteria.
          </div>
        ) : (
          filteredCustomers.map((customer) => {
            const hasOutstanding = customer.current_balance > 0;
            return (
              <div 
                key={customer.id} 
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover-md transition flex flex-col justify-between overflow-hidden"
              >
                {/* Customer Top Bar */}
                <div className="p-5 border-b border-slate-100">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link 
                        to={`/customers/${customer.id}`}
                        className="font-heading text-lg font-bold text-slate-900 hover-emerald-700 hover block"
                      >
                        {customer.name}
                      </Link>
                      <div className="mt-1 space-y-1">
                        {customer.phone && (
                          <span className="text-xs text-slate-500 flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{customer.phone}</span>
                          </span>
                        )}
                        {customer.address && (
                          <span className="text-xs text-slate-500 flex items-center gap-1.5 truncate">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{customer.address}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      customer.status === "active" 
                        ? "bg-emerald-100 text-emerald-800" 
                        : "bg-slate-100 text-slate-500"
                    }`}>
                      {customer.status}
                    </span>
                  </div>
                </div>

                {/* Balance & Actions Section */}
                <div className="p-5 bg-slate-50/60 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                      Current Ledger Balance
                    </span>
                    <span className={`text-xl font-extrabold ${
                      hasOutstanding ? "text-red-600" : "text-emerald-700"
                    }`}>
                      {formatCurrency(customer.current_balance)}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      {hasOutstanding ? "Customer owes money" : "Clear / Prepaid"}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onOpenCustomerModal(customer)}
                      className="p-2 text-slate-400 hover-slate-700 hover-white rounded-lg transition"
                      title="Edit Customer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(customer.id, customer.name)}
                      className="p-2 text-slate-400 hover-red-600 hover-white rounded-lg transition"
                      title="Delete Customer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <Link
                      to={`/customers/${customer.id}`}
                      className="p-2 bg-emerald-800 text-white rounded-lg hover-emerald-700 shadow-sm transition flex items-center justify-center"
                      title="View Ledger Statement"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
