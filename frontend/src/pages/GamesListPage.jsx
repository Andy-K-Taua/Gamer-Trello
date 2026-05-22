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
  
  const redirectingRef = useRef(false);

  useEffect(() => {
    const verifyAccessAndFetchGames = async () => {
      if (redirectingRef.current) return;

      try {
        console.log('Verifying subscription access...');
        // Points to the isolated verification path
        await axiosInstance.get('/subscriptions/status/verify');
        
        console.log('Access granted. Fetching games...');
        const response = await axiosInstance.get('/games');
        
        // Filter out system metadata files like .DS_Store before saving to state
        const gamesList = response.data
          .filter((game) => game.name !== '.DS_Store' && game.id !== '.DS_Store')
          .map((game) => ({
            id: game.id,
            name: game.name,
            image: `/images/${game.name}.png`         
          }));
        
        setGames(gamesList);
        setIsVerifying(false);
        
      } catch (error) {
        console.error("Authorization check failed:", error);
        
        const status = error.response?.status;
        
        // STOPS THE LOOP: Only redirect if it's an explicit 401 subscription wall
        if (status === 401) {
          redirectingRef.current = true;
          toast.error("An active subscription plan is required to access games.");
          navigate('/subscription', { replace: true });
        } else {
          // If the server has a 500 error, halt safely here instead of bouncing!
          toast.error("Server synchronization error. Please try again later.");
          setIsVerifying(false);
        }
      }
    };

    verifyAccessAndFetchGames();
  }, [navigate]);

  const handleGameClick = (gameName) => {
    navigate(`/game-pad/${gameName}`);
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
      {/* Search Bar Wrapper */}
      <div className="flex justify-center mb-4 mx-auto max-w-2xl w-full rounded-lg">
        <input
          type="text"
          placeholder="Type Game Title Here..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input input-bordered w-full mb-4 rounded-[20px]"
        />
      </div>

      {/* Empty State Presentation */}
      {filteredGames.length === 0 ? (
        <div className="text-center py-12 bg-base-100 rounded-xl border border-base-300 max-w-2xl mx-auto shadow-sm">
          <p className="text-lg font-medium text-base-content/60">No games match your search criteria.</p>
          <button 
            onClick={() => setSearchQuery('')} 
            className="btn btn-success btn-sm mt-4 text-white rounded-full px-6 normal-case"
          >
            Clear Search
          </button>
        </div>
      ) : (
        /* Games Grid Container */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
          {filteredGames.map((game) => (
            <div
              key={game.id}
              className="card bg-white shadow-xl cursor-pointer rounded-lg hover:scale-[1.02] transition-transform duration-200"
              onClick={() => handleGameClick(game.name)}
            >
              <figure>
                <img 
                  src={game.image} 
                  alt={game.name} 
                  className="object-cover h-48 w-full" 
                  onError={(e) => {
                    e.target.onerror = null; // Prevents infinite loop if fallback image also fails
                    e.target.src = '/images/fallback-placeholder.png'; // Graceful placeholder UI asset
                  }}
                />
              </figure>
              <div className="card-body p-4 text-blue-500">
                <h2 className="card-title text-md md:text-lg font-bold">{game.name}</h2>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GamesListPage;