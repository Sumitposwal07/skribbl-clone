import {
  useRef,
  useEffect,
  useState
} from "react";
import { socket } from "../socket/socket";
import "../styles/canvas.css";

function Canvas({
  roomCode,
  canDraw
}) {

  const [color, setColor] = useState("#000000");
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(3);
  const [tool, setTool] = useState("brush");

  useEffect(() => {
    const canvas = canvasRef.current;

    const resizeCanvas = () => {
      const temp = document.createElement("canvas");
      temp.width = canvas.width;
      temp.height = canvas.height;

      const tempCtx = temp.getContext("2d");
      tempCtx.drawImage(canvas, 0, 0);

      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(temp, 0, 0);
    };

    resizeCanvas();

    window.addEventListener("resize", resizeCanvas);

    const ctx = canvas.getContext("2d");

    socket.on(
      "draw_start",
      ({
        x,
        y,
        color,
        brushSize,
        tool
      }) => {

        if (tool === "eraser") {

          ctx.strokeStyle = "#FFFFFF";

        } else {

          ctx.strokeStyle = color;

        }

        ctx.lineWidth =
          brushSize;

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

    socket.on(
      "canvas_clear",
      () => {

        const canvas =
          canvasRef.current;

        const ctx =
          canvas.getContext("2d");

        ctx.clearRect(
          0,
          0,
          canvas.width,
          canvas.height
        );

      }
    );

    return () => {
      window.removeEventListener(
        "resize",
        resizeCanvas
      );

      socket.off("draw_start");
      socket.off("draw_move");
      socket.off("draw_end");
      socket.off("canvas_clear");
    };

  }, []);


  const getTouchPosition = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    return {
      x: e.touches[0].clientX - rect.left,
      y: e.touches[0].clientY - rect.top,
    };
  };


  const handleTouchStart = (e) => {
    e.preventDefault();

    if (!canDraw) return;

    const { x, y } = getTouchPosition(e);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.strokeStyle =
      tool === "eraser"
        ? "#FFFFFF"
        : color;

    ctx.lineWidth = brushSize;
    ctx.beginPath();
    ctx.moveTo(x, y);

    socket.emit("draw_start", {
      roomCode,
      x,
      y,
      color,
      brushSize,
      tool,
    });

    setDrawing(true);
  };


  const handleTouchMove = (e) => {
    e.preventDefault();

    if (!canDraw || !drawing) return;

    const { x, y } = getTouchPosition(e);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.lineTo(x, y);
    ctx.stroke();

    socket.emit("draw_move", {
      roomCode,
      x,
      y,
    });
  };


  const handleTouchEnd = (e) => {
    e.preventDefault();

    if (!drawing) return;

    socket.emit("draw_end", {
      roomCode,
    });

    setDrawing(false);
  };

  const startDrawing = (e) => {
    if (!canDraw) return;
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (tool === "eraser") {

      ctx.strokeStyle = "#FFFFFF";

    } else {

      ctx.strokeStyle = color;

    }

    ctx.lineWidth = brushSize;
    ctx.beginPath();
    ctx.moveTo(x, y);

    socket.emit("draw_start", {
      roomCode,
      x,
      y,
      color,
      brushSize,
      tool
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

    if (!drawing) return;

    socket.emit("draw_end", {
      roomCode
    });

    setDrawing(false);
  };


  const clearCanvas = () => {

    const canvas =
      canvasRef.current;

    const ctx =
      canvas.getContext("2d");

    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    socket.emit(
      "canvas_clear",
      {
        roomCode
      }
    );
  };

  return (
    <div className="canvas-toolbar">
      {
        canDraw && (
          <button
            onClick={clearCanvas}
          >
            Clear Canvas
          </button>
        )
      }

      {
        canDraw && (
          <input
            type="color"
            value={color}
            onChange={(e) =>
              setColor(e.target.value)
            }
          />
        )
      }


      {
        canDraw && (
          <select
            value={brushSize}
            onChange={(e) =>
              setBrushSize(
                Number(e.target.value)
              )
            }
          >
            <option value={2}>
              Thin
            </option>

            <option value={5}>
              Medium
            </option>

            <option value={10}>
              Thick
            </option>

          </select>
        )
      }


      {
        canDraw && (
          <>
            <button
              className={tool === "brush" ? "tool-active" : ""}
              onClick={() => setTool("brush")}
            >
              Brush
            </button>

            <button
              className={tool === "eraser" ? "tool-active" : ""}
              onClick={() => setTool("eraser")}
            >
              Eraser
            </button>
          </>
        )
      }


      <canvas
        className="drawing-canvas"
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
    </div>
  );
}

export default Canvas;