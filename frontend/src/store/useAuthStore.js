// frontend/src/store/useAuthStore.js

import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { toast } from 'react-hot-toast';

const handleError = (error, functionName) => {
    if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
    } else if (error.code === 'ERR_NETWORK') {
        toast.error(`Network error in ${functionName}. Please check your connection USO.`);
    } else {
        toast.error("An error occurred");
    }
    console.error(`Error in ${functionName}:`, error);
};

export const useAuthStore = create((set) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,

    isCheckingAuth: true,

    checkAuth: async () => {
        try {
            console.log("Checking authentication...");

            const res = await axiosInstance.get("/auth/check");

            console.log("Authentication successful. User data:", res.data);
            set({ authUser: res.data });
        } catch (error) {
            console.log("Error in checkAuth:", error);
            set({ authUser: null });
            handleError(error, 'checkAuth');
        } finally {
            console.log("Finished checking authentication.");
            set({ isCheckingAuth: false });
        }
    },

    signup: async (data) => {
        console.log("signup data:", data);
        set({ isSigningUp: true });
        const startTime = new Date().getTime();
        try {
            const res = await axiosInstance.post("/auth/signup", data);
            const endTime = new Date().getTime();
            const duration = endTime - startTime;
            console.log(`Signup request took ${duration}ms to complete`);
            console.log("API request successful:", res);
            set({ authUser: res.data });
            return res; // Return the response object
        } catch (error) {
            const endTime = new Date().getTime();
            const duration = endTime - startTime;
            console.log(`Signup request failed after ${duration}ms`);
            console.error("Error making API request uce:", error);
            handleError(error, 'signup');
            throw error; // Throw the error
        } finally {
            set({ isSigningUp: false });
        }
    },

    subscribe: async (data) => {
        set({ isLoggingIn: true });
        try {
            const res = await axiosInstance.post("/auth/subscribe", data);
            set({ authUser: res.data });
            toast.success("Subscribed successfully");

            get().connectSocket();
        } catch (error) {
            handleError(error, 'subscribe');
            set({ isLoggingIn: false });
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post("/auth/logout");
            set({ authUser: null });
            toast.success("Logged out successfully");
            get().disconnectSocket();
        } catch (error) {
            handleError(error);
            toast.error(error.response.data.message);
        }
    },
}));