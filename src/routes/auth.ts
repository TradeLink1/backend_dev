import express from "express";
import { hashPassword, comparePassword, generateToken } from "../utils/auth";
import {User} from "../models/User"
const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await hashPassword(password);
  const user = new User({ name, email, password: hashedPassword });
  await user.save();
  res.json({ message: "User registered" });
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await comparePassword(password, user.password))) {
    return res.status(400).json({ message: "Invalid credentials" });
  }
  const token = generateToken(user.id);
  res.json({ token });
});

export default router;
