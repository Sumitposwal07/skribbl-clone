import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import Canvas from "../components/Canvas";
import WordSelector from "../components/WordSelector";
import { socket } from "../socket/socket";
import { toast } from "react-toastify";
import "../styles/game.css";

function GameRoom() {

  const { roomCode } = useParams();

  const [wordOptions, setWordOptions] = useState([]);
  const [drawerId, setDrawerId] = useState("");
  const [messages, setMessages] = useState([]);
  const [guess, setGuess] = useState("");
  const [players, setPlayers] = useState([]);
  const [roundWord, setRoundWord] = useState("");
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(3);
  const [winner, setWinner] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [drawerName, setDrawerName] = useState("");
  const [displayWord, setDisplayWord] = useState("");

  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop =
        chatRef.current.scrollHeight;
    }
  }, [messages]);



  useEffect(() => {

    socket.emit(
      "get_players",
      { roomCode },
      (data) => {
        setPlayers(data.players);
      }
    );

    socket.on(
      "choose_word",
      ({ options }) => {
        console.log("choose_word received", options);
        setWordOptions(options);
      }
    );

    socket.on(
      "round_started",
      ({
        drawerId,
        drawerName,
        drawTime
      }) => {

        setDrawerId(drawerId);
        setDrawerName(drawerName);
        setTimeLeft(drawTime);

      }
    );

    socket.on(
      "chat_message",
      (message) => {

        setMessages(prev => [
          ...prev,
          message
        ]);

      }
    );


    socket.on(
      "guess_result",
      (data) => {

        toast.success(
          `${data.playerName} guessed correctly! 🎉`
        );

      }
    );

    socket.on(
      "score_update",
      (updatedPlayers) => {
        setPlayers(updatedPlayers);
      }
    );

    socket.on(
      "round_end",
      ({ word }) => {

        setRoundWord(word);
        toast.info(
          `📝 Word was: ${word}`
        );

        setTimeout(() => {
          setRoundWord("");
        }, 3000);

      }
    );


    socket.on(
      "round_update",
      ({
        round,
        totalRounds
      }) => {

        setCurrentRound(
          round
        );

        setTotalRounds(
          totalRounds
        );

        toast.dismiss();

        toast.info(
          `🎯 Round ${round} started`
        );

      }
    );


    socket.on(
      "game_over",
      ({
        winner,
        leaderboard
      }) => {

        setWinner(winner);

        setPlayers(
          leaderboard
        );

        toast.dismiss();

        toast.success(
          `🏆 ${winner.name} wins the game!`
        );

      }
    );

    socket.on(
      "word_update",
      ({ word }) => {

        setDisplayWord(word);

      }
    );


    return () => {
      socket.off("choose_word");
      socket.off("round_started");
      socket.off("chat_message");
      socket.off("guess_result");
      socket.off("score_update");
      socket.off("round_end");
      socket.off("round_update");
      socket.off("game_over");
      socket.off("word_update");
    };

  }, [roomCode]);


  useEffect(() => {

    if (timeLeft <= 0) return;

    const timer = setTimeout(() => {

      setTimeLeft(prev => prev - 1);

    }, 1000);

    return () => clearTimeout(timer);

  }, [timeLeft]);


  const chooseWord = (word) => {

    socket.emit(
      "word_chosen",
      {
        roomCode,
        word
      }
    );

    setWordOptions([]);
  };


  const isDrawer =
    socket.id === drawerId;

  if (winner) {

    return (
      <div className="winner-screen">

        <h1>
          🏆 Game Over
        </h1>

        <h2>
          🥇 Winner: {winner.name}
        </h2>

        <h3>
          Score: {winner.score}
        </h3>

        <h2>Final Leaderboard</h2>

        {players
          .slice() // important
          .sort((a, b) => b.score - a.score)
          .map(player => (
            <div key={player.id}>
              {player.name} - {player.score}
            </div>
          ))
        }

      </div>
    );

  }





  const sendGuess = () => {

    if (!guess.trim()) return;

    socket.emit(
      "guess",
      {
        roomCode,
        text: guess
      }
    );

    setGuess("");
  };

  return (





    <div className="game-container">

      <header className="game-header">
        <h1>Game Room</h1>

        <div className="room-info">
          <span>Room: {roomCode}</span>
          <span>Round {currentRound}/{totalRounds}</span>
          <span>⏱ {timeLeft}s</span>
        </div>
      </header>

      {wordOptions.length > 0 && (
        <WordSelector
          words={wordOptions}
          onSelect={chooseWord}
        />
      )}

      <div className="game-status-bar">
        <div className="status-card">
          <h4>Current Word</h4>
          <p>{displayWord}</p>
        </div>

        <div className="status-card">
          <h4>Drawer</h4>
          <p>{drawerName}</p>
        </div>
      </div>

      <div className="game-layout">

        <aside className="leaderboard-card">

          <h2>Leaderboard</h2>

          {players
            .slice()
            .sort((a, b) => b.score - a.score)
            .map((player, index) => (
              <div
                key={player.id}
                className="player-row"
              >
                <span>
                  #{index + 1}
                </span>

                <span>
                  {player.name}
                </span>

                <span>
                  {player.score}
                </span>
              </div>
            ))}
        </aside>

        <main className="canvas-section">

          {roundWord && (
            <div className="word-reveal">
              Word was: {roundWord}
            </div>
          )}

          <Canvas
            roomCode={roomCode}
            canDraw={isDrawer}
          />

        </main>

        {!isDrawer && (
          <aside className="chat-card">

            <h2>Chat</h2>

            <div ref={chatRef} className="chat-messages">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className="message"
                >
                  <strong>
                    {msg.playerName}
                  </strong>
                  : {msg.text}
                </div>
              ))}
            </div>

            <div className="chat-input-wrapper">

              <input
                type="text"
                value={guess}
                onChange={(e) =>
                  setGuess(e.target.value)
                }
                placeholder="Type your guess..."
              />

              <button onClick={sendGuess}>
                Send
              </button>

            </div>

          </aside>
        )}

      </div>
    </div>

  );
}

export default GameRoom;