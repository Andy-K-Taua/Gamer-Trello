// frontend/src/pages/GamesListPage.jsx


import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios'; 

const GamesListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [games, setGames] = useState([]);
  console.log('Location:',location.pathname);

  useEffect(() => {
    const fetchGames = async () => {
      console.log('Fetching games...');
      try {
        const response = await axios.get('/api/games');
        console.log('Response:', response.data);
        const gamesList = response.data.map((game) => {
          console.log(`/images/${game.name}.png`);
          return {
            id: game.id,
            name: game.name,
            image: `/images/${game.name}.png`         
          }
        });
        console.log(gamesList);
        setGames(gamesList);
      } catch (error) {
        console.error(error);
      }
    };
    fetchGames();
  }, [location.pathname]);

  const handleGameClick = (gameName) => {
    navigate(`/game-pad/${gameName}`);
  };

//   const handleGameClick = (gameName) => {
//   window.location.href = `/game-pad/${gameName}`;
// }

// const handleGameClick = (gameName) => {
//   window.location.href = `${window.location.origin}/game-pad/${gameName}`;
// };

  const filteredGames = games.filter((game) =>
    game.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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