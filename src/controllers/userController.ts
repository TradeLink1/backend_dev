import { Request, Response } from "express";
import {User} from "../models/User"

// Create profile
export const createProfile = async (req: Request, res: Response) => {
  try {
    const { name, email, bio } = req.body;
    const user = new User({ name, email, bio });
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error });
  }
};

// View profile
export const viewProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error });
  }
};

// Edit profile
export const editProfile = async (req: Request, res: Response) => {
  try {
    const { name, bio } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, bio },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error });
  }
};
