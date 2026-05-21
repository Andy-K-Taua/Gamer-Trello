import React from 'react';
import HomePage from './pages/HomePage';
import SignUpPage from './pages/SignUpPage';
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ProtectedRoutes from './components/ProtectedRoutes';

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/*" element={<ProtectedRoutes />} />
      </Routes>

      <Toaster />
    </div>
  );
};

export default App;