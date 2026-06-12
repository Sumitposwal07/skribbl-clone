const words =
  require("../data/words");
const generateRoomCode =
  require("../utils/generateRoomCode");


const rooms = {};

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
            drawTime: 80,
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
            currentWord: ""
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

      // Navigate everyone to GameRoom
      io.to(roomCode).emit("game_started");

const drawer =
  room.players[
    room.game.currentDrawerIndex
  ];

const options =
  words
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

setTimeout(() => {

  console.log("Drawer ID:", drawer.id);
console.log("Options:", options);

  io.to(drawer.id).emit(
    "choose_word",
    {
      options
    }
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

        io.to(roomCode).emit(
          "round_started",
          {
            drawerId:
              room.players[
                room.game.currentDrawerIndex
              ].id
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