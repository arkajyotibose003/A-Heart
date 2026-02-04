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

// ---- SOCKET SERVER ----
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

let userCount = 0;

io.on("connection", socket => {
  userCount++;
  console.log("User connected:", socket.id);

  socket.emit("user-count", userCount);

  socket.on("offer", data => {
    socket.broadcast.emit("offer", data);
  });

  socket.on("answer", data => {
    socket.broadcast.emit("answer", data);
  });

  socket.on("ice-candidate", candidate => {
    socket.broadcast.emit("ice-candidate", candidate);
  });

  // 🎬 MOVIE SYNC
  socket.on("movie-play", () => socket.broadcast.emit("movie-play"));
  socket.on("movie-pause", () => socket.broadcast.emit("movie-pause"));
  socket.on("movie-seek", time => socket.broadcast.emit("movie-seek", time));

  socket.on("disconnect", () => {
    userCount--;
    console.log("User disconnected");
  });
});

server.listen(port, () => {
  console.log(`Server + Socket.IO running on port ${port}`);
});
