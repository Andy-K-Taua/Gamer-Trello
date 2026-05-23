import React from 'react'; // Removed useEffect as it wasn't used in the final version
import { useParams, useNavigate } from 'react-router-dom';
import RetroArchEmulator from '../components/RetroArchEmulator';
import { useAuthStore } from '../store/useAuthStore';
// 1. Added RefreshCw to imports
import { LogOut, ArrowBigLeftDash, RefreshCw } from 'lucide-react';

const GamePadPage = () => {
  const { gameName } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const handleLogoutClick = async () => {
    if (window.EJS_emulator?.stop) window.EJS_emulator.stop();
    if (window.AudioContext) new window.AudioContext().close().catch(() => {});
    
    try {
      await logout();
    } catch (err) {
      console.error("Logout request failed:", err);
    }
    window.location.href = '/';
  };

  const handleBackClick = () => {
    if (window.EJS_emulator?.stop) window.EJS_emulator.stop();
    if (window.AudioContext) new window.AudioContext().close().catch(() => {});
    navigate(-1);
  };

  return (
    <div className="w-full min-h-screen mx-auto flex flex-col justify-center items-center p-4 bg-base-300">

      {/* 2. Updated to grid-cols-3 for perfect 3-button alignment */}
      <div className="w-11/12 max-w-4xl grid grid-cols-3 items-center mb-3 sm:mb-5 gap-2">

        {/* BACK BUTTON */}
        <button
          onClick={handleBackClick}
          className="btn btn-success btn-outline btn-sm sm:btn-md flex items-center justify-center gap-2 rounded-[15px] shadow-md bg-black/20 backdrop-blur-sm"
          type="button"
        >
          <ArrowBigLeftDash className="size-3.5 sm:size-4" />
          <span className="font-semibold text-xs sm:text-sm">Back</span>
        </button>

        {/* REFRESH BUTTON */}
        <button
          onClick={() => window.location.reload()}
          className="btn btn-warning btn-outline btn-sm sm:btn-md flex items-center justify-center gap-2 rounded-[15px] shadow-md bg-black/20 backdrop-blur-sm"
          type="button"
        >
          <span className="font-semibold text-xs sm:text-sm">Refresh</span>
          <RefreshCw className="size-3.5 sm:size-4" />
        </button>

        {/* LOGOUT BUTTON */}
        <button
          onClick={handleLogoutClick}
          className="btn btn-error btn-outline btn-sm sm:btn-md flex items-center justify-center gap-2 rounded-[15px] shadow-md bg-black/20 backdrop-blur-sm"
          type="button"
        >
          <span className="font-semibold text-xs sm:text-sm">Log Out</span>
          <LogOut className="size-3.5 sm:size-4" />
        </button>
      </div>

      {/* THE MAIN RETRO CONSOLE FRAME */}
      <div className="flex justify-between items-center w-11/12 h-64 sm:h-80 bg-black p-4 rounded-[40px] shadow-md transition-all duration-200">
        <div className="w-full h-full bg-gray-800 flex justify-center items-center border border-gray-700 rounded-2xl mx-2 overflow-hidden">
          <RetroArchEmulator key={gameName} game={gameName} />
        </div>
      </div>
    </div>
  );
};

export default GamePadPage;