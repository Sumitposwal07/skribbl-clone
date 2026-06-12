import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Lobby from "./pages/Lobby";
import GameRoom from "./pages/GameRoom";

function App() {
  return (
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
  );
}

export default App;
