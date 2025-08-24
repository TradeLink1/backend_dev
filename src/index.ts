import express, { Express, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import auth from "./routes/auth.js";
import user from "./routes/userRoutes.js";
import seller from "./routes/sellerRoutes.js";

dotenv.config();

const app: Express = express();
const PORT: number = parseInt(process.env.PORT as string, 10) || 5000;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/api/auth", auth);
app.use("/api/users", user);
app.use("/api/sellers", seller);

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to TradeLink Backend server");
});

connectDB()
  .then(() => {
    console.log("Connected to MongoDB successfully");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });
