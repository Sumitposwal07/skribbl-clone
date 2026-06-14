# Architecture Overview

Frontend:
React + Vite

Backend:
Node.js + Express + Socket.IO

Game Flow:

1. User creates or joins a room
2. Players enter lobby
3. Host starts game
4. Drawer receives word options
5. Drawer selects word
6. Canvas events are broadcast via Socket.IO
7. Guessers submit answers through chat
8. Correct guesses update scores
9. Multiple rounds are played
10. Winner determined from leaderboard

Canvas System:
- HTML5 Canvas
- draw_start
- draw_move
- draw_end
- canvas_clear

Communication:
Client <-> Socket.IO <-> Node Server