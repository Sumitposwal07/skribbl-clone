import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket/socket";
import "../styles/home.css";
import { toast } from "react-toastify";

function Home() {
  const navigate = useNavigate();

  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");

  const createRoom = () => {
    if (!playerName.trim()) {
      return toast.error("Please enter your name");
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
      return toast.error("Please enter your name");
    }

    if (!roomCode.trim()) {
      return toast.error("Please enter room code");
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
          toast.error(response.message);
        }
      }
    );
  };

  return (
    <div className="home-container">
      <div className="home-card">

        <h1 className="home-title">
          Skribbl Clone
        </h1>

        <div className="input-group">

          <input
            className="home-input"
            placeholder="Enter Your Name"
            value={playerName}
            onChange={(e) =>
              setPlayerName(e.target.value)
            }
          />

          <button
            className="home-btn create-btn"
            onClick={createRoom}
          >
            Create Room
          </button>

          <div className="divider">
            OR
          </div>

          <input
            className="home-input"
            placeholder="Enter Room Code"
            value={roomCode}
            onChange={(e) =>
              setRoomCode(e.target.value)
            }
          />

          <button
            className="home-btn join-btn"
            onClick={joinRoom}
          >
            Join Room
          </button>

        </div>

      </div>
    </div>
  );
}

export default Home;