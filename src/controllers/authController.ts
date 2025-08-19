import { Request, Response } from "express";
import User from "../models/User.js";
import Seller from "../models/Seller.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req: Request, res: Response) => {
  try {
    const {
      email,
      password,
      name,
      phone,
      address,
      role,
      storeName,
      description,
      location,
    } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Email, password, and name are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = new User({
      name,
      email,
      password,
      phone,
      address,
      role: role === "seller" ? "seller" : "user",
    });

    await user.save();

    let seller = null;
    if (role === "seller" && storeName && location) {
      seller = new Seller({
        userId: user._id,
        storeName,
        description,
        location: {
          address: location.address,
          coordinates: location.coordinates,
        },
        phone,
        email,
      });
      await seller.save();
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1h",
      }
    );

    res.status(201).json({
      message: `${
        role === seller ? seller?.storeName : user.name
      } registered suceessfully now`,
      token,
      userId: user._id,
      sellerId: seller ? seller._id : undefined,
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res
      .status(500)
      .json({ message: "Internal server error during registration" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1h",
      }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      userId: user._id,
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Internal server error during login" });
  }
};
