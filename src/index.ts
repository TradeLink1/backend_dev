import express from "express";
import mongoose from "mongoose";
import { config } from "./config/env";
import { securityMiddleware } from "./middlewares/security";
import authRoutes from "./routes/auth";

const app = express();
securityMiddleware(app);

mongoose.connect(config.mongoUri)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

app.use("/api/auth", authRoutes);

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
