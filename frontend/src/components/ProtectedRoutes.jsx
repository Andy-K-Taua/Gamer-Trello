// frontend/src/components/ProtectRoutes.jsx
import React from 'react';
import AuthCheck from './AuthCheck';
import { Routes, Route } from "react-router-dom";
import SubscriptionPage from '../pages/SubscriptionPage';
import GamesListPage from '../pages/GamesListPage';
import GamePadPage from '../pages/GamePadPage';

const ProtectedRoutes = () => {
    return (
        <AuthCheck>
            <Routes>
                <Route path="/subscription" element={<SubscriptionPage />} />
                <Route path="/games-list" element={<GamesListPage />} />
                <Route path="game-pad/:gameName" element={<GamePadPage />} />
                <Route path="*" element={<div>Route not found in ProtectedRoutes</div>} />
            </Routes>
        </AuthCheck>
    );
};

export default ProtectedRoutes;