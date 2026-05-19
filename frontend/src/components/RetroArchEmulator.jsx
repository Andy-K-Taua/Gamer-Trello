// frontend/src/components/RetroArchEmulator.jsx

import React, { useEffect, forwardRef, memo } from 'react';

const RetroArchEmulator = forwardRef((props, ref) => {
  const { game } = props;

  console.log('RetroArchEmulator component rendered');
  useEffect(() => {
    console.log('useEffect hook executed');

    const useBin = true; // or false
    const gameExtension = useBin ? 'bin' : 'md';

    const loadScript = () => {
      console.log('Loading script...');
      const scriptUrl = 'https://cdn.emulatorjs.org/stable/data/loader.js';

      // 1. SET THE CONFIGURATION PATHS FIRST BEFORE THE SCRIPT LOADS
      window.EJS_player = '#game';
      window.EJS_core = 'segaMD';
      window.EJS_gameUrl = `${window.location.origin}/api/games/${game}`;

      // This explicitly forces loader.js to fetch styles/assets from the CDN, not Render
      window.EJS_pathtodata = 'https://cdn.emulatorjs.org/stable/data/';

      if (!document.querySelector(`script[src="${scriptUrl}"]`)) {
        console.log('Script not found, creating new script element...');
        const script = document.createElement('script');
        script.src = scriptUrl;

        script.onload = () => {
          console.log('Script loaded successfully!');
        };
        script.onerror = () => {
          console.error('Error loading script:', scriptUrl);
        };

        document.body.appendChild(script);
        console.log('Script element added to body...');
      } else {
        console.log('Script already loaded.');
        // If the script is already on the page, kick off the emulator manually if needed
        if (typeof window.EmitEJS === 'function') {
          window.EmitEJS();
        }
      }
    };

    loadScript();

    return () => {
      console.log('Cleanup function called');
    };
  }, [game]);

  return (
    <div id='game' ref={ref} style={{ width: '100%', height: '100%', maxWidth: '100%' }} />
  );
});

export default memo(RetroArchEmulator);