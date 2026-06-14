import { useEffect, useState } from "react";
import { socket } from "../socket/socket";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../styles/lobby.css";


function Lobby() {
  const { roomCode } = useParams();
  const navigate = useNavigate();

  const [players, setPlayers] = useState([]);
  const [hostId, setHostId] = useState("");

  useEffect(() => {

    socket.emit(
      "get_players",
      { roomCode },
      (data) => {

        setPlayers(data.players);
        setHostId(data.hostId);

      }
    );

    socket.on(
      "player_joined",
      (playersList) => {
        setPlayers(playersList);
      }
    );

    socket.on(
      "player_left",
      (playersList) => {
        setPlayers(playersList);
      }
    );

    socket.on("game_started", () => {
      navigate(`/game/${roomCode}`);
    });

    return () => {
      socket.off("player_joined");
      socket.off("player_left");
      socket.off("game_started");
    };

  }, [roomCode]);

  const isHost = socket.id === hostId;

 const startGame = () => {

  if (players.length < 2) {
    return toast.warning("At least 2 players required");
  }

  socket.emit(
    "start_game",
    { roomCode }
  );
};

  return (
    <div className="lobby-container">

  <div className="lobby-card">

    <div className="lobby-header">

      <h1 className="lobby-title">
        Game Lobby
      </h1>

      <div className="room-code">
        Room: {roomCode}
      </div>

    </div>

    <h2 className="players-title">
      Players ({players.length}/8)
    </h2>

    <div className="players-grid">

      {players.map((player) => (

        <div
          key={player.id}
          className="player-card"
        >
          <div className="player-name">
            {player.name}
          </div>
        </div>

      ))}

    </div>

    {isHost && (
      <button
        className="start-btn"
        onClick={startGame}
      >
        🚀 Start Game
      </button>
    )}

  </div>

</div>
  );
}

export default Lobby;