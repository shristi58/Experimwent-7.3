const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

io.on("connection", (socket) => {
  socket.on("join", (name) => {
    socket.data.name = name || "Anonymous";
    socket.broadcast.emit("message", {
      name: "System",
      text: `${socket.data.name} joined the chat`,
      time: new Date().toISOString()
    });
  });

  socket.on("sendMessage", (msg) => {
    const payload = {
      name: socket.data.name || "Anonymous",
      text: msg,
      time: new Date().toISOString()
    };
    io.emit("message", payload);
  });

  socket.on("disconnect", () => {
    if (socket.data.name) {
      socket.broadcast.emit("message", {
        name: "System",
        text: `${socket.data.name} left the chat`,
        time: new Date().toISOString()
      });
    }
  });
});

app.get("/", (req, res) => {
  res.send("Socket.io chat server");
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
