const words =
  require("../data/words");
const generateRoomCode =
  require("../utils/generateRoomCode");


const rooms = {};

function startRound(io, roomCode, room, words) {

  const drawer =
    room.players[
    room.game.currentDrawerIndex
    ];

  const options =
    [...words]
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

  io.to(drawer.id).emit(
    "choose_word",
    {
      options
    }
  );
}

function revealHint(
  io,
  roomCode,
  room
) {

  const word =
    room.game.currentWord;

  room.game.revealedLetters++;

  const revealed =
    word
      .split("")
      .map((char, index) => {

        if (
          index <
          room.game.revealedLetters
        ) {
          return char;
        }

        return "_";
      })
      .join(" ");

  io.to(roomCode).emit(
    "word_update",
    {
      word: revealed
    }
  );

}



function endRound(
  io,
  roomCode,
  room
) {

  clearTimeout(
    room.game.timer
  );

  clearInterval(
    room.game.hintTimer
  );

  io.to(roomCode).emit(
    "round_end",
    {
      word:
        room.game.currentWord
    }
  );

  room.game.currentWord =
    "";

  room.game.currentDrawerIndex++;

  if (
    room.game.currentDrawerIndex >=
    room.players.length
  ) {
    room.game.currentDrawerIndex = 0;
  }

  if (
    room.game.currentDrawerIndex === 0
  ) {
    room.game.currentRound++;
  }

  if (
    room.game.currentRound >
    room.settings.rounds
  ) {

    const winner =
      [...room.players]
        .sort(
          (a, b) =>
            b.score - a.score
        )[0];

    io.to(roomCode).emit(
      "game_over",
      {
        winner,
        leaderboard:
          room.players
      }
    );

    return;
  }

  io.to(roomCode).emit(
    "round_update",
    {
      round:
        room.game.currentRound,
      totalRounds:
        room.settings.rounds
    }
  );

  setTimeout(() => {

    startRound(
      io,
      roomCode,
      room,
      words
    );

  }, 3000);
}



module.exports = (io) => {

  io.on("connection", (socket) => {

    console.log("Connected:", socket.id);

    // CREATE ROOM
    socket.on(
      "create_room",
      ({ playerName }, callback) => {

        const roomCode =
          generateRoomCode();

        rooms[roomCode] = {
          hostId: socket.id,

          settings: {
            maxPlayers: 8,
            rounds: 3,
            drawTime: 60,
            wordChoices: 3
          },

          players: [
            {
              id: socket.id,
              name: playerName,
              score: 0
            }
          ],

          game: {
            currentRound: 1,
            currentDrawerIndex: 0,
            currentWord: "",
            timer: null,
            hintTimer: null,
            revealedLetters: 0
          }
        };

        socket.join(roomCode);

        callback({
          success: true,
          roomCode
        });

        io.to(roomCode).emit(
          "player_joined",
          rooms[roomCode].players
        );
      }
    );

    // JOIN ROOM
    socket.on(
      "join_room",
      ({ roomCode, playerName }, callback) => {

        const room = rooms[roomCode];

        // Room doesn't exist
        if (!room) {
          return callback({
            success: false,
            message: "Room not found"
          });
        }

        // Room is full
        if (room.players.length >= 8) {
          return callback({
            success: false,
            message: "Room Full"
          });
        }

        // Add player
        room.players.push({
          id: socket.id,
          name: playerName,
          score: 0
        });

        socket.join(roomCode);

        io.to(roomCode).emit(
          "player_joined",
          room.players
        );

        callback({
          success: true
        });
      }
    );


    socket.on("get_players", ({ roomCode }, callback) => {

      const room = rooms[roomCode];

      if (!room) {
        return callback(null);
      }

      callback({
        players: room.players,
        hostId: room.hostId,
        settings: room.settings
      });
    });


    socket.on("start_game", ({ roomCode }) => {

      const room = rooms[roomCode];

      if (!room) return;

      if (room.hostId !== socket.id) return;

      io.to(roomCode).emit("game_started");

      setTimeout(() => {

        startRound(
          io,
          roomCode,
          room,
          words
        );

      }, 1000);

    });


    socket.on(
      "word_chosen",
      ({ roomCode, word }) => {

        const room =
          rooms[roomCode];

        if (!room) return;

        room.game.currentWord =
          word;

        room.game.revealedLetters = 0;

        room.game.hintTimer =
          setInterval(() => {

            revealHint(
              io,
              roomCode,
              room
            );

          }, 20000);

        io.to(roomCode).emit(
          "word_update",
          {
            word:
              "_ ".repeat(word.length)
          }
        );

        io.to(
          room.players[
            room.game.currentDrawerIndex
          ].id
        ).emit(
          "word_update",
          {
            word
          }
        );

        room.game.timer =
          setTimeout(() => {

            console.log("SERVER TIMER FINISHED");

            endRound(
              io,
              roomCode,
              room
            );

          }, room.settings.drawTime * 1000);

        const currentDrawer =
          room.players[
          room.game.currentDrawerIndex
          ];

        io.to(roomCode).emit(
          "round_started",
          {
            drawerId:
              currentDrawer.id,

            drawerName:
              currentDrawer.name,

            drawTime:
              room.settings.drawTime
          }
        );

      }
    );


    socket.on(
      "guess",
      ({ roomCode, text }) => {

        const room =
          rooms[roomCode];

        if (!room) return;

        const player =
          room.players.find(
            p => p.id === socket.id
          );


        const currentWord =
          room.game.currentWord;

        if (
          text.trim().toLowerCase() ===
          currentWord.trim().toLowerCase()
        ) {

          player.score += 100;

          io.to(roomCode).emit(
            "guess_result",
            {
              correct: true,
              playerId: player.id,
              playerName: player.name,
              points: player.score
            }
          );

          io.to(roomCode).emit(
            "score_update",
            room.players
          );

          endRound(
            io,
            roomCode,
            room
          );

          return;
        }

        io.to(roomCode).emit(
          "chat_message",
          {
            playerId: socket.id,
            playerName: player.name,
            text
          }
        );

      }
    );


    socket.on("draw_start", (data) => {

      socket.to(data.roomCode)
        .emit("draw_start", data);

    });

    socket.on("draw_move", (data) => {

      socket.to(data.roomCode)
        .emit("draw_move", data);

    });

    socket.on("draw_end", (data) => {

      socket.to(data.roomCode)
        .emit("draw_end", data);

    });


    socket.on(
      "canvas_clear",
      ({ roomCode }) => {

        socket.to(roomCode).emit(
          "canvas_clear"
        );

      }
    );

    // DISCONNECT
    socket.on("disconnect", () => {

      for (const roomCode in rooms) {

        const room = rooms[roomCode];

        room.players =
          room.players.filter(
            player =>
              player.id !== socket.id
          );

        io.to(roomCode).emit(
          "player_left",
          room.players
        );

        if (
          room.players.length === 0
        ) {
          delete rooms[roomCode];
        }
      }
    });

  });

};