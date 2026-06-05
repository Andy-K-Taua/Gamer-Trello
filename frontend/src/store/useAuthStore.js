// frontend/src/store/useAuthStore.js

import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { toast } from 'react-hot-toast';
import { io } from "socket.io-client";

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

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    socket: null,
    onlineUsers: [],
    isCheckingAuth: true,
    isConnecting: false,
    usersCache: {},

    setAuthUser: (user) => set((state) => ({
        authUser: { ...state.authUser, ...user }
    })),

    checkAuth: async () => {
        try {
            console.log("Checking authentication...");

            const res = await axiosInstance.get("/auth/check");

            console.log("Authentication successful. User data:", res.data);
            const user = res.data.authUser || res.data;
            set({ authUser: user });
            get().connectSocket();
        } catch (error) {
            console.log("Error in checkAuth:", error);
            set({ authUser: null });

            // ONLY throw a toast if it's NOT a normal 401 unauthenticated status
            if (error.response?.status !== 401) {
                handleError(error, 'checkAuth');
            }
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
            return res;
        } catch (error) {
            const endTime = new Date().getTime();
            const duration = endTime - startTime;
            console.log(`Signup request failed after ${duration}ms`);
            console.error("Error making API request uce:", error);
            handleError(error, 'signup');
            throw error;
        } finally {
            set({ isSigningUp: false });
        }
    },

    login: async (data) => {
        console.log("login data:", data);
        set({ isLoggingIn: true });
        try {
            // Sends email, password, and mobile to your backend's unified route
            const res = await axiosInstance.post("/auth/login", data);
            set({ authUser: res.data });
            toast.success("Logged in successfully");
            return res;
        } catch (error) {
            handleError(error, 'login');
            throw error;
        } finally {
            set({ isLoggingIn: false });
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
        } finally {
            set({ isLoggingIn: false });
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post("/auth/logout");
            set({ authUser: null });
            toast.success("Logged out successfully");
            if (get().disconnectSocket) {
                get().disconnectSocket();
            }
        } catch (error) {
            handleError(error, 'logout');
        }
    },

    // Implement connectSocket
    connectSocket: () => {
        const { authUser, socket, isConnecting } = get();

        if (!authUser || (socket && socket.connected) || isConnecting) return;

        set({ isConnecting: true });

        const BASE_URL = import.meta.env.MODE === "production"
            ? "https://gamer-trello.onrender.com"
            : "http://localhost:5001";

        console.log("DEBUG: Attempting to connect socket to:", BASE_URL);

        const socketInstance = io(BASE_URL, {
            query: { userId: authUser._id },
        });

        // 1. Existing listener for online users
        socketInstance.on("getOnlineUsers", (userIds) => {
            console.log("DEBUG: Leaderboard update received:", userIds);
            set({ onlineUsers: userIds });
        });

        // 2. NEW: Listener for profile updates
        socketInstance.on("userUpdated", (updatedUser) => {
            const { authUser } = get();
            // If the update belongs to the logged-in user, update the store
            if (authUser && authUser._id === updatedUser._id) {
                console.log("DEBUG: Profile update received via socket");
                set({ authUser: updatedUser });
            }
        });

        socketInstance.on("connect", () => {
            console.log("Socket connected successfully!");
            set({ socket: socketInstance, isConnecting: false });
        });
    },

    // Implement disconnectSocket
    disconnectSocket: () => {
        const { socket } = get();
        if (socket?.connected) {
            socket.disconnect();
            set({ socket: null, onlineUsers: [] });
        }
    },

    updateUserCache: (userId, userData) => {
        set((state) => ({
            usersCache: {
                ...state.usersCache,
                [userId]: userData
            }
        }));
    },

}));

window.useAuthStore = useAuthStore;