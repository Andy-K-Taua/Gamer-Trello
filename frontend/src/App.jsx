// frontend/src/App.jsx

import React, { useEffect } from 'react';
import HomePage from './pages/HomePage';
import SignUpPage from './pages/SignUpPage';

import { Routes, Route, Navigate } from "react-router-dom";

import { Toaster } from "react-hot-toast";
import ProtectedRoutes from './components/ProtectedRoutes';

const App = () => {
  console.log('App component rendered');

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