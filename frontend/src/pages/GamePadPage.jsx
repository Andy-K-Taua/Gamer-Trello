// frontend/src/pages/GamePadPage.jsx

import React, { useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import RetroArchEmulator from '../components/RetroArchEmulator';

const Gamepad = () => {
  const { gameName } = useParams();
  const retroArchRef = useRef(null);
  const [arrowKeyDown, setArrowKeyDown] = React.useState(null);

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
  

  const simulateKeyPress = (element, keyCode, key, code,) => {
    // console.log('Received keyCode:', keyCode);
    // console.log(`Simulating key press: keyCode=${keyCode}, key=${key}, code=${code}`);
    const event = new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      key: key,
      code: code,
      keyCode: keyCode,
      // isTrusted: true,
      // composed: true,
      // returnValue: true,

    });

    element.dispatchEvent(event);
    // console.log('Dispatching event:', event);
    document.dispatchEvent(event);
    // console.log('Event dispatched');

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
      }, 50); // adjust the delay as needed
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
      }, 50); // adjust the delay as needed
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
    <div className="w-full h-screen mx-auto flex justify-center items-center"> {/*Put this into here to check if it is rendering: bg-red-300*/}
      <div className="flex justify-between items-center w-11/12 h-80 bg-black p-4 rounded-[40px] shadow-md">



        {/* Left div: Arrows */}

        
        {/* <div className="flex flex-col items-center justify-center w-1/6 mr-4">
          <div className="flex justify-center mb-4 mt-8">
            <div className="w-12 h-12 bg-gray-600 rounded-lg text-white flex justify-center items-center" onTouchStart={() => handleMouseDown(38, 'ArrowUp', 'ArrowUp')}
              onTouchEnd={handleMouseUp}>
              ↑
            </div>
          </div>
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-gray-600 rounded-lg text-white mt-3 mr-4 flex justify-center items-center" onTouchStart={() => handleMouseDown(37, 'ArrowLeft', 'ArrowLeft')}
              onTouchEnd={handleMouseUp}>
              ←
            </div>
            <div className="w-12 h-12 bg-gray-600 rounded-lg text-white mt-3 ml-4 flex justify-center items-center" onTouchStart={() => handleMouseDown(39, 'ArrowRight', 'ArrowRight')}
              onTouchEnd={handleMouseUp}>
              →
            </div>
          </div>
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-gray-600 rounded-lg text-white flex justify-center items-center" style={{ marginTop: '5px' }} onTouchStart={() => handleMouseDown(40, 'ArrowDown', 'ArrowDown')}
              onTouchEnd={handleMouseUp}>
              ↓
            </div>
          </div>
        </div> */}


        {/* Middle div: EmulatorJS */}


        <div className="w-full h-full bg-gray-800 flex justify-center items-center border border-gray-700 rounded-['40px'] mx-2">
          <RetroArchEmulator key={gameName} ref={retroArchRef} game={gameName}/>
        </div>

        {/* Right div: Buttons */}


        {/* <div className="flex flex-col items-center justify-center w-1/6 ml-2">
          <div className="flex justify-end">
            <button
              className="w-12 h-12 bg-red-700 rounded-full mr-4 text-white flex justify-center items-center"
              onClick={handleAButtonClick}
              onTouchStart={handleAButtonClick}

            >
              A
            </button>
            <button className="w-12 h-12 bg-blue-700 rounded-full mr-4 text-white flex justify-center items-center" onClick={handleBButtonClick}>
              B
            </button>
          </div>
        </div> */}



      </div>
    </div>
  );
};

export default Gamepad;