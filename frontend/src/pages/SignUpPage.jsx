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

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    mobile: "",
  });

  // Extract the unified action handler directly from the authentication store
  const { isSigningUp, signup } = useAuthStore();

  const validateForm = () => {

    // 1. Get the master number for comparison
    const MASTER_NUMBER = import.meta.env.VITE_MASTER_MOBILE_NUMBER;

    // 2. If it's the master number, skip email/password validation
    if (formData.mobile.trim() === MASTER_NUMBER) {
      return true;
    }

    if (!formData.email.trim()) { toast.error("Email is required"); return false; }
    if (!/\S+@\S+\.\S+/.test(formData.email)) { toast.error("Invalid email format"); return false; }
    if (!formData.mobile.trim()) { toast.error("Mobile number is required"); return false; }
    if (formData.password.length < 6) { toast.error("Password must be at least 6 characters"); return false; }

    return true;
  };

  const handleMasterLogin = async () => {
    try {
      const res = await axiosInstance.post("auth/master-login", { mobile: formData.mobile });
      if (res.status === 200) {
        // Assuming the backend returns the master user object
        useAuthStore.getState().setAuthUser(res.data);
        toast.success("Master access granted!");
        navigate('/games-list', { replace: true });
        return true;
      }
    } catch (err) {
      console.error("Master login error:", err);
      toast.error("Master login failed.");
    }
    return false;
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();

    const MASTER_NUMBER = import.meta.env.VITE_MASTER_MOBILE_NUMBER;
    const inputMobile = formData.mobile.trim();

    // 1. MASTER LOGIN PATH
    if (MASTER_NUMBER && inputMobile === MASTER_NUMBER) {

      const isMaster = await handleMasterLogin();

      // This stops it from falling through to the signup logic.
      return;
    }

    // 2. STANDARD SIGNUP PATH (Only reached if not a master attempt)

    const isValid = validateForm();
    if (!isValid) return;

    try {
      // 1. Send data to your store
      const userPayload = await signup(formData);

      // Extract the userData regardless of whether it's wrapped in an axios object or raw data
      const userData = userPayload?.data ? userPayload.data : userPayload;

      if (!userData) {
        throw new Error("No user data returned from authentication service.");
      }

      // 2. Existing user track
      if (userData.isExistingUser) {
        try {
          const expiryRes = await axiosInstance.get('/subscriptions/status/verify');

          if (expiryRes.status === 200 || expiryRes.status === 304) {
            toast.success("Welcome back!");
            navigate('/games-list', { replace: true });
          }
        } catch (expiryError) {
          if (expiryError.response && expiryError.response.status === 401) {
            toast.success("Account verified! Please pick a plan to access games.");
            navigate('/subscription', { replace: true });
          } else {
            console.warn("Subscription check returned an error status:", expiryError);
            toast.success("Welcome back! Please verify your subscription option.");
            navigate('/subscription', { replace: true });
          }
        }
      } else {
        // 3. Brand new user track
        toast.success("Account created successfully!");
        navigate('/subscription', { replace: true });
      }

    } catch (error) {
      console.error("Auth submission error:", error);
      const errorMsg = error.response?.data?.message || error.message || "Invalid credentials";
      toast.error(errorMsg);
    }
  };

  return (
    <div className="hero bg-base-200 min-h-screen">
      <div className="hero-content flex-col lg:flex-row-reverse">
        <div className="text-center lg:text-left">
          <h1 className="text-5xl font-bold">
            <TypeText text="Create/Login" />
          </h1>
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
                    className="flex-1 border-none outline-none bg-transparent text-neutral"
                    style={{ color: '#ffffff' }}
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
                    className="flex-1 border-none outline-none bg-transparent text-neutral"
                    style={{ color: '#ffffff' }}
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
                    className="flex-1 border-none outline-none bg-transparent text-neutral pr-10"
                    style={{ color: '#ffffff' }}
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

                <button className="btn btn-outline btn-success w-80"
                  type="submit"
                  style={{ marginTop: '20px', borderRadius: '15px' }}
                  disabled={isSigningUp}
                >
                  {isSigningUp ? (
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