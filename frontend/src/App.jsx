// frontend/src/App.jsx

import React, { useEffect } from 'react';
import HomePage from './pages/HomePage';
import SignUpPage from './pages/SignUpPage';

import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import { Toaster } from "react-hot-toast";
import ProtectedRoutes from './components/ProtectedRoutes';

const App = () => {
  const location = useLocation();
  console.log('App component rendered');

  useEffect(() => {
    const handlePopState = () => {
      if (['/signup', '/subscription'].includes(location.pathname)) {
        window.history.go(1);
      }
    };
  
    window.history.pushState(null, null, location.href);
    window.addEventListener('popstate', handlePopState);
  
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [location]);

  return (
    <div>
            {console.log('App component return statement executed')}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/*" element={<ProtectedRoutes />} />
      </Routes>

      <Toaster />
    </div>
  )
}

export default App