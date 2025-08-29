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

export const uploadSellerLogo = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const logoPath = `uploads/logos/${req.file.filename}`;

    const seller = await Seller.findOneAndUpdate(
      { userId: req.user?.id },
      { logo: logoPath, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate("userId", "name email");

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    res.status(200).json({
      message: "Seller logo updated successfully",
      logoUrl: logoPath,
      seller,
    });
  } catch (error) {
    console.error("Error uploading logo:", error);
    res.status(400).json({ message: "Server error" });
  }
};

export const getAllSellers = async (req: AuthRequest, res: Response) => {
  try {
    const sellers = await Seller.find().populate("userId", "name email");

    if (!sellers.length) {
      return res.status(404).json({ message: "No sellers found" });
    }

    res.status(200).json({
      message: "Sellers retrieved successfully",
      sellers,
    });
  } catch (error) {
    console.error("Error retrieving sellers:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const searchSellers = async (req: AuthRequest, res: Response) => {
  try {
    const { query, location, category, topRated } = req.query;

    // Build filter object dynamically
    const filter: any = {};

    if (query && typeof query === "string") {
      filter.storeName = { $regex: query, $options: "i" };
    }

    if (location && typeof location === "string") {
      filter.location = { $regex: location, $options: "i" }; // Assuming Seller has `location`
    }

    if (category && typeof category === "string") {
      filter.category = { $regex: category, $options: "i" }; // Assuming Seller has `category`
    }

    // Base query
    let sellersQuery = Seller.find(filter).populate("userId", "name email");

    // If topRated flag is set, sort by rating
    if (topRated === "true") {
      sellersQuery = sellersQuery.sort({ rating: -1 }); // Assuming Seller has `rating`
    }

    const sellers = await sellersQuery;

    if (!sellers.length) {
      return res.status(404).json({ message: "No sellers found matching criteria" });
    }

    res.status(200).json({
      message: "Sellers retrieved successfully",
      sellers,
    });
  } catch (error) {
    console.error("Error searching sellers:", error);
    res.status(500).json({ message: "Server error" });
  }
};
