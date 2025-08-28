// server.js
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { Server } from 'socket.io';

// Routes
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoute.js';
import userRoutes from './routes/userRoutes.js';
import uploadRoute from './routes/upload.js';
import categoryRoutes from "./routes/categoryRoutes.js";
import carouselRoutes from "./routes/carouselRoutes.js";
import todaysDealsRoutes from "./routes/todaysDealsRoutes.js";
import userAccountRoutes from "./routes/userAccountRoutes.js";

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// --- Path setup ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- CORS ---
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL_PROD,
];
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

// --- Socket.IO ---
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});
app.locals.io = io;

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);
  socket.on("subscribeNotifications", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} subscribed to notifications`);
  });
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// --- Static files ---
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve frontend (React/Vite build from "dist")
app.use(express.static(path.join(__dirname, 'dist')));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api', uploadRoute);
app.use("/api/categories", categoryRoutes);
app.use("/api/carousels", carouselRoutes);
app.use("/api/todaysDeals", todaysDealsRoutes);
app.use('/api/users', userAccountRoutes);

// Health check
app.get("/api", (req, res) => {
  res.send("API is running...");
});

// Catch-all for React Router (important!)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// --- Start server ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`Server + WebSocket running on ${PORT}`)
);
