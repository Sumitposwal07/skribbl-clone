import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Home from "./pages/Home";
import Lobby from "./pages/Lobby";
import GameRoom from "./pages/GameRoom";

function App() {
  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lobby/:roomCode" element={<Lobby />} />
        <Route
          path="/game/:roomCode"
          element={<GameRoom />}
        />
      </Routes>
    </BrowserRouter>
      <ToastContainer
    position="top-right"
    autoClose={3000}
    hideProgressBar={false}
    newestOnTop
    closeOnClick
    pauseOnHover
    theme="dark"
  />
  </>
  );
}

export default App;
