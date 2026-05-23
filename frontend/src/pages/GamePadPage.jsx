// frontend/src/pages/GamePadPage.jsx

import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RetroArchEmulator from '../components/RetroArchEmulator';
import { useAuthStore } from '../store/useAuthStore'; 
import { LogOut } from 'lucide-react'; 

const GamePadPage = () => {
  const { gameName } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  // Auto-trigger EmulatorJS launch button sequence once loaded
  useEffect(() => {
    const clickStartButton = () => {
      const startButton = document.querySelector('.ejs_start_button');
      if (startButton) {
        startButton.click();
      } else {
        setTimeout(clickStartButton, 100);
      }
    };
    clickStartButton();
  }, [gameName]);

  // Executes auth removal and sweeps the client back to the main landing view
  const handleLogoutClick = async () => {
    await logout();
    window.location.reload();
    navigate('/', { replace: true });
  };

  return (
    <div className="w-full min-h-screen mx-auto flex flex-col justify-center items-center p-4 bg-base-300"> 
      
      {/* BUTTON HEADER ZONE: Isolated cleanly above the screen console layout */}
      <div className="w-11/12 max-w-4xl flex justify-end mb-3 sm:mb-5">
        <button
          onClick={handleLogoutClick}
          className="btn btn-error btn-outline btn-sm sm:btn-md flex items-center gap-2 rounded-[15px] px-4 shadow-md bg-black/20 backdrop-blur-sm"
          type="button"
        >
          <LogOut className="size-3.5 sm:size-4" />
          <span className="font-semibold text-xs sm:text-sm">Log Out</span>
        </button>
      </div>

      {/* THE MAIN RETRO CONSOLE FRAME */}
      <div className="flex justify-between items-center w-11/12 h-64 sm:h-80 bg-black p-4 rounded-[40px] shadow-md transition-all duration-200">
        
        {/* Middle Canvas Container: EmulatorJS Mounting Wrapper */}
        <div className="w-full h-full bg-gray-800 flex justify-center items-center border border-gray-700 rounded-2xl mx-2 overflow-hidden">
          <RetroArchEmulator key={gameName} game={gameName}/>
        </div>

      </div>
    </div>
  );
};

export default GamePadPage;