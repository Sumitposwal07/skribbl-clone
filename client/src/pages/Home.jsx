import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket/socket";

function Home() {
  const navigate = useNavigate();

  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");

  const createRoom = () => {
    if (!playerName.trim()) {
      return alert("Enter name");
    }

    socket.emit(
      "create_room",
      { playerName },
      (response) => {
        if (response.success) {
          navigate(`/lobby/${response.roomCode}`);
        }
      }
    );
  };

  const joinRoom = () => {
    if (!playerName.trim()) {
      return alert("Enter name");
    }

    socket.emit(
      "join_room",
      {
        roomCode,
        playerName,
      },
      (response) => {
        if (response.success) {
          navigate(`/lobby/${roomCode}`);
        } else {
          alert(response.message);
        }
      }
    );
  };

  return (
    <div>
      <h1>Skribbl Clone</h1>

      <input
        placeholder="Name"
        value={playerName}
        onChange={(e) =>
          setPlayerName(e.target.value)
        }
      />

      <br />

      <button onClick={createRoom}>
        Create Room
      </button>

      <br />
      <br />

      <input
        placeholder="Room Code"
        value={roomCode}
        onChange={(e) =>
          setRoomCode(e.target.value)
        }
      />

      <button onClick={joinRoom}>
        Join Room
      </button>
    </div>
  );
}

export default Home;