// index.ts
import express, { Express, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

import connectDB from "./config/db.js";

import auth from "./routes/auth.js";
import user from "./routes/userRoutes.js";
import seller from "./routes/sellerRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";

dotenv.config();

const app: Express = express();
const PORT: number = parseInt(process.env.PORT as string, 10) || 5000;

// ----------------------
// Middleware
// ----------------------
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
  "https://mytradelink-frontend.onrender.com",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true, // ✅ allow cookies/headers
  })
);

app.use(express.json());

// Static file serving
app.use("/uploads", express.static("uploads"));

const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "public")));

// ----------------------
// API Routes
// ----------------------
app.use("/api/v1/auth", auth);
app.use("/api/v1/users", user);
app.use("/api/v1/sellers", seller);
app.use("/api/v1/messages", messageRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/services", serviceRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to TradeLink Backend server");
});

// ----------------------
// Database + Server Start
// ----------------------
connectDB()
  .then(() => {
    console.log("✅ Connected to MongoDB successfully");

    // Wrap app with HTTP server
    const server = http.createServer(app);

    // Socket.IO setup
    const io = new Server(server, {
      cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
      },
    });

    // Socket.IO auth middleware
    io.use((socket, next) => {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Authentication error"));

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
          id: string;
        };
        (socket as any).userId = decoded.id;
        next();
      } catch (err) {
        next(new Error("Authentication error"));
      }
    });

    // Socket.IO events
    io.on("connection", (socket) => {
      console.log("⚡ User connected:", (socket as any).userId);

      // When user sends a message
      socket.on("sendMessage", (msg) => {
        console.log("📩 New message:", msg);

        // In future, you can use socket.join(conversationId) for rooms
        io.emit("receiveMessage", msg);
      });

      socket.on("disconnect", () => {
        console.log("❌ User disconnected:", (socket as any).userId);
      });
    });

    // Start server
    server.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Error connecting to MongoDB:", error);
  });
