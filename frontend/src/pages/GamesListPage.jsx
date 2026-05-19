// frontend/src/pages/GamesListPage.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '../lib/axios';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const GamesListPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [games, setGames] = useState([]);
  const [isVerifying, setIsVerifying] = useState(true);
  
  // Use a reference pointer to instantly kill infinite loop execution paths
  const redirectingRef = useRef(false);

  useEffect(() => {
    const verifyAccessAndFetchGames = async () => {
      if (redirectingRef.current) return;

      try {
        console.log('Verifying subscription access...');
        await axiosInstance.get('/subscriptions/check-expiry');
        
        console.log('Access granted. Fetching games...');
        const response = await axiosInstance.get('/games');
        
        const gamesList = response.data.map((game) => ({
          id: game.id,
          name: game.name,
          image: `/images/${game.name}.png`         
        }));
        
        setGames(gamesList);
        setIsVerifying(false);
        
      } catch (error) {
        console.error("Authorization check failed:", error);
        
        if (error.response && error.response.status === 401) {
          redirectingRef.current = true; // Block subsequent triggers
          toast.error("An active subscription plan is required to access games.");
          
          // Use replace: true to cleanly swap history contexts without tripping pushState
          navigate('/subscription', { replace: true });
        } else {
          toast.error("An error occurred loading your dashboard.");
          setIsVerifying(false);
        }
      }
    };

    verifyAccessAndFetchGames();
    // REMOVED location.pathname from here to break the route-change loop trigger
  }, [navigate]);

  const handleGameClick = (gameName) => {
    window.location.href = `/game-pad/${gameName}`;
  };

  const filteredGames = games.filter((game) =>
    game.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isVerifying) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-base-200">
        <Loader2 className="size-10 animate-spin text-success mb-2"/>
        <span className="text-lg font-semibold text-base-content/70">Verifying access credentials...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex justify-center mb-4 mx-auto max-w-2xl w-full rounded-lg">
        <input
          type="text"
          placeholder="Type Game Title Here..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input input-bordered w-full mb-4 rounded-[20px]"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
        {filteredGames.filter(game => game.id !== '.DS_Store').map((game) => (
          <div
            key={game.id}
            className="card bg-white shadow-xl cursor-pointer rounded-lg"
            onClick={() => handleGameClick(game.name)}
          >
            <figure>
              <img src={game.image} alt={game.name} className="object-cover h-48 w-full" />
            </figure>
            <div className="card-body p-4 text-blue-500">
              <h2 className="card-title">{game.name}</h2>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GamesListPage;