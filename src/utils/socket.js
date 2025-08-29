import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL || "https://ishop-2-f9qp.onrender.com";
export const socket = io(SOCKET_URL, {
  transports: ["polling"],
  withCredentials: true,
});
