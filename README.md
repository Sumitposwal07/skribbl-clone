# Skribbl Clone

Real-time multiplayer drawing and guessing game.

## Features

- Create Room
- Join Room
- Lobby System
- Real-Time Drawing
- Word Selection
- Chat Guessing
- Scoreboard
- Multi-Round Gameplay
- Winner Announcement

## Tech Stack

Frontend:
- React
- React Router
- Socket.IO Client

Backend:
- Node.js
- Express.js
- Socket.IO

## Installation

Frontend

npm install
npm run dev

Backend

npm install
npm run dev

## Live Demo

https://YOUR-URL-HERE

## Architecture

React Frontend
      |
Socket.IO
      |
Node.js Server
      |
Game State Management

Canvas events:
draw_start
draw_move
draw_end

Game events:
create_room
join_room
start_game
guess
score_update
game_over