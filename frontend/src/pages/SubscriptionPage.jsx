// frontend/src/pages/SubscriptionPage.jsx

import React, { useState, useEffect } from 'react';
import { axiosInstance } from '../lib/axios';
import { useNavigate } from 'react-router-dom'

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

  useEffect(() => {
    const getUserId = async () => {
      try {
        const response = await axiosInstance.get('/auth/check');
        console.log('Response:', response);
        console.log('Response data:', response.data);
        if (response.data && response.data.authUser && response.data.authUser._id) {
          console.log('Setting user ID:', response.data.authUser._id);
          setUserId(response.data.authUser._id);
        } else {
          console.error('User ID not found in response');
        }
      } catch (error) {
        console.error(error);
      }
    };
    getUserId();
  }, []);

  const handlePlanSelection = async (planId) => {
    console.log('Plan selected:', planId);
    console.log('User ID:', userId);
    if (!userId) return;
  
    let endDate;
    switch (planId) {
      case 'free':
        endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        break;
      case 'standard':
        endDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // 60 days (2 months)
        break;
      case 'premium':
        endDate = new Date(Date.now() + 120 * 24 * 60 * 60 * 1000); // 120 days (4 months)
        break;
      default:
        console.error('Invalid plan ID');
        return;
    }
  
    try {
      const startDate = new Date();
      const response = await axiosInstance.post('/subscriptions', {
        userId,
        planId,
        startDate,
        endDate,
      });
      console.log('New subscription created:', response.data);
      navigate('/games-list')
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
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