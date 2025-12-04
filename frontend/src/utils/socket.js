// FRONTEND — socket.js
// Production-safe version (No localhost fallback)

import { io } from "socket.io-client";

let socket = null;

// Initialize socket connection
export function initSocket(userId) {
  if (socket) return socket; // avoid duplicate connections

  const backendURL = import.meta.env.VITE_SOCKET_URL;

  if (!backendURL) {
    console.error("❌ VITE_SOCKET_URL missing! Socket cannot connect.");
    return null;
  }

  socket = io(backendURL, {
    transports: ["websocket"],
    withCredentials: true,
    query: { userId }
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
