// server.js
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoute.js';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { Server } from 'socket.io';

// Routes
import userRoutes from './routes/userRoutes.js';
import uploadRoute from './routes/upload.js';
import categoryRoutes from "./routes/categoryRoutes.js";
import carouselRoutes from "./routes/carouselRoutes.js";
import todaysDealsRoutes from "./routes/todaysDealsRoutes.js";
import userAccountRoutes from "./routes/userAccountRoutes.js";


dotenv.config();
connectDB();

// Declare app first
const app = express();

// HTTP server wrapper (needed for socket.io)
const server = http.createServer(app);

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL_PROD,
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow curl/postman
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS: " + origin));
      }
    },
    credentials: true,
  })
);



// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});


// Store io in app.locals (so routes can use it)
app.locals.io = io;

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("subscribeNotifications", (userId) => {
    socket.join(userId);
    console.log(` User ${userId} subscribed to notifications`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Middleware
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

//  Path setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check route
app.get("/api", (req, res) => {
  res.send("API is running...");
});

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

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`Server + WebSocket running on ${PORT}`)
);
