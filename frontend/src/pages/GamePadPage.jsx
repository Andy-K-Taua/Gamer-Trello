// frontend/src/pages/GamePadPage.jsx

import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RetroArchEmulator from '../components/RetroArchEmulator';
import { useAuthStore } from '../store/useAuthStore';
import { LogOut, ArrowBigLeftDash, RefreshCw } from 'lucide-react';
import { useWebRTC } from "../hooks/useWebRTC";

const GamePadPage = () => {
  const { gameName, opponentId, role } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const emulatorRef = useRef(null);

  // Everything is handled by the hook now
  const { createOffer, isReady, remoteStream, addStream, peerConnection } = useWebRTC(opponentId);
  window.debugPC = peerConnection;
  console.log("WebRTC PeerConnection exists:", !!peerConnection?.current);

  // 1. Initiator: Create offer when ready
  useEffect(() => {
    if (role === 'initiator' && isReady) {
      createOffer();
    }
  }, [role, isReady, createOffer]);

  // 2. Initiator: Poll for stream once and add it
  useEffect(() => {
    if (role === 'initiator' && isReady) {
      const interval = setInterval(() => {
        // Safe access
        const emulator = emulatorRef.current;
        if (emulator && typeof emulator.getStream === 'function') {
          const stream = emulator.getStream();
          if (stream) {
            addStream(stream);
            console.log("✅ Video stream added to WebRTC!");
            clearInterval(interval);
          } else {
            console.log("Waiting for emulator stream...");
          }
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [role, isReady, addStream]);

  useEffect(() => {
    // Only set window.pc if the connection actually exists
    if (peerConnection && peerConnection.current) {
      window.pc = peerConnection.current;
      console.log("✅ Window.pc initialized");
    }
  }, [peerConnection]);

  const handleBackClick = () => {
    navigate(-1);
    setTimeout(() => window.location.reload(), 80);
  };

  const handleLogoutClick = async () => {
    await logout();
    window.location.href = '/';
  };

  return (
    <div className="w-full min-h-screen mx-auto flex flex-col justify-center items-center p-4 bg-base-300">

      {/* 2. Your Original Grid Layout */}
      <div className="w-11/12 max-w-4xl grid grid-cols-3 items-center mb-3 sm:mb-5 gap-2">
        <button onClick={handleBackClick} className="btn btn-success btn-outline btn-sm sm:btn-md flex items-center justify-center gap-2 rounded-[15px] shadow-md bg-black/20 backdrop-blur-sm" type="button">
          <ArrowBigLeftDash className="size-3.5 sm:size-4" />
          <span className="font-semibold text-xs sm:text-sm">Back</span>
        </button>
        <button onClick={() => window.location.reload()} className="btn btn-warning btn-outline btn-sm sm:btn-md flex items-center justify-center gap-2 rounded-[15px] shadow-md bg-black/20 backdrop-blur-sm" type="button">
          <span className="font-semibold text-xs sm:text-sm">Refresh</span>
          <RefreshCw className="size-3.5 sm:size-4" />
        </button>
        <button onClick={handleLogoutClick} className="btn btn-error btn-outline btn-sm sm:btn-md flex items-center justify-center gap-2 rounded-[15px] shadow-md bg-black/20 backdrop-blur-sm" type="button">
          <span className="font-semibold text-xs sm:text-sm">Log Out</span>
          <LogOut className="size-3.5 sm:size-4" />
        </button>
      </div>

      {/* Your Original Console Frame */}
      <div className="flex justify-between items-center w-11/12 h-64 sm:h-80 bg-black p-4 rounded-[40px] shadow-md transition-all duration-200">
        <div className="w-full h-full bg-gray-800 flex justify-center items-center border border-gray-700 rounded-2xl mx-2 overflow-hidden">
          {role === 'initiator' ? (
            <RetroArchEmulator ref={emulatorRef} key={gameName} game={gameName} />
          ) : (
            remoteStream ? (
              <video
                autoPlay
                playsInline
                muted
                ref={(el) => { if (el && el.srcObject !== remoteStream) el.srcObject = remoteStream; }}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-white">Connecting to host...</div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default GamePadPage;