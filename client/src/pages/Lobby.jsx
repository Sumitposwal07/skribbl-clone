import { useEffect, useState } from "react";
import { socket } from "../socket/socket";
import { useParams, useNavigate } from "react-router-dom";

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

    socket.emit(
      "start_game",
      { roomCode }
    );

  };

  return (
    <div>
      <h1>Lobby</h1>

      <h3>Room: {roomCode}</h3>

      <h2>Players</h2>
      {isHost && (
        <button onClick={startGame}>
          Start Game
        </button>
      )}

      {players.map((player) => (
        <div key={player.id}>
          {player.name}
        </div>
      ))}
    </div>
  );
}

export default Lobby;