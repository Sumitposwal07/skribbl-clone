import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Canvas from "../components/Canvas";
import WordSelector from "../components/WordSelector";
import { socket } from "../socket/socket";

function GameRoom() {

  const { roomCode } = useParams();

  const [wordOptions, setWordOptions] = useState([]);
  const [drawerId, setDrawerId] = useState("");

  useEffect(() => {

   socket.on(
  "choose_word",
  ({ options }) => {
    console.log("choose_word received", options);
    setWordOptions(options);
  }
);

    socket.on(
      "round_started",
      ({ drawerId }) => {
        setDrawerId(drawerId);
      }
    );

    return () => {
      socket.off("choose_word");
      socket.off("round_started");
    };

  }, []);


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

      <Canvas
        roomCode={roomCode}
        canDraw={isDrawer}
      />

    </div>
  );
}

export default GameRoom;