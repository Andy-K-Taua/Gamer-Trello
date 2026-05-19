// frontend/src/components/ProtectRoutes.jsx

import React from 'react';
import AuthCheck from './AuthCheck';
import { Routes, Route } from "react-router-dom";
import SubscriptionPage from '../pages/SubscriptionPage';
import GamesListPage from '../pages/GamesListPage';
import GamePadPage from '../pages/GamePadPage';
import { useLocation } from 'react-router-dom';

const ProtectedRoutes = () => {
    const location = useLocation();
    console.log('Current URL:', location.pathname);
    
    return (
        <Routes>
            {/* 1. PUBLIC TO LOGGED-IN USERS: Pull this OUT of AuthCheck so they can pay/renew safely */}
            <Route path="/subscription" element={<SubscriptionPage />} />

            {/* 2. STRICT ACCESS CONTROL: Kept inside AuthCheck for games & gameplay mechanics */}
            <Route 
                path="/*" 
                element={
                    <AuthCheck>
                        <Routes>
                            <Route path="/games-list" element={<GamesListPage />} />
                            <Route path="game-pad/:gameName" element={<GamePadPage />} />
                            <Route path="*" element={<div>Route not found in ProtectedRoutes Auth Gate</div>} />
                        </Routes>
                    </AuthCheck>
                } 
            />
        </Routes>
    );
};

export default ProtectedRoutes;