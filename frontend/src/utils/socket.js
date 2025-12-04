// FRONTEND — socket.js
// Works with Vite. No "process" usage.
// Fully safe for browser environment.

import { io } from "socket.io-client";

let socket = null;

// Initialize socket connection
export function initSocket(userId) {
  if (socket) return socket; // avoid duplicate connections

  const backendURL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

  socket = io(backendURL, {
    transports: ["websocket"],
    withCredentials: true,
    query: {
      userId, // sent to backend socket.js
    },
  });

  socket.on("connect", () => {
    console.log("🔌 Socket connected:", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("🔌 Socket disconnected");
  });

  return socket;
}

// Get active socket instance
export function getSocket() {
  return socket;
}
