// frontend/src/pages/GamePadPage.jsx

import React, { useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import RetroArchEmulator from '../components/RetroArchEmulator';
import { useAuthStore } from '../store/useAuthStore'; // 1. Tapped into your store
import { LogOut } from 'lucide-react'; // 2. Clean icon for a console layout

const Gamepad = () => {
  const { gameName } = useParams();
  const retroArchRef = useRef(null);
  const [arrowKeyDown, setArrowKeyDown] = React.useState(null);

  // 3. Extracted the logout action
  const { logout } = useAuthStore();

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
  

  const simulateKeyPress = (element, keyCode, key, code) => {
    const event = new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      key: key,
      code: code,
      keyCode: keyCode,
    });

    element.dispatchEvent(event);
    document.dispatchEvent(event);
  };

  const simulateKeyRelease = (element, keyCode, key, code) => {
    const event = new KeyboardEvent('keyup', {
      bubbles: true,
      cancelable: true,
      key: key,
      code: code,
      keyCode: keyCode,
    });
    element.dispatchEvent(event);
  };

  const handleAButtonClick = () => {
    console.log('A button pressed');
    
    const gameElement = document.querySelector('#game.ejs_parent.ejs_small_screen');
    if (gameElement) {
      simulateKeyPress(gameElement, 88, 'x', 'KeyX');
      setTimeout(() => {
        simulateKeyRelease(gameElement, 88, 'x', 'KeyX');
      }, 50);
    } else {
      console.log('Game element not found');
    }
  };

  const handleBButtonClick = () => {
    console.log('B button pressed');
    const gameElement = document.querySelector('#game.ejs_parent.ejs_small_screen');
    if (gameElement) {
      simulateKeyPress(gameElement, 90, 'z', 'KeyZ');
      setTimeout(() => {
        simulateKeyRelease(gameElement, 90, 'z', 'KeyZ');
      }, 50);
    } else {
      console.log('Game element not found');
    }
  };

  const handleArrowKeyDown = (keyCode, key, code) => {
    console.log(`${key} pressed`);
    const gameElement = document.querySelector('#game.ejs_parent.ejs_small_screen');
    if (gameElement) {
      simulateKeyPress(gameElement, keyCode, key, code);
    }
  };

  const handleArrowKeyUp = (keyCode, key, code) => {
    console.log(`${key} pressed`);
    const gameElement = document.querySelector('#game.ejs_parent.ejs_small_screen');
    if (gameElement) {
      simulateKeyRelease(gameElement, keyCode, key, code);
    }
  };

  const handleMouseDown = (keyCode, key, code) => {
    setArrowKeyDown({ keyCode, key, code });
    handleArrowKeyDown(keyCode, key, code);
  };

  const handleMouseUp = () => {
    if (arrowKeyDown) {
      handleArrowKeyUp(arrowKeyDown.keyCode, arrowKeyDown.key, arrowKeyDown.code);
      setArrowKeyDown(null);
    }
  };


  return (
    // Changed to a column flex layout with padding to ensure vertical space insulation
    <div className="w-full min-h-screen mx-auto flex flex-col justify-center items-center p-4 bg-base-300"> 
      
      {/* 1. BUTTON HEADER ZONE: Pushed cleanly above the console block with custom margin */}
      <div className="w-11/12 max-w-4xl flex justify-end mb-3 sm:mb-5">
        <button
          onClick={logout}
          className="btn btn-error btn-outline btn-sm sm:btn-md flex items-center gap-2 rounded-[15px] px-4 shadow-md bg-black/20 backdrop-blur-sm"
          type="button"
        >
          <LogOut className="size-3.5 sm:size-4" />
          <span className="font-semibold text-xs sm:text-sm">Log Out</span>
        </button>
      </div>

      {/* 2. THE MAIN RETRO CONSOLE CONTAINER */}
      <div className="flex justify-between items-center w-11/12 h-64 sm:h-80 bg-black p-4 rounded-[40px] shadow-md transition-all duration-200">

        {/* Left div: Arrows */}
        {/* <div className="flex flex-col items-center justify-center w-1/6 mr-4">...</div> */}

        {/* Middle div: EmulatorJS */}
        <div className="w-full h-full bg-gray-800 flex justify-center items-center border border-gray-700 rounded-['40px'] mx-2">
          <RetroArchEmulator key={gameName} ref={retroArchRef} game={gameName}/>
        </div>

        {/* Right div: Buttons */}
        {/* <div className="flex flex-col items-center justify-center w-1/6 ml-2">...</div> */}

      </div>
    </div>
  );
};

export default Gamepad;