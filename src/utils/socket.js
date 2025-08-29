// utils/socket.js
import { io } from "socket.io-client";

export const socket = io("https://ishop-2-f9qp.onrender.com", {
  transports: ["polling"],
  withCredentials: true,
});