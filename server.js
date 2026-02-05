const express = require("express");
const app = express();
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const port = process.env.PORT || 10000;

app.use(express.static("assests"));

app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "frontpage.html"))
);
app.get("/page1", (req, res) =>
  res.sendFile(path.join(__dirname, "index.html"))
);
app.get("/page2", (req, res) =>
  res.sendFile(path.join(__dirname, "index2.html"))
);
app.get("/page3", (req, res) =>
  res.sendFile(path.join(__dirname, "index3.html"))
);

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// ---------------- ROOMS ----------------
const ROOM_ID = "watch-room";

io.on("connection", socket => {
  const room = io.sockets.adapter.rooms.get(ROOM_ID);
  const usersInRoom = room ? room.size : 0;

  if (usersInRoom >= 2) {
    socket.emit("room-full");
    socket.disconnect();
    return;
  }

  socket.join(ROOM_ID);
  console.log("User connected:", socket.id);

  io.to(ROOM_ID).emit("user-count", usersInRoom + 1);

  // -------- WebRTC signaling (ROOM BASED) --------
  socket.on("offer", data =>
    socket.to(ROOM_ID).emit("offer", data)
  );

  socket.on("answer", data =>
    socket.to(ROOM_ID).emit("answer", data)
  );

  socket.on("ice-candidate", candidate =>
    socket.to(ROOM_ID).emit("ice-candidate", candidate)
  );

  // -------- Movie sync --------
  socket.on("movie-play", () =>
    socket.to(ROOM_ID).emit("movie-play")
  );

  socket.on("movie-pause", () =>
    socket.to(ROOM_ID).emit("movie-pause")
  );

  socket.on("movie-seek", time =>
    socket.to(ROOM_ID).emit("movie-seek", time)
  );

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    const room = io.sockets.adapter.rooms.get(ROOM_ID);
    const count = room ? room.size : 0;
    io.to(ROOM_ID).emit("user-count", count);
  });
});

server.listen(port, () =>
  console.log(`Server running on port ${port}`)
);
