// src/components/ProtectedRoute.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const { user, loading } = useAuth(); // 1. Get the new loading state

  // 2. Show nothing (or a spinner) while we check for a user
  if (loading) {
    return null; 
    // You could also return a full-page loading spinner here
  }

  // 3. Once loading is false, check if the user exists
  if (!user) {
    // If not, redirect them to the /login page
    return <Navigate to="/login" replace />;
  }

  // 4. If they are logged in, render the child route (AppLayout, etc.)
  return <Outlet />;
};

export default ProtectedRoute;