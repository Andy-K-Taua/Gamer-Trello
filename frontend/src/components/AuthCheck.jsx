// frontend/src/components/AuthCheck.jsx

import React, { useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useLocation, Navigate } from 'react-router-dom';
import { Loader } from "lucide-react";

const AuthCheck = ({ children }) => {
  const { authUser, checkAuth, isCheckingAuth, connectSocket, disconnectSocket } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // This effect ensures the socket connects ONLY when authUser is confirmed
  useEffect(() => {
    // Only connect if we have a user AND the socket is NOT currently connected
    if (authUser) {
      connectSocket();
    }
  }, [authUser]);

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen bg-base-200">
        <Loader className="size-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!authUser) {
    return <Navigate to="/signup" replace />;
  }

  return children;
};

export default AuthCheck;