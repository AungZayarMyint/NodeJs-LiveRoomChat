const express = require("express");
const socketIO = require("socket.io");
const cors = require("cors");

const formatMessage = require("./utils/formatMSG");

const app = express();
app.use(cors());

const server = app.listen(4000, (_) => {
  console.log("Server is runnig at port : 4000");
});

const io = socketIO(server, {
  cors: "*",
});

//run when client-server connected
io.on("connection", (socket) => {
  console.log("client connected!");

  const BOT = "ROOM MANAGER BOT";
  //send welcome message to all joined users
  socket.emit("message", formatMessage(BOT, "Welcome to the room."));

  //send joined message to all other users except joined user
  socket.broadcast.emit(
    "message",
    formatMessage(BOT, "Anonymous joined the room.")
  );

  socket.on("disconnect", (_) => {
    io.emit("message", formatMessage(BOT, "Anonymous user has left the room."));
  });
});
