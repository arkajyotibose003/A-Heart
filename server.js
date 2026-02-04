const express = require('express')
const app = express()
const path = require('path');
const port = process.env.PORT || 3000;
const http = require("http");
const { Server } = require("socket.io");


app.use(express.static("assests"));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, "frontpage.html"));
})

app.get('/page1', (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
})

app.get('/page2', (req, res) => {
  res.sendFile(path.join(__dirname, "index2.html"));
})

app.get('/page3', (req, res) => {
  res.sendFile(path.join(__dirname, "index3.html"));
})

//Video Calling feature
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

io.on("connection", socket => {
  console.log("User connected:", socket.id);

  socket.on("offer", data => {
    socket.broadcast.emit("offer", data);
  });

  socket.on("answer", data => {
    socket.broadcast.emit("answer", data);
  });

  socket.on("ice-candidate", candidate => {
    socket.broadcast.emit("ice-candidate", candidate);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });

  // 🎬 MOVIE SYNC
  socket.on("movie-play", () => {
    socket.broadcast.emit("movie-play");
  });

  socket.on("movie-pause", () => {
    socket.broadcast.emit("movie-pause");
  });

  socket.on("movie-seek", time => {
    socket.broadcast.emit("movie-seek", time);
  });

});

server.listen(port, () => {
  console.log(`Server + Socket.IO running on port ${port}`);
});
