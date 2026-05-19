// frontend/src/pages/SignUpPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const SignUpPage = () => {
  const navigate = useNavigate();
  const { signup, authUser, isSigningUp } = useAuthStore();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    mobile: ''
  });

  // =========================================================
  // THE CRITICAL REDIRECT ROUTER GUARD
  // =========================================================
  useEffect(() => {
    if (authUser) {
      if (authUser.approvalStatus === "approved") {
        // Look closely at your network payload: an approved user without an 
        // active subscription item defaults to a baseline 'free' profile marker.
        if (authUser.subscriptionPlan === "free") {
          console.log("User approved but lacks subscription document. Routing to pricing selection...");
          navigate('/subscription', { replace: true });
        } else {
          console.log("User active and subscribed. Accessing dashboard...");
          navigate('/games-list', { replace: true });
        }
      } else {
        // Account exists but approvalStatus is still 'pending'
        toast.error("Your account registration is currently pending admin approval.");
      }
    }
  }, [authUser, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password || !formData.mobile) {
      return toast.error("All input fields are required.");
    }

    try {
      // Fires unified auth controller track (handles login if email matches)
      await signup(formData);
    } catch (error) {
      console.error("Authentication execution error:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <div className="card w-full max-w-md bg-white shadow-xl rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Sign In / Register Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label font-medium text-gray-700">Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="name@company.com"
              value={formData.email}
              onChange={handleChange}
              className="input input-bordered w-full text-gray-800"
            />
          </div>

          <div>
            <label className="label font-medium text-gray-700">Mobile Number</label>
            <input
              type="text"
              name="mobile"
              placeholder="0400000000"
              value={formData.mobile}
              onChange={handleChange}
              className="input input-bordered w-full text-gray-800"
            />
          </div>

          <div>
            <label className="label font-medium text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="input input-bordered w-full text-gray-800"
            />
          </div>

          <button
            type="submit"
            disabled={isSigningUp}
            className="btn btn-primary w-full mt-4 flex items-center justify-center gap-2"
          >
            {isSigningUp ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                Processing Account Details...
              </>
            ) : (
              'Continue Access'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUpPage;