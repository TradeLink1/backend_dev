import { Request, Response } from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const getUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User profile retrieved successfully",
      user,
    });
  } catch (error) {
    console.error("Error retrieving user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, phone, address } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user?.id,
      { name, email, phone, address },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.user?.id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User profile deleted successfully",
      userId: req.user?.id,
    });
  } catch (error) {
    console.error("Error deleting user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Current and new passwords are required" });
    }

    const user = await User.findById(req.user?.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res
      .status(500)
      .json({ message: "Internal server error during password change" });
  }
};
