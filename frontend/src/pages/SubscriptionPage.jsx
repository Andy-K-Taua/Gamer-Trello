// frontend/src/pages/SubscriptionPage.jsx

import React, { useState, useEffect, useRef } from 'react';
import { axiosInstance } from '../lib/axios';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from "lucide-react"; // Imported for the animation loading spinner

import {
  CheckCircle,
  Users,
  MonitorCheck,
  GamepadIcon
} from 'lucide-react';

const plans = {
  free: 'free',
  standard: 'standard',
  premium: 'premium',
};

const SubscriptionPage = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [isPaymentConfirmed, setIsPaymentConfirmed] = useState(false);

  // States for handling the animated approval modal and polling loop
  const [showPendingModal, setShowPendingModal] = useState(false);
  const pollingRef = useRef(null);

  useEffect(() => {
    const getUserId = async () => {
      try {
        const response = await axiosInstance.get('/auth/check');
        if (response.data && response.data.authUser && response.data.authUser._id) {
          setUserId(response.data.authUser._id);

          // Self-recovery: if the page loads but they are already approved, pass them through
          if (response.data.authUser.approvalStatus === 'approved') {
            navigate('/games-list');
          }
        }
      } catch (error) {
        console.error(error);
      }
    };
    getUserId();

    // Cleanup any running interval if the user leaves the page component
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [navigate]);


  useEffect(() => {
    // If the user has paid but is still pending approval, show them they are in the queue
    const checkPaymentStatus = async () => {
      const res = await axiosInstance.get('/auth/check');
      if (res.data.authUser.hasPaid && res.data.authUser.approvalStatus === 'pending') {
        setShowPendingModal(true);
        setIsPaymentConfirmed(true); // You can use this to change the Modal text
        startApprovalPolling();
      }
    };
    checkPaymentStatus();
  }, []);

  // Starts pinging the backend to check if the admin has typed their choice into the CLI yet
  const startApprovalPolling = () => {
    if (pollingRef.current) clearInterval(pollingRef.current);

    pollingRef.current = setInterval(async () => {
      try {
        const res = await axiosInstance.get('/auth/check');

        if (res.data && res.data.authUser) {
          const { approvalStatus } = res.data.authUser;
          console.log("Checking approval status heartbeat...", approvalStatus);

          if (approvalStatus === 'approved') {
            clearInterval(pollingRef.current);
            setShowPendingModal(false);
            navigate('/games-list');
          }
        }
      } catch (err) {
        console.error("Error polling user verification status:", err);
      }
    }, 4000); // Check every 4 seconds
  };

  const handlePlanSelection = async (planId) => {
    if (!userId) return;

    // 1. For "free" plan, keep your existing logic
    if (planId === plans.free) {
      try {
        await axiosInstance.post('/subscriptions/select-plan', { plan: planId });
        setShowPendingModal(true);
        startApprovalPolling();
      } catch (error) {
        console.error("Error:", error);
      }
      return;
    }

    // 2. For paid plans (Standard/Premium), call Stripe
    try {
      // Call the new checkout session endpoint
      const response = await axiosInstance.post('/subscriptions/create-checkout-session', {
        plan: planId,
      });

      // Stripe returns a URL, we redirect the user to that URL
      if (response.data && response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error("Error initiating Stripe session:", error);
      alert("Could not start payment. Please try again.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 relative">

      {/* --- ANIMATED PENDING APPROVAL MODAL OVERLAY --- */}
      {showPendingModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in backdrop-blur-sm">
          <div className="card w-96 bg-base-100 shadow-2xl p-6 text-center border border-success/20 transform scale-100 transition-transform duration-300">
            <div className="flex flex-col items-center space-y-4">

              {/* Spinning DaisyUI Gamepad / Circle Accents - Original Animations Kept */}
              <div className="relative flex items-center justify-center">
                <Loader2 className="size-16 text-success animate-spin" />
                <GamepadIcon className="size-6 text-success absolute" />
              </div>

              {/* Dynamic Heading */}
              <h2 className="text-2xl font-bold text-base-content">
                {isPaymentConfirmed ? "Payment Received!" : "Thank you for waiting!"}
              </h2>

              <div className="space-y-2">
                {/* Dynamic Message */}
                <p className="text-sm text-gray-500 font-medium">
                  {isPaymentConfirmed
                    ? "Payment confirmed. We are finalizing your account approval."
                    : "Your account registration is currently "}
                  {!isPaymentConfirmed && <span className="text-warning font-semibold animate-pulse">pending approval</span>}.
                </p>

                {/* Success Indicator with Pulse Animation */}
                {isPaymentConfirmed && (
                  <p className="text-xs text-success font-bold animate-pulse">✓ Payment successfully processed</p>
                )}

                <p className="text-xs text-gray-400">
                  We are processing your selection. This screen will automatically update once confirmed by our administration team.
                </p>
              </div>

              {/* Original Progress Bar */}
              <progress className="progress progress-success w-full mt-2" />
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Subscription Plans</h1>
        <p className="text-lg text-gray-600 mb-8">Choose the plan that's right for you.</p>
      </section>

      {/* Pricing Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="card bg-base-100 shadow-xl border-2 border-transparent hover:border-success transition duration-300">
          <div className="card-body">
            <h3 className="card-title mb-2">7 days</h3>
            <p className="text-4xl font-bold mb-4">Free</p>
            <ul>
              <li className="flex items-center mb-2"><CheckCircle size={18} className="text-success mr-2" /> With Ads</li>
              <li className="flex items-center mb-2"><CheckCircle size={18} className="text-success mr-2" /> Limited Number of Games</li>
            </ul>
            <button className="btn btn-outline hover:btn-success transition duration-300 rounded-[15px]"
              onClick={() => handlePlanSelection(plans.free)}
            >Sign Up</button>
          </div>
        </div>
        <div className="card bg-base-100 shadow-xl border-2 border-transparent hover:border-success transition duration-300">
          <div className="card-body">
            <h3 className="card-title mb-2">2 Months</h3>
            <p className="text-4xl font-bold mb-4">$8.00</p>
            <ul>
              <li className="flex items-center mb-2"><CheckCircle size={18} className="text-success mr-2" /> No Ads</li>
              <li className="flex items-center mb-2"><CheckCircle size={18} className="text-success mr-2" /> Full Exclusive Game Library</li>
              <li className="flex items-center mb-2"><CheckCircle size={18} className="text-success mr-2" /> User Name and Profile Pic</li>
            </ul>
            <button className="btn btn-outline hover:btn-success transition duration-300 rounded-[15px]"
              onClick={() => handlePlanSelection(plans.standard)}
            >Sign Up</button>
          </div>
        </div>
        <div className="card bg-base-100 shadow-xl border-2 border-transparent hover:border-success transition duration-300">
          <div className="card-body">
            <h3 className="card-title mb-2">4 Months</h3>
            <p className="text-4xl font-bold mb-4">$12.00</p>
            <ul>
              <li className="flex items-center mb-2"><CheckCircle size={18} className="text-success mr-2" /> All Premium Features</li>
              <li className="flex items-center mb-2"><CheckCircle size={18} className="text-success mr-2" /> Multi-Player</li>
            </ul>
            <button className="btn btn-outline hover:btn-success transition duration-300 rounded-[15px]"
              onClick={() => handlePlanSelection(plans.premium)}
            >Sign Up</button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body items-center text-center">
            <MonitorCheck size={36} className="text-success mb-4" />
            <h2 className="card-title mb-2">No Ads</h2>
            <p>Seamless and distraction-free content experiences</p>
          </div>
        </div>
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body items-center text-center">
            <Users size={36} className="text-success mb-4" />
            <h2 className="card-title mb-2">Multi-Player</h2>
            <p>Join forces or go head-to-head with friends and family. Track your progress on the leaderboards</p>
          </div>
        </div>
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body items-center text-center">
            <GamepadIcon size={40} className="text-success mb-4" />
            <h2 className="card-title mb-2">Exclusive Content</h2>
            <p>Get access to our Exclusive Game Library</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SubscriptionPage;