import React from "react";
import { Navigate } from "react-router-dom";
import { getCurrentUser } from "../lib/auth";

export const PublicRoute = ({ children }) => {
  const user = getCurrentUser();

  if (user) {
    if (user.role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
