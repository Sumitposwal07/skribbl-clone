# Architecture Overview

Frontend:
React

Backend:
Node + Express + Socket.IO

Real-Time Layer:
Socket.IO

Drawing Flow:
Canvas -> Socket -> Server -> Other Players

Guessing Flow:
User Guess
    ↓
Server Validation
    ↓
Score Update
    ↓
Leaderboard Broadcast

Room Flow:
Create Room
Join Room
Lobby
Start Game
Rounds
Winner