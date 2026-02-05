const express = require("express");
const app = express();
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const port = process.env.PORT || 10000;

app.use(express.static("assests"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontpage.html"));
});

app.get("/page1", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/page2", (req, res) => {
  res.sendFile(path.join(__dirname, "index2.html"));
});

app.get("/page3", (req, res) => {
  res.sendFile(path.join(__dirname, "index3.html"));
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

let users = 0;

io.on("connection", socket => {
  users++;
  console.log("User connected:", socket.id, "Total:", users);

  socket.emit("you-are", users);


  socket.on("offer", offer => {
    socket.broadcast.emit("offer", offer);
  });

  socket.on("answer", answer => {
    socket.broadcast.emit("answer", answer);
  });

  socket.on("ice-candidate", candidate => {
    socket.broadcast.emit("ice-candidate", candidate);
  });

  // 🎬 Movie sync
  socket.on("movie-play", () => socket.broadcast.emit("movie-play"));
  socket.on("movie-pause", () => socket.broadcast.emit("movie-pause"));
  socket.on("movie-seek", time => socket.broadcast.emit("movie-seek", time));

  socket.on("disconnect", () => {
    users--;
    console.log("User disconnected. Total:", users);
    io.emit("user-count", users);
  });
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
