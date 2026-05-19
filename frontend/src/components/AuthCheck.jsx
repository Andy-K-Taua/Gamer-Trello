// frontend/src/components/AuthCheck.jsx

import React, { useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useLocation, Navigate } from 'react-router-dom';
import { Loader } from "lucide-react";

const AuthCheck = ({ children }) => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    // Only fetch auth state if it hasn't been verified yet
    if (!authUser) {
      checkAuth();
    }
  }, [checkAuth, authUser]);

  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen bg-base-200">
        <Loader className="size-10 animate-spin text-primary" />
      </div>
    );
  }

  // If they are completely unauthenticated, boot to signup
  if (!authUser) {
    return <Navigate to="/signup" replace />;
  }

  // BREAK THE LOOP: If they are explicitly trying to view the subscription layout,
  // let them pass! Do not evaluate approval state rules here.
  if (location.pathname === '/subscription') {
    return children;
  }

  return children;
};

export default AuthCheck;