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
    // Added relative positioning to parent container so the logout button sits neatly on top
    <div className="w-full h-screen mx-auto flex justify-center items-center relative bg-base-300"> 
      
      {/* 4. SLEEK ABSOLUTE LOGOUT CONTROLLER BUTTON */}
      <button
        onClick={logout}
        className="absolute top-6 right-6 btn btn-error btn-outline flex items-center gap-2 rounded-[15px] px-4 shadow-lg z-50 bg-black/40 backdrop-blur-sm"
        type="button"
      >
        <LogOut className="size-4" />
        <span className="hidden sm:inline font-semibold">Log Out</span>
      </button>

      <div className="flex justify-between items-center w-11/12 h-80 bg-black p-4 rounded-[40px] shadow-md">

        {/* Left div: Arrows */}

        
        {/* <div className="flex flex-col items-center justify-center w-1/6 mr-4">
          ...
        </div> */}


        {/* Middle div: EmulatorJS */}


        <div className="w-full h-full bg-gray-800 flex justify-center items-center border border-gray-700 rounded-['40px'] mx-2">
          <RetroArchEmulator key={gameName} ref={retroArchRef} game={gameName}/>
        </div>

        {/* Right div: Buttons */}


        {/* <div className="flex flex-col items-center justify-center w-1/6 ml-2">
          ...
        </div> */}

      </div>
    </div>
  );
};

export default Gamepad;