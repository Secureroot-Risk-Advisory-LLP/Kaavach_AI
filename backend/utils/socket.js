// backend/socket.js
import { Server } from "socket.io";

let io;

export function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
    // pingInterval/pingTimeout defaults are fine for basic setup
  });

  io.on("connection", (socket) => {
    // clients send their userId after connecting (or via query)
    // optionally: socket.handshake.query.userId
    const { userId } = socket.handshake.query || {};
    if (userId) {
      socket.join(`user:${userId}`); // join a personal room
    }

    socket.on("joinAllHackersRoom", () => {
      socket.join("hackers");
    });

    socket.on("disconnect", () => {
      // cleanup if needed
    });
  });

  console.log("✅ Socket.IO initialized");
  return io;
}

export function getIO() {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
}

// helper to emit notifications to a user
export function emitNotificationToUser(userId, payload) {
  if (!io) return;
  io.to(`user:${userId}`).emit("notification", payload);
}

// broadcast to all hackers (e.g., new program)
export function broadcastToHackers(event, payload) {
  if (!io) return;
  io.to("hackers").emit(event, payload);
}
