import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Canvas from "../components/Canvas";
import WordSelector from "../components/WordSelector";
import { socket } from "../socket/socket";

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
        drawTime
      }) => {

        setDrawerId(drawerId);
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

        alert(
          `${data.playerName} guessed correctly!`
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
    };

  }, [roomCode]);


  useEffect(() => {

    if (timeLeft <= 0) return;

    const timer =
      setInterval(() => {

        setTimeLeft(prev =>
          prev - 1
        );

      }, 1000);

    return () =>
      clearInterval(timer);

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
      <div>

        <h1>Game Over</h1>

        <h2>
          Winner: {winner.name}
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





    <div>

      <h1>Game Room</h1>

      <h2>{roomCode}</h2>

      {
        wordOptions.length > 0 && (
          <WordSelector
            words={wordOptions}
            onSelect={chooseWord}
          />
        )
      }

      <h2>
        Time Left:
        {" "}
        {timeLeft}s
      </h2>

      <h2>
        Round
        {" "}
        {currentRound}
        /
        {totalRounds}
      </h2>


      <h2>Leaderboard</h2>

      <div
        style={{
          border: "1px solid black",
          padding: "10px",
          marginBottom: "20px"
        }}
      >
        {players
          .sort((a, b) => b.score - a.score)
          .map(player => (
            <div key={player.id}>
              {player.name} - {player.score}
            </div>
          ))}
      </div>


      {
        roundWord && (
          <h2>
            Word was:
            {" "}
            {roundWord}
          </h2>
        )
      }

      <Canvas
        roomCode={roomCode}
        canDraw={isDrawer}
      />

      <div>

        <h2>Chat</h2>

        <div
          style={{
            height: "200px",
            overflowY: "auto",
            border: "1px solid black",
            padding: "10px"
          }}
        >
          {messages.map((msg, index) => (
            <div key={index}>
              <strong>{msg.playerName}</strong>:
              {" "}
              {msg.text}
            </div>
          ))}
        </div>

        <input
          type="text"
          value={guess}
          onChange={(e) =>
            setGuess(e.target.value)
          }
          placeholder="Type guess..."
        />

        <button onClick={sendGuess}>
          Send
        </button>

      </div>

    </div>
  );
}

export default GameRoom;