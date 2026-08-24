import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from "react-router-dom";
import { Toaster } from "sonner";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminLayout } from "./components/AdminLayout";
import { CustomerLayout } from "./components/CustomerLayout";
import { SplashScreen } from "./components/SplashScreen";

// Public Pages
import { LandingPage } from "./pages/LandingPage";
import { AdminLogin } from "./pages/auth/AdminLogin";
import { CustomerLogin } from "./pages/auth/CustomerLogin";
import { CustomerSignup } from "./pages/auth/CustomerSignup";
import { VerifyOtp } from "./pages/auth/VerifyOtp";
import { ForgotPassword } from "./pages/auth/ForgotPassword";

// Protected Admin Pages
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminCustomers } from "./pages/admin/AdminCustomers";
import { AdminSales } from "./pages/admin/AdminSales";
import { AdminPayments } from "./pages/admin/AdminPayments";
import { AdminReports } from "./pages/admin/AdminReports";
import { AdminSettings } from "./pages/admin/AdminSettings";
import { CustomerLedger } from "./pages/CustomerLedger";

// Protected Customer Pages
import { CustomerDashboard } from "./pages/customer/CustomerDashboard";
import { CustomerPurchases } from "./pages/customer/CustomerPurchases";
import { CustomerPayments } from "./pages/customer/CustomerPayments";
import { CustomerProfile } from "./pages/customer/CustomerProfile";

// Global Modals
import { QuickSaleModal } from "./components/QuickSaleModal";
import { QuickPaymentModal } from "./components/QuickPaymentModal";
import { CustomerFormModal } from "./components/CustomerFormModal";

// Helper component to handle /customers/:id redirects to /admin/customers/:id
const CustomerIdRedirect = () => {
  const { id } = useParams();
  return <Navigate to={`/admin/customers/${id}`} replace />;
};

export function App() {
  const [showSplash, setShowSplash] = useState(true);

  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  const [preselectedCustomerId, setPreselectedCustomerId] = useState();
  const [customerToEdit, setCustomerToEdit] = useState(null);

  const handleOpenSaleModal = (customerId) => {
    setPreselectedCustomerId(customerId);
    setIsSaleModalOpen(true);
  };

  const handleOpenPaymentModal = (customerId) => {
    setPreselectedCustomerId(customerId);
    setIsPaymentModalOpen(true);
  };

  const handleOpenCustomerModal = (customer) => {
    setCustomerToEdit(customer || null);
    setIsCustomerModalOpen(true);
  };

  return (
    <Router>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      <Toaster position="top-right" richColors />

      <Routes>
        {/* PUBLIC LANDING & AUTH ROUTES */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/login" element={<CustomerLogin />} />
        <Route path="/register" element={<CustomerSignup />} />
        <Route path="/signup" element={<CustomerSignup />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* PROTECTED ADMIN WORKSTATION ROUTES */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminLayout
                onOpenSaleModal={() => handleOpenSaleModal()}
                onOpenPaymentModal={() => handleOpenPaymentModal()}
              >
                <Routes>
                  <Route
                    path="dashboard"
                    element={
                      <AdminDashboard
                        onOpenSaleModal={() => handleOpenSaleModal()}
                        onOpenPaymentModal={() => handleOpenPaymentModal()}
                        onOpenCustomerModal={() => handleOpenCustomerModal()}
                      />
                    }
                  />
                  <Route
                    path="sales"
                    element={<AdminSales onOpenSaleModal={() => handleOpenSaleModal()} />}
                  />
                  <Route
                    path="customers"
                    element={
                      <AdminCustomers
                        onOpenCustomerModal={(c) => handleOpenCustomerModal(c)}
                      />
                    }
                  />
                  <Route
                    path="customers/:id"
                    element={
                      <CustomerLedger
                        onOpenSaleModalForCustomer={(id) => handleOpenSaleModal(id)}
                        onOpenPaymentModalForCustomer={(id) => handleOpenPaymentModal(id)}
                      />
                    }
                  />
                  <Route
                    path="payments"
                    element={<AdminPayments onOpenPaymentModal={() => handleOpenPaymentModal()} />}
                  />
                  <Route path="reports" element={<AdminReports />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* PROTECTED CUSTOMER PORTAL ROUTES */}
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute allowedRole="customer">
              <CustomerLayout>
                <Routes>
                  <Route path="" element={<CustomerDashboard />} />
                  <Route path="purchases" element={<CustomerPurchases />} />
                  <Route path="payments" element={<CustomerPayments />} />
                  <Route path="profile" element={<CustomerProfile />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </CustomerLayout>
            </ProtectedRoute>
          }
        />

        {/* ALIAS REDIRECT ROUTES (prevents accidental fallback to root) */}
        <Route path="/customers" element={<Navigate to="/admin/customers" replace />} />
        <Route path="/customers/:id" element={<CustomerIdRedirect />} />
        <Route path="/sales" element={<Navigate to="/admin/sales" replace />} />
        <Route path="/payments" element={<Navigate to="/admin/payments" replace />} />
        <Route path="/reports" element={<Navigate to="/admin/reports" replace />} />
        <Route path="/settings" element={<Navigate to="/admin/settings" replace />} />
        <Route path="/profile" element={<Navigate to="/dashboard/profile" replace />} />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global Action Modals for Admin */}
      <QuickSaleModal
        isOpen={isSaleModalOpen}
        onClose={() => setIsSaleModalOpen(false)}
        preselectedCustomerId={preselectedCustomerId}
      />

      <QuickPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        preselectedCustomerId={preselectedCustomerId}
      />

      <CustomerFormModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        customerToEdit={customerToEdit}
      />
    </Router>
  );
}

export default App;
