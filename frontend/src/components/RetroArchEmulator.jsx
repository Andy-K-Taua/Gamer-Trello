//frontend/src/components/RetroArchEmulator.jsx

import React, { useEffect, forwardRef, useImperativeHandle, useRef, memo } from 'react';

const RetroArchEmulator = forwardRef((props, ref) => {
  const { game } = props;
  const containerRef = useRef(null);
  const streamRef = useRef(null);

  useImperativeHandle(ref, () => ({
    getStream: () => {
      if (streamRef.current) return streamRef.current;

      const canvas = containerRef.current?.querySelector('canvas');
      if (canvas) {
        try {
          // Some browsers require a frame to be drawn before capture
          // 'echoCancellation: false' helps avoid permission prompts
          streamRef.current = canvas.captureStream ? canvas.captureStream(30) : null;
          return streamRef.current;
        } catch (e) {
          console.error("Capture failed - this is usually a security/permission issue:", e);
        }
      }
      return null;
    }
  }));

  useEffect(() => {
    // 1. Set global EJS configs
    window.EJS_player = '#game';
    window.EJS_core = 'segaMD';
    window.EJS_gameUrl = `${window.location.origin}/games/${game.endsWith('.md') ? game : `${game}.md`}`;
    window.EJS_language = 'en';
    window.EJS_pathtodata = 'https://cdn.emulatorjs.org/stable/data/';
    window.EJS_disableAudio = true;
    
    // 2. Load script
    const scriptUrl = 'https://cdn.emulatorjs.org/stable/data/loader.js';
    if (!document.querySelector(`script[src="${scriptUrl}"]`)) {
      const script = document.createElement('script');
      script.src = scriptUrl;
      script.onload = () => console.log('EmulatorJS loaded');
      document.body.appendChild(script);
    } else if (window.EJS_emulator) {
      // Re-trigger if already loaded
      window.EJS_emulator.restart();
    }
  }, [game]);

  return (
    <div id='game' ref={containerRef} style={{ width: '100%', height: '100%' }} />
  );
});

export default memo(RetroArchEmulator);