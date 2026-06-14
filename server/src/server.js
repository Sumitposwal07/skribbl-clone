const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const roomSocket = require("./sockets/roomSocket");
require("dotenv").config();

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
         origin: process.env.CLIENT_URL,
         credentials: true,
         methods: ["GET", "POST"]
    }
});

roomSocket(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});