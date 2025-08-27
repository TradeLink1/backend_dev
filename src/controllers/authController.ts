import { Request, Response } from "express";
import User from "../models/User.js";
import Seller from "../models/Seller.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const register = async (req: AuthRequest, res: Response) => {
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

    if (
      role === "seller" &&
      !storeName
      // (!storeName || !location || !location.address || !location.coordinates)
    ) {
      return res.status(400).json({
        message: "Store name is required for seller",
      });
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
    if (role === "seller" && storeName) {
      seller = new Seller({
        userId: user._id,
        storeName,
        description: description || "No description provided",
        location: location
          ? {
              address: location.address,
              coordinates: location.coordinates || [0, 0],
            }
          : undefined,
        phone: phone || "",
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

    const successMessage =
      role === "seller"
        ? `${seller?.storeName} registered successfully!`
        : `${user.name} registered successfully!`;

    res.status(201).json({
      message: successMessage,
      token,
      userId: user._id,
      sellerId: seller ? seller._id : undefined,
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({
      message: "Internal server error during registration",
      error:
        process.env.NODE_ENV === "development" && error instanceof Error
          ? error.message
          : undefined,
    });
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

    const { name, role } = user;

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "8h",
      }
    );

    res
      .status(200)
      .cookie("Authorization", "Bearer " + token, {
        expires: new Date(Date.now() + 8 * 3600000),
        httpOnly: process.env.NODE_ENV === "production",
        secure: process.env.NODE_ENV === "production",
      })
      .json({
        message: "Login successful",
        token,
        userId: user._id,
        role,
        name,
      });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Internal server error during login" });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    res
      .clearCookie("Authorization", {
        httpOnly: process.env.NODE_ENV === "production",
        secure: process.env.NODE_ENV === "production",
      })
      .json({ message: "logout successful", success: true });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Server error during logout" });
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

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");

    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000);

    await user.save({ validateBeforeSave: false });

    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/reset-password/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested a password reset. Please click the following link to reset your password:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`;

    await sendEmail({
      email: user.email,
      subject: "TradeLink Password Reset",
      message,
    });

    res
      .status(200)
      .json({ message: "Email sent with password reset instructions" });
  } catch (error) {
    console.error("Error sending password reset email:", error);
    res.status(500).json({
      message: "Internal server error during password reset request",
    });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ message: "Token and new password are required" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res
      .status(500)
      .json({ message: "Internal server error during password reset" });
  }
};
