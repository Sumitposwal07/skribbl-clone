import {
  useRef,
  useEffect,
  useState
} from "react";
import { socket } from "../socket/socket";

function Canvas({
  roomCode,
  canDraw
}) {

  const canvasRef = useRef(null);

  const [drawing, setDrawing] =
    useState(false);

  useEffect(() => {

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.lineWidth = 3;
    ctx.lineCap = "round";

    socket.on(
      "draw_start",
      ({ x, y }) => {

        ctx.beginPath();
        ctx.moveTo(x, y);

      }
    );

    socket.on(
      "draw_move",
      ({ x, y }) => {

        ctx.lineTo(x, y);
        ctx.stroke();

      }
    );

    socket.on(
      "draw_end",
      () => {

        ctx.closePath();

      }
    );

    return () => {

      socket.off("draw_start");
      socket.off("draw_move");
      socket.off("draw_end");

    };

  }, []);

  const startDrawing = (e) => {
    if (!canDraw) return;
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.beginPath();
    ctx.moveTo(x, y);

    socket.emit("draw_start", {
      roomCode,
      x,
      y
    });

    setDrawing(true);
  };

  const draw = (e) => {
    if (!canDraw) return;

    if (!drawing) return;

    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.lineTo(x, y);
    ctx.stroke();

    socket.emit("draw_move", {
      roomCode,
      x,
      y
    });
  };

  const stopDrawing = () => {

    socket.emit("draw_end", {
      roomCode
    });

    setDrawing(false);
  };

  return (
    <canvas
      ref={canvasRef}
      width={900}
      height={500}
      style={{
        border: "1px solid black"
      }}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
    />
  );
}

export default Canvas;