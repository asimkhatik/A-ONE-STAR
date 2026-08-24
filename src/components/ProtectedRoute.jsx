import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getCurrentUser, subscribeToAuth } from "../lib/auth";
import { toast } from "sonner";

export const ProtectedRoute = ({
  children,
  allowedRole,
}) => {
  const [user, setUser] = useState(getCurrentUser());
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = subscribeToAuth((u) => setUser(u));
    return () => unsubscribe();
  }, []);

  if (!user) {
    if (allowedRole === 'admin') {
      toast.error("Please login with Admin credentials to access the Admin Panel.");
      return <Navigate to="/admin/login" state={{ from }} replace />;
    } else {
      toast.error("Please login to access your Customer Dashboard.");
      return <Navigate to="/login" state={{ from }} replace />;
    }
  }

  // Check role authorization
  if (user.role !== allowedRole) {
    if (user.role === 'customer' && allowedRole === 'admin') {
      toast.error("Access Denied privileges are required to view this page.");
      return <Navigate to="/dashboard" replace />;
    } else if (user.role === 'admin' && allowedRole === 'customer') {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  return children;
};
