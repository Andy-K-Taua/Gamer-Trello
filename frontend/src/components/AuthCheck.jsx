// frontend/src/components/AuthCheck.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Loader2 } from 'lucide-react';

const AuthCheck = ({ children }) => {
  const { authUser, isCheckingAuth } = useAuthStore();
  const location = useLocation();

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  }

  // 1. If they aren't logged in at all, kick them to signup
  if (!authUser) {
    return <Navigate to="/signup" replace />;
  }

  // 2. CRITICAL BREAKPOINT: If they are on their way to /subscription, 
  // LET THEM THROUGH! Do not force them back to the games list.
  if (location.pathname === '/subscription') {
    return children;
  }

  // 3. Otherwise, let them proceed normally to protected pages
  return children;
};

export default AuthCheck;