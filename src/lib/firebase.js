import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc,
  onSnapshot,
  query
} from "firebase/firestore";
import { getTodayString } from "./utils";
import { firebaseConfig } from "../firebaseConfig";

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);

// Helper to strip undefined values before Firestore writes
export function sanitizeForFirestore(obj) {
  if (!obj || typeof obj !== "object") return obj;
  const clean = {};
  Object.keys(obj).forEach((key) => {
    if (obj[key] !== undefined) {
      clean[key] = obj[key];
    }
  });
  return clean;
}

// Role and Customer portal state helpers
export function getActiveRole() {
  return localStorage.getItem("a_one_star_role_v1") || 'admin';
}

export function setActiveRole(role) {
  localStorage.setItem("a_one_star_role_v1", role);
  notifyListeners();
}

export function getActiveCustomerId() {
  const stored = localStorage.getItem("a_one_star_active_customer_id_v1");
  if (stored) return stored;
  const custs = getLocalCustomers();
  return custs.length > 0 ? custs[0].id : "cust-1";
}

export function setActiveCustomerId(id) {
  localStorage.setItem("a_one_star_active_customer_id_v1", id);
  notifyListeners();
}

// LOCAL STORAGE KEYS
const LOCAL_STORAGE_KEYS = {
  CUSTOMERS: "a_one_star_customers_v2",
  SALES: "a_one_star_sales_v2",
  PAYMENTS: "a_one_star_payments_v2",
  SETTINGS: "a_one_star_settings_v2",
  REMINDER_LOGS: "a_one_star_reminder_logs_v2",
  ROLE: "a_one_star_role_v1",
  ACTIVE_CUSTOMER_ID: "a_one_star_active_customer_id_v1"
};

// Initial Seed Customers
const INITIAL_CUSTOMERS = [
  {
    id: "cust-1",
    name: "Al-Madina Chicken Shop",
    phone: "9876543210",
    whatsapp_number: "9876543210",
    address: "Market Road, Shop No. 12",
    status: "active",
    reminder_enabled: true,
    opening_balance: 5000,
    opening_balance_date: "2026-08-01",
    opening_balance_notes: "Initial balance carried over",
    current_balance: 14600,
    created_at: new Date("2026-08-01").toISOString()
  },
  {
    id: "cust-2",
    name: "Star Broiler Center",
    phone: "9123456789",
    whatsapp_number: "9123456789",
    address: "Station Area, Main Gate",
    status: "active",
    reminder_enabled: true,
    opening_balance: 0,
    opening_balance_date: "2026-08-05",
    current_balance: 8400,
    created_at: new Date("2026-08-05").toISOString()
  },
  {
    id: "cust-3",
    name: "Golden Poultry Wholesale",
    phone: "9988776655",
    whatsapp_number: "9988776655",
    address: "Bypass Highway",
    status: "active",
    reminder_enabled: true,
    opening_balance: 2000,
    opening_balance_date: "2026-08-10",
    current_balance: 0,
    created_at: new Date("2026-08-10").toISOString()
  }
];

const INITIAL_SALES = [
  {
    id: "sale-1",
    customer_id: "cust-1",
    customer_name: "Al-Madina Chicken Shop",
    sale_date: getTodayString(),
    quantity_of_broilers: 50,
    weight_kg: 120,
    rate_per_kg: 130,
    total_amount: 15600,
    notes: "Morning delivery - Grade A Live Chicken",
    created_at: new Date().toISOString()
  },
  {
    id: "sale-2",
    customer_id: "cust-2",
    customer_name: "Star Broiler Center",
    sale_date: getTodayString(),
    quantity_of_broilers: 30,
    weight_kg: 70,
    rate_per_kg: 120,
    total_amount: 8400,
    notes: "Regular supply batch",
    created_at: new Date().toISOString()
  }
];

const INITIAL_PAYMENTS = [
  {
    id: "pay-1",
    customer_id: "cust-1",
    customer_name: "Al-Madina Chicken Shop",
    payment_date: getTodayString(),
    amount: 6000,
    payment_mode: "UPI",
    payment_gateway: "UPI_Direct",
    transaction_id: "TXN_UPI_9876543210",
    payment_status: "successful",
    notes: "GPay transfer for previous bill",
    created_at: new Date().toISOString()
  }
];

const DEFAULT_SETTINGS = {
  shop_name: "A ONE STAR",
  tagline: "Bharosa Bhi, Hisaab Bhi",
  phone: "+91 9035126865",
  address: "Nath pai circle, Shahapur, Belagavi, Karnataka 590005",
  upi_id: "aonestar@upi",
  default_rate_per_kg: 130,
  reminder_enabled_global: true,
  reminder_time: "09:00",
  last_reminder_run: new Date().toISOString(),
  successful_reminders_count: 5,
  failed_reminders_count: 0
};

// Reactive Event Emitter
const listeners = new Set();
const notifyListeners = () => listeners.forEach(l => l());

export function subscribeToStore(callback) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

// REAL-TIME FIRESTORE REACTIVE LISTENERS
try {
  onSnapshot(query(collection(db, "customers")), (snapshot) => {
    if (!snapshot.empty) {
      const remoteCustomers = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      localStorage.setItem(LOCAL_STORAGE_KEYS.CUSTOMERS, JSON.stringify(remoteCustomers));
      notifyListeners();
    }
  }, () => {});

  onSnapshot(query(collection(db, "sales")), (snapshot) => {
    if (!snapshot.empty) {
      const remoteSales = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      localStorage.setItem(LOCAL_STORAGE_KEYS.SALES, JSON.stringify(remoteSales));
      notifyListeners();
    }
  }, () => {});

  onSnapshot(query(collection(db, "payments")), (snapshot) => {
    if (!snapshot.empty) {
      const remotePayments = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      localStorage.setItem(LOCAL_STORAGE_KEYS.PAYMENTS, JSON.stringify(remotePayments));
      notifyListeners();
    }
  }, () => {});
} catch (e) {
  // Fallback to local storage if Firestore offline
}

// Memory getters with persistence & migration
export function getLocalCustomers() {
  const data = localStorage.getItem(LOCAL_STORAGE_KEYS.CUSTOMERS);
  if (!data) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
    return INITIAL_CUSTOMERS;
  }
  try {
    const list = JSON.parse(data);
    return list.map(c => ({
      ...c,
      whatsapp_number: c.whatsapp_number || c.phone || "",
      reminder_enabled: c.reminder_enabled !== undefined ? c.reminder_enabled : true
    }));
  } catch {
    return INITIAL_CUSTOMERS;
  }
}

export function getLocalSales() {
  const data = localStorage.getItem(LOCAL_STORAGE_KEYS.SALES);
  if (!data) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.SALES, JSON.stringify(INITIAL_SALES));
    return INITIAL_SALES;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_SALES;
  }
}

export function getLocalPayments() {
  const data = localStorage.getItem(LOCAL_STORAGE_KEYS.PAYMENTS);
  if (!data) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.PAYMENTS, JSON.stringify(INITIAL_PAYMENTS));
    return INITIAL_PAYMENTS;
  }
  try {
    const list = JSON.parse(data);
    return list.map(p => ({
      ...p,
      payment_gateway: p.payment_gateway || "Manual",
      transaction_id: p.transaction_id || `TXN_${p.id}`,
      payment_status: p.payment_status || "successful"
    }));
  } catch {
    return INITIAL_PAYMENTS;
  }
}

export function getLocalSettings() {
  const data = localStorage.getItem(LOCAL_STORAGE_KEYS.SETTINGS);
  if (!data) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    return DEFAULT_SETTINGS;
  }
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function getLocalReminderLogs() {
  const data = localStorage.getItem(LOCAL_STORAGE_KEYS.REMINDER_LOGS);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function addReminderLog(log) {
  const logs = getLocalReminderLogs();
  const newLog = {
    id: "rem_log_" + Date.now(),
    ...log
  };
  logs.unshift(newLog);
  localStorage.setItem(LOCAL_STORAGE_KEYS.REMINDER_LOGS, JSON.stringify(logs));
  
  const settings = getLocalSettings();
  if (log.status === "successful") {
    settings.successful_reminders_count = (settings.successful_reminders_count || 0) + 1;
  } else {
    settings.failed_reminders_count = (settings.failed_reminders_count || 0) + 1;
  }
  settings.last_reminder_run = new Date().toISOString();
  saveSettings(settings);

  notifyListeners();
  return newLog;
}

// Recalculate customer balance helper
export function recalculateCustomerBalance(customerId) {
  const customers = getLocalCustomers();
  const sales = getLocalSales();
  const payments = getLocalPayments();

  const customer = customers.find(c => c.id === customerId);
  if (!customer) return;

  const totalSales = sales
    .filter(s => s.customer_id === customerId)
    .reduce((sum, s) => sum + (s.total_amount || 0), 0);

  const totalPayments = payments
    .filter(p => p.customer_id === customerId && (p.payment_status === "successful" || !p.payment_status))
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  customer.current_balance = (customer.opening_balance || 0) + totalSales - totalPayments;
  customer.updated_at = new Date().toISOString();

  localStorage.setItem(LOCAL_STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  notifyListeners();

  try {
    const cleanCustomer = sanitizeForFirestore(customer);
    setDoc(doc(db, "customers", customerId), cleanCustomer, { merge: true }).catch(() => {});
  } catch (e) {}
}

export function saveCustomer(customerData) {
  const customers = getLocalCustomers();
  let updatedCust;

  if (customerData.id) {
    const idx = customers.findIndex(c => c.id === customerData.id);
    if (idx !== -1) {
      updatedCust = {
        ...customers[idx],
        ...customerData,
        whatsapp_number: customerData.whatsapp_number || customerData.phone || "",
        updated_at: new Date().toISOString()
      };
      customers[idx] = updatedCust;
    } else {
      throw new Error("Customer not found");
    }
  } else {
    const newId = "cust_" + Date.now();
    updatedCust = {
      id: newId,
      ...customerData,
      whatsapp_number: customerData.whatsapp_number || customerData.phone || "",
      reminder_enabled: customerData.reminder_enabled !== undefined ? customerData.reminder_enabled : true,
      current_balance: customerData.opening_balance || 0,
      created_at: new Date().toISOString()
    };
    customers.unshift(updatedCust);
  }

  localStorage.setItem(LOCAL_STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  if (updatedCust.id) {
    recalculateCustomerBalance(updatedCust.id);
  }
  notifyListeners();

  try {
    const cleanCust = sanitizeForFirestore(updatedCust);
    setDoc(doc(db, "customers", updatedCust.id), cleanCust, { merge: true }).catch((err) => {
      console.error("Error writing customer to Firestore:", err);
    });
  } catch (e) {}

  return updatedCust;
}

export function deleteCustomer(id) {
  let customers = getLocalCustomers().filter(c => c.id !== id);
  localStorage.setItem(LOCAL_STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  
  let sales = getLocalSales().filter(s => s.customer_id !== id);
  let payments = getLocalPayments().filter(p => p.customer_id !== id);
  localStorage.setItem(LOCAL_STORAGE_KEYS.SALES, JSON.stringify(sales));
  localStorage.setItem(LOCAL_STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
  
  notifyListeners();

  try {
    deleteDoc(doc(db, "customers", id)).catch(() => {});
  } catch (e) {}
}

export function addSale(saleData) {
  if (saleData.weight_kg <= 0 || saleData.rate_per_kg <= 0) {
    throw new Error("Weight and Rate per kg must be greater than zero.");
  }
  if (saleData.quantity_of_broilers !== undefined && saleData.quantity_of_broilers < 0) {
    throw new Error("Quantity of broilers cannot be negative.");
  }

  const sales = getLocalSales();
  const customers = getLocalCustomers();
  const customer = customers.find(c => c.id === saleData.customer_id);

  const newSale = {
    id: "sale_" + Date.now(),
    ...saleData,
    customer_name: customer ? customer.name : "Unknown Customer",
    created_at: new Date().toISOString()
  };

  sales.unshift(newSale);
  localStorage.setItem(LOCAL_STORAGE_KEYS.SALES, JSON.stringify(sales));
  recalculateCustomerBalance(newSale.customer_id);
  notifyListeners();

  try {
    const cleanSale = sanitizeForFirestore(newSale);
    setDoc(doc(db, "sales", newSale.id), cleanSale).catch((err) => {
      console.error("Error writing sale to Firestore:", err);
    });
  } catch (e) {}

  return newSale;
}

export function deleteSale(id) {
  const sales = getLocalSales();
  const sale = sales.find(s => s.id === id);
  if (!sale) return;

  const filtered = sales.filter(s => s.id !== id);
  localStorage.setItem(LOCAL_STORAGE_KEYS.SALES, JSON.stringify(filtered));
  recalculateCustomerBalance(sale.customer_id);
  notifyListeners();

  try {
    deleteDoc(doc(db, "sales", id)).catch(() => {});
  } catch (e) {}
}

export function addPayment(paymentData) {
  if (paymentData.amount <= 0) {
    throw new Error("Payment amount must be greater than zero.");
  }

  const payments = getLocalPayments();
  const customers = getLocalCustomers();
  const customer = customers.find(c => c.id === paymentData.customer_id);

  const newPayment = {
    id: "pay_" + Date.now(),
    transaction_id: paymentData.transaction_id || `TXN_${Date.now()}`,
    payment_gateway: paymentData.payment_gateway || "Manual",
    payment_status: paymentData.payment_status || "successful",
    ...paymentData,
    customer_name: customer ? customer.name : "Unknown Customer",
    created_at: new Date().toISOString()
  };

  payments.unshift(newPayment);
  localStorage.setItem(LOCAL_STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
  recalculateCustomerBalance(newPayment.customer_id);
  notifyListeners();

  try {
    const cleanPayment = sanitizeForFirestore(newPayment);
    setDoc(doc(db, "payments", newPayment.id), cleanPayment).catch((err) => {
      console.error("Error writing payment to Firestore:", err);
    });
  } catch (e) {
    console.error("Firestore Payment Error:", e);
  }

  return newPayment;
}

export function deletePayment(id) {
  const payments = getLocalPayments();
  const payment = payments.find(p => p.id === id);
  if (!payment) return;

  const filtered = payments.filter(p => p.id !== id);
  localStorage.setItem(LOCAL_STORAGE_KEYS.PAYMENTS, JSON.stringify(filtered));
  recalculateCustomerBalance(payment.customer_id);
  notifyListeners();

  try {
    deleteDoc(doc(db, "payments", id)).catch(() => {});
  } catch (e) {}
}

export function saveSettings(newSettings) {
  const current = getLocalSettings();
  const updated = { ...current, ...newSettings };
  localStorage.setItem(LOCAL_STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
  notifyListeners();

  try {
    const cleanSettings = sanitizeForFirestore(updated);
    setDoc(doc(db, "settings", "shop_settings"), cleanSettings, { merge: true }).catch(() => {});
  } catch (e) {}

  return updated;
}
