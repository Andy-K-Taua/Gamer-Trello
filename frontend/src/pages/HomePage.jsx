// frontend/src/pages/HomePage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TypeText = ({ text, speed = 35 }) => {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    let i = 0;
    const intervalId = setInterval(() => {
      if (i < text.length) {
        setDisplayText(text.substring(0, i + 1));
        i++;
      } else {
        clearInterval(intervalId);
      }
    }, speed);

    return () => clearInterval(intervalId);
  }, [text, speed]);

  return <span>{displayText}</span>;
};

const HomePage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/signup')
  }
  return (
    <div className="flex flex-col h-screen justify-between pt-50">
  <h1 className="text-5xl font-bold text-center">GT<span className="text-xs ml-2">(Gamer Trello)</span></h1>
  <div className="max-w-md mx-auto px-8">
    <p className="py-6">
      <TypeText
        text="Welcome to GAMER TRELLO, your ultimate destination for retro nostalgia and next-gen gaming. Dive into a treasure trove of classic games from the past."
        speed={50}
      />
    </p>
  </div>
  <div className="text-center mb-50">
    <button onClick={handleGetStarted} className="btn btn-soft btn-success rounded-[14px] w-80">Get Started</button>
  </div>
</div>
  )
}

export default HomePage