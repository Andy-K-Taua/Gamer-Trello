// frontend/src/components/ProtectedRoutes.jsx

import React from 'react';
import AuthCheck from './AuthCheck';
import { Routes, Route } from "react-router-dom";
import SubscriptionPage from '../pages/SubscriptionPage';
import GamesListPage from '../pages/GamesListPage';
import GamePadPage from '../pages/GamePadPage';
import LeaderboardPage from "../pages/LeaderboardPage";

const ProtectedRoutes = () => {
    return (
        <AuthCheck>
            <Routes>
                <Route path="subscription" element={<SubscriptionPage />} />
                <Route path="leaderboard" element={<LeaderboardPage />} />
                <Route path="games-list" element={<GamesListPage />} />

                {/* Updated Route: Parameters are now optional */}
                <Route path="game-pad/:gameName" element={<GamePadPage />} />
                {/* <Route path="game-pad/:gameName/:opponentId/:role" element={<GamePadPage />} /> */}
            </Routes>
        </AuthCheck>
    );
};

export default ProtectedRoutes;