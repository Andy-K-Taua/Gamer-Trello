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
      console.log('Loading script from CDN...');
      // Point scriptUrl to the CDN instead of your local asset folder
      const scriptUrl = 'https://cdn.emulatorjs.org/stable/data/loader.js';
      console.log('Script URL:', scriptUrl);

      if (!document.querySelector(`script[src="${scriptUrl}"]`)) {
        console.log('Script not found, creating new script element...');

        const script = document.createElement('script');
        script.src = scriptUrl;
        script.onload = () => {
          console.log('Script loaded successfully!');
          window.EJS_player = '#game';
          window.EJS_core = 'segaMD';
          window.EJS_gameUrl = `${window.location.origin}/games/${game}.md`;
          window.EJS_pathtodata = 'https://cdn.emulatorjs.org/stable/data/';
        };
        script.onerror = () => {
          console.error('Error loading script:', scriptUrl);
        };
        document.body.appendChild(script);
        console.log('Script element added to body...');
      } else {
        console.log('Script already loaded, using existing script...');
        window.EJS_player = '#game';
        window.EJS_core = 'segaMD';
        window.EJS_gameUrl = `${window.location.origin}/games/${game}.md`;
        window.EJS_pathtodata = 'https://cdn.emulatorjs.org/stable/data/';
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