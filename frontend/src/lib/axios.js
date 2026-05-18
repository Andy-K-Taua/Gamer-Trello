// frontend/src/lib/axios.js

import axios from 'axios';

const axiosInstance = axios.create({
  // Dynamically switch URLs: Relative path on Render, absolute path on local dev server
  baseURL: import.meta.env.MODE === 'production' 
    ? '/api' 
    : 'http://localhost:5001/api',
  withCredentials: true,
});

// Add logging
axiosInstance.interceptors.request.use((config) => {
  console.log('Request:', config);
  return config;
}, (error) => {
  console.error('Request error:', error);
  return Promise.reject(error);
});

axiosInstance.interceptors.response.use((response) => {
  console.log('Response:', response);
  return response;
}, (error) => {
  console.error('Response error:', error);
  return Promise.reject(error);
});

export { axiosInstance };