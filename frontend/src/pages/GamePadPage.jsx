import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RetroArchEmulator from '../components/RetroArchEmulator';
import { useAuthStore } from '../store/useAuthStore';
import { LogOut, ArrowBigLeftDash, RefreshCw } from 'lucide-react';
import { useWebRTC } from "../hooks/useWebRTC";

const GamePadPage = () => {
  // role is now optional; if undefined, we default to 'initiator' (Solo mode)
  const { gameName, opponentId, role: urlRole } = useParams();
  const role = urlRole || 'initiator';
  
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const emulatorRef = useRef(null);
  const videoRef = useRef(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  // WebRTC hook (will only trigger connection logic if opponentId exists)
  const { createOffer, isReady, remoteStream, addStream, peerConnection } = useWebRTC(opponentId);

  // 1. Initiator: Create offer only if we have an opponent and are ready
  useEffect(() => {
    if (role === 'initiator' && opponentId && isReady) {
      createOffer();
    }
  }, [role, opponentId, isReady, createOffer]);

  // 2. Initiator: Capture stream if we have an opponent to stream to
  useEffect(() => {
    if (role === 'initiator' && opponentId && isReady && hasInteracted) {
      const interval = setInterval(() => {
        const canvas = document.querySelector('.ejs_canvas');
        if (canvas) {
          try {
            const stream = canvas.captureStream(30);
            if (stream && stream.getTracks().length > 0) {
              addStream(stream);
              clearInterval(interval);
            }
          } catch (err) {
            console.error("Capture failed:", err);
          }
        }
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [role, opponentId, isReady, hasInteracted, addStream]);

  // Standard interaction check for browser autoplay policies
  useEffect(() => {
    const enableCapture = () => {
      setHasInteracted(true);
      window.removeEventListener('click', enableCapture);
    };
    window.addEventListener('click', enableCapture);
    return () => window.removeEventListener('click', enableCapture);
  }, []);

  // Handle remote video playback for the receiver
  useEffect(() => {
    const video = videoRef.current;
    if (video && remoteStream) {
      video.srcObject = remoteStream;
      video.play().catch(e => console.error("Playback error:", e));
    }
  }, [remoteStream]);

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
      <div className="w-11/12 max-w-4xl grid grid-cols-3 items-center mb-3 sm:mb-5 gap-2">
        <button onClick={handleBackClick} className="btn btn-success btn-outline btn-sm sm:btn-md rounded-[15px]">
          <ArrowBigLeftDash className="size-4" /> Back
        </button>
        <button onClick={() => window.location.reload()} className="btn btn-warning btn-outline btn-sm sm:btn-md rounded-[15px]">
          Refresh <RefreshCw className="size-4" />
        </button>
        <button onClick={handleLogoutClick} className="btn btn-error btn-outline btn-sm sm:btn-md rounded-[15px]">
          Log Out <LogOut className="size-4" />
        </button>
      </div>

      <div className="flex justify-between items-center w-11/12 h-64 sm:h-80 bg-black p-4 rounded-[40px] shadow-md">
        <div className="w-full h-full bg-gray-800 flex justify-center items-center rounded-2xl overflow-hidden">
          {/* Always render emulator for initiator/solo. Receiver gets video. */}
          {role === 'initiator' ? (
            <RetroArchEmulator ref={emulatorRef} key={gameName} game={gameName} />
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-contain"
              style={{ display: remoteStream ? 'block' : 'none' }}
            />
          )}

          {/* Receiver Loader: Only shows if a receiver is connected and waiting for data */}
          {role !== 'initiator' && !remoteStream && (
            <div className="text-white text-center">
              <p>Waiting for host connection...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GamePadPage;