import { io } from "socket.io-client";

// Backend URL from env
const SOCKET_URL = import.meta.env.VITE_API_URL || "https://ishop-2-f9qp.onrender.com";

export const socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"], // fallback ensures Render + Netlify works
  withCredentials: true,
});

// Example: subscribe to notifications
export const subscribeToNotifications = (userId) => {
  socket.emit("subscribeNotifications", userId);
};
