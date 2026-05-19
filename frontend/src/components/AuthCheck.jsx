// frontend/src/components/AuthCheck.jsx

import React, { useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Loader } from "lucide-react";

const AuthCheck = ({ children }) => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );

  return children;
};

export default AuthCheck;