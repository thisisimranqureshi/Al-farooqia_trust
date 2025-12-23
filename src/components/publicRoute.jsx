import React from "react";
import { Navigate } from "react-router-dom";
import { useFirebase } from "../context/FirebaseContext";

export default function PublicRoute({ children }) {
  const { user, loading } = useFirebase();

  if (loading) return <p>Loading...</p>;

  // If user is already logged in → redirect to home
  if (user) return <Navigate to="/" replace />;

  return children;
}
