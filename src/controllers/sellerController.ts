import { Request, Response } from "express";
import Seller from "../models/Seller.js";

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const getSellerProfile = async (req: AuthRequest, res: Response) => {
  try {
    const seller = await Seller.findOne({ userId: req.user?.id }).populate(
      "userId",
      "name email"
    );

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    res.status(200).json({
      message: "Seller profile retrieved successfully",
      seller,
    });
  } catch (error) {
    console.error("Error retrieving seller profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateSellerProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { storeName, description, location, phone } = req.body;

    const seller = await Seller.findOneAndUpdate(
      { userId: req.user?.id },
      { storeName, description, location, phone, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate("userId", "name email");

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    res.status(200).json({
      message: "Seller profile updated successfully",
      seller,
    });
  } catch (error) {
    console.error("Error updating seller profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteSellerProfile = async (req: AuthRequest, res: Response) => {
  try {
    const seller = await Seller.findOneAndDelete({ userId: req.user?.id });

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    res.status(200).json({
      message: "Seller profile deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting seller profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};
