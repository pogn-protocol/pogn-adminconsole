import React from "react";

const LobbyView = ({ lobbyId, players = [], games = [] }) => {
  return (
    <div className="w-full text-left mt-6">
      <h2 className="text-xl font-semibold mb-2">Lobby: {lobbyId}</h2>

      <div className="mb-4">
        <h3 className="font-medium">Players ({players.length}):</h3>
        <ul className="list-disc ml-5 text-sm">
          {players.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="font-medium">Games ({games.length}):</h3>
        {games.map((game) => (
          <div
            key={game.gameId}
            className="mb-3 p-2 border border-gray-200 rounded bg-gray-50"
          >
            <p className="font-semibold">{game.gameId}</p>
            <p>Type: {game.gameType}</p>
            <p>Status: {game.lobbyStatus}</p>
            <p>Players: {game.players.join(", ")}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LobbyView;
