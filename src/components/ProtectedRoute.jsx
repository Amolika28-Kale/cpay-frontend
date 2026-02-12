import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  // Not logged in
  if (!token || !user) {
    return <Navigate to="/auth" replace />;
  }

  // Role mismatch
  if (role && user.role !== role) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}
