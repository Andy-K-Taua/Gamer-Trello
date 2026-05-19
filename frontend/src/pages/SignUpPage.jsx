// frontend/src/pages/SignUpPage.jsx

import React, { useState, useEffect } from 'react';
import { useAuthStore } from "../store/useAuthStore";
import { Eye, EyeOff, Loader2, Lock, Mail, Phone } from "lucide-react"; 
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '../lib/axios';
import toast from "react-hot-toast";

const TypeText = ({ text, speed = 40 }) => {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    let i = 0;
    const intervalId = setInterval(() => {
      if (i < text.length) {
        setDisplayText(text.substring(0, i + 1));
        i++;
      } else {
        clearInterval(intervalId);
      }
    }, speed);

    return () => clearInterval(intervalId);
  }, [text, speed]);

  return <span>{displayText}</span>;
};

const SignUpPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Local loading state for form action

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    mobile: "",
  });

  // Extract both the user payload and the store setter function to sync state
  const { authUser, setAuthUser } = useAuthStore(); 

  // AUTOMATIC ROUTE GUARD: If a user is already recorded in the store as logged in and approved,
  // do not force them to click submit again. Guide them seamlessly where they need to be.
  useEffect(() => {
    if (authUser && authUser.approvalStatus === "approved") {
      if (authUser.subscriptionPlan === "free") {
        navigate('/subscription', { replace: true });
      } else {
        navigate('/games-list', { replace: true });
      }
    }
  }, [authUser, navigate]);

  const validateForm = () => {
    if (!formData.email.trim()) { toast.error("Email is required"); return false; }
    if (!/\S+@\S+\.\S+/.test(formData.email)) { toast.error("Invalid email format"); return false; }
    if (!formData.mobile.trim()) { toast.error("Mobile number is required"); return false; }
    if (formData.password.length < 6) { toast.error("Password must be at least 6 characters"); return false; }

    return true;
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();

    const isValid = validateForm();
    if (!isValid) return;

    setIsSubmitting(true);

    try {
      // 1. Send the login/signup form data to backend
      const res = await axiosInstance.post('/auth/signup', formData);

      // ===================================================================
      // CRITICAL LOOP BREAK: Force Zustand to record who logged in!
      // This stops AuthCheck from viewing them as an unauthenticated guest.
      // ===================================================================
      if (res.data && !res.data.authUser) {
        // Fallback context mapping if payload object is flat
        setAuthUser(res.data);
      } else {
        setAuthUser(res.data.authUser);
      }

      if (res.data.isExistingUser) {
        try {
          // 2. Existing user check against subscription database collection
          const expiryRes = await axiosInstance.get('/subscriptions/check-expiry');

          if (expiryRes.status === 200) {
            toast.success("Welcome back!");
            navigate('/games-list', { replace: true });
          }
        } catch (expiryError) {
          // Handles the 401 response from the logs smoothly
          if (expiryError.response && expiryError.response.status === 401) {
            toast.success("Account verified! Please select a plan to activate access.");
            navigate('/subscription', { replace: true }); 
          } else {
            toast.error("An error occurred checking your access.");
          }
        }
      } else {
        // Brand new user route
        toast.success("Account created successfully!");
        navigate('/subscription', { replace: true });
      }

    } catch (error) {
      console.error("Auth submission error:", error);
      const errorMsg = error.response?.data?.message || "Invalid credentials";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="hero bg-base-200 min-h-screen">
      <div className="hero-content flex-col lg:flex-row-reverse">
        <div className="text-center lg:text-left">
          <h1 className="text-5xl font-bold">Create Account</h1>
          <p className="py-6">
            Create an account and experience a new found love for old school gaming. Take it with you wherever you go, challenge friends and family to beat your high score, and discover a world of limitless fun.
          </p>
        </div>
        <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
          <div className="card-body">

            <form onSubmit={handleAuthSubmit} className='space-y-6'>
              <fieldset className="fieldset">

                <label className="label">Email</label>
                <div className="flex items-center input rounded-[15px]">
                  <Mail className="size-5 text-base-content/40 mr-2" />
                  <input
                    type="email"
                    className="flex-1 border-none outline-none bg-transparent text-gray-800"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    autoComplete="new-email"
                  />
                </div>

                <label className="label">Mobile Number</label>
                <div className="flex items-center input rounded-[15px]">
                  <Phone className="size-5 text-base-content/40 mr-2" />
                  <input
                    type="tel"
                    className="flex-1 border-none outline-none bg-transparent text-gray-800"
                    placeholder="e.g. +61412345678"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    autoComplete="tel"
                  />
                </div>

                <label className="label">Password</label>
                <div className="flex items-center input rounded-[15px] relative">
                  <Lock className="size-5 text-base-content/40 mr-2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="flex-1 border-none outline-none bg-transparent text-gray-800"
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <Eye className="size-5 text-base-content/40" />
                    ) : (
                      <EyeOff className="size-5 text-base-content/40" />
                    )}
                  </button>
                </div>

                <button className="btn btn-outline btn-success w-full"
                  type="submit"
                  style={{ marginTop: '20px', borderRadius: '15px' }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-5 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Create/Login"
                  )}
                </button>
              </fieldset>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;