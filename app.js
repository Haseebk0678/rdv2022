const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const createAdapter = require("@socket.io/redis-adapter").createAdapter;
const redis = require("redis");
require("dotenv").config();


// testing language detector
const LanguageDetect = require('languagedetect');
const lngDetector = new LanguageDetect();



const { createClient } = redis;
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, "public")));

const botName = "Debate Bot";
// Reference
// https://socket.io/get-started/chat
// https://github.com/bradtraversy/chatcord
// Wanted to add debate feature by giving question and then also 
// helping people learn language by using a language detector but an error was being thrown for that

async () => {
  pubClient = createClient({ url: "redis://127.0.0.1:6379" });
  await pubClient.connect();
  subClient = pubClient.duplicate();
  io.adapter(createAdapter(pubClient, subClient));
}

// Run when client connects

io.on("connection", (socket) => {
  // console.log(io.of("/").adapter);

  socket.on("joinRoom", ({ username, room, topic}) => {
    const user = userJoin(socket.id, username, room, topic);

    socket.join(user.room);

    // Welcome current user
    socket.emit("message", formatMessage(botName, "Welcome to Debattle!"));

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botName, `${user.username} has joined the chat`)
      );

    // Send users and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
      topic: user.topic,
    });
  });

  socket.on("chatMessage", (msg) => {
    // console.log("Message from App js")
    const user = getCurrentUser(socket.id);
    

    io.to(user.room).emit("message", formatMessage(user.username, msg.msg));
  });

  // Runs when client disconnects
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(botName, `${user.username} has left the chat`)
      );

      // Send users and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
        topic: user.topic,
      });
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
