const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const roomSocket = require("./sockets/roomSocket");

const app = express();

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

roomSocket(io);

const PORT = 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});