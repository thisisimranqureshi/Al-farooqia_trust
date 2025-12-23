import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useFirebase } from "../context/FirebaseContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useFirebase();
  const location = useLocation();

  if (loading) return <p>Loading...</p>;

  // If user is not logged in → go to login and remember where he came from
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // ---- ADMIN PROTECTION ----
  const adminEmail = "alfarooqiaadmin@gmail.com";

  if (location.pathname.startsWith("/dashboard")) {
    if (user.email !== adminEmail) {
      return <Navigate to="/login" replace />;
    }
  }

  return children;
}
