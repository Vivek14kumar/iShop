// utils/socket.js
import { io } from "socket.io-client";

export const socket = io("https://ishop-1-le5r.onrender.com", {
  transports: ["polling"],
  withCredentials: true,
});
