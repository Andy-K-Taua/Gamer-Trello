// frontend/src/pages/SignUpPage.jsx

import React, { useState, useEffect } from 'react';
import { useAuthStore } from "../store/useAuthStore";
import { Eye, EyeOff, Loader2, Lock, Mail, User } from "lucide-react";
import { useNavigate } from 'react-router-dom'
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
  })

  const { signup, isSigningUp } = useAuthStore();

  const validateForm = () => {
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Invalid email format");
    if (!formData.password) return toast.error("Password is required");
    if (formData.password.length < 6) return toast.error("Password must be at least 6 characters");

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const success = validateForm();

    if (success === true) {
      try {
        const res = await signup(formData);
        if (res.data.isExistingUser) {
            const expiryRes = await axiosInstance.get('/subscriptions/check-expiry');
            if (expiryRes.status === 200) {
                toast.success("Welcome back!");
                navigate('/games-list');
            } else if (expiryRes.status === 401) {
                toast.error("Subscription has expired");
                navigate('/subscription');
            } else {
                toast.error("Error checking subscription status");
            }
        } else {
            toast.success("New User");
            navigate('/subscription');
        }
    } catch (error) {
        // left blank on purpose, handled in useAuthStore
      }
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

            <form onSubmit={handleSubmit} className='space-y-6'>

              <fieldset className="fieldset">
                <label className="label">Email</label>
                <div className="flex items-center input rounded-[15px]">
                  <Mail className="size-5 text-base-content/40 mr-2" />
                  <input
                    type="email"
                    className="flex-1 border-none outline-none bg-transparent"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    autoComplete="new-email"
                  />
                </div>

                <label className="label">Password</label>
                <div className="flex items-center input rounded-[15px]">
                  <Lock className="size-5 text-base-content/40 mr-2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="flex-1 border-none outline-none bg-transparent"
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
                  onClick={() => console.log('Button clicked!')}
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

export default SignUpPage