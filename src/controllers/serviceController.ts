import { Request, Response } from "express";
import mongoose from "mongoose";
import Service from "../models/Service.js";
import path from "path";
import fs from "fs";

interface AuthRequestWithFile extends Request {
  user?: {
    id: string;
    role: string;
  };
  file?: Express.Multer.File;
}

/**
 * Create a new service (Seller only)
 */
export const createService = async (
  req: AuthRequestWithFile,
  res: Response
) => {
  try {
    // Check if user is authenticated and has seller role
    if (!req.user || req.user.role !== "seller") {
      return res
        .status(403)
        .json({ message: "Only sellers can create services" });
    }

    const { name, price, category, quantity, description } = req.body;

    // Validate required fields
    if (!name || !price) {
      return res.status(400).json({ message: "Name and price are required" });
    }

    // Validate price is a positive number
    const parsedPrice = Number(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return res
        .status(400)
        .json({ message: "Price must be a valid positive number" });
    }

    // Validate category if provided
    if (
      category &&
      ![
        "Hair Stylist",
        "Fashion Designer",
        "Caterer",
        "Plumber",
        "Mechanic",
        "Photographer",
        "Electrician",
        "Makeup Artist",
        "Barber",
        "Cleaner",
        "Car Wash",
        "Other",
      ].includes(category)
    ) {
      return res.status(400).json({ message: "Invalid category" });
    }

    // Handle image upload
    let serviceImg = null;
    if (req.file) {
      // Store the relative path to the uploaded file
      serviceImg = `/uploads/${req.file.filename}`;
    }

    // Create service
    const service = await Service.create({
      sellerId: req.user.id,
      name,
      price: parsedPrice,
      category,
      quantity: quantity ? Number(quantity) : undefined,
      description,
      serviceImg,
    });

    return res.status(201).json({
      message: "Service created successfully",
      service,
    });
  } catch (error) {
    console.error("Error creating service:", error);
    return res.status(500).json({
      message: "Server error while creating service",
      error: error.message,
    });
  }
};

/**
 * Update an existing service (Seller only)
 */
export const updateService = async (
  req: AuthRequestWithFile,
  res: Response
) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { serviceId } = req.params;
    const { name, price, category, quantity, description } = req.body;

    // Validate serviceId
    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      return res.status(400).json({ message: "Invalid service ID" });
    }

    // Validate required fields
    if (!name || !price) {
      return res.status(400).json({ message: "Name and price are required" });
    }

    // Validate price
    const parsedPrice = Number(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return res
        .status(400)
        .json({ message: "Price must be a valid positive number" });
    }

    // Validate category if provided
    if (
      category &&
      ![
        "Hair Stylist",
        "Fashion Designer",
        "Caterer",
        "Plumber",
        "Mechanic",
        "Photographer",
        "Electrician",
        "Makeup Artist",
        "Barber",
        "Cleaner",
        "Car Wash",
        "Other",
      ].includes(category)
    ) {
      return res.status(400).json({ message: "Invalid category" });
    }

    // Check if service exists and belongs to the seller
    const existingService = await Service.findOne({
      _id: serviceId,
      sellerId: req.user.id,
    });
    if (!existingService) {
      return res.status(404).json({
        message: "Service not found or you are not authorized to update it",
      });
    }

    // Handle image upload
    let serviceImg = existingService.serviceImg;
    if (req.file) {
      // Delete old image if exists
      if (existingService.serviceImg) {
        const oldImagePath = path.join(
          __dirname,
          "..",
          existingService.serviceImg
        );
        fs.unlink(oldImagePath, (err: NodeJS.ErrnoException | null) => {
          if (err) console.error("Error deleting old image:", err);
        });
      }
      // Store new image path
      serviceImg = `/uploads/${req.file.filename}`;
    }

    // Update service
    const updatedService = await Service.findOneAndUpdate(
      { _id: serviceId, sellerId: req.user.id },
      {
        name,
        price: parsedPrice,
        category,
        quantity: quantity ? Number(quantity) : undefined,
        description,
        serviceImg,
      },
      { new: true }
    );

    return res.status(200).json({
      message: "Service updated successfully",
      service: updatedService,
    });
  } catch (error) {
    console.error("Error updating service:", error);
    return res.status(500).json({
      message: "Server error while updating service",
      error: error.message,
    });
  }
};

/**
 * Delete a service (Seller only)
 */
export const deleteService = async (
  req: AuthRequestWithFile,
  res: Response
) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { serviceId } = req.params;

    // Validate serviceId
    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      return res.status(400).json({ message: "Invalid service ID" });
    }

    // Check if service exists and belongs to the seller
    const service = await Service.findOne({
      _id: serviceId,
      sellerId: req.user.id,
    });
    if (!service) {
      return res.status(404).json({
        message: "Service not found or you are not authorized to delete it",
      });
    }

    

    // Delete service
    await Service.deleteOne({ _id: serviceId });

    return res.status(200).json({ message: "Service deleted successfully" });
  } catch (error) {
    console.error("Error deleting service:", error);
    return res.status(500).json({
      message: "Server error while deleting service",
      error: error.message,
    });
  }
};

/**
 * Get all services by a specific seller
 */
export const getSellerServices = async (req: Request, res: Response) => {
  try {
    const { sellerId } = req.params;

    // Validate sellerId
    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
      return res.status(400).json({ message: "Invalid seller ID" });
    }

    const services = await Service.find({ sellerId }).populate(
      "sellerId",
      "name email"
    );

    return res.status(200).json({
      message: "Services retrieved successfully",
      services,
    });
  } catch (error) {
    console.error("Error fetching seller services:", error);
    return res.status(500).json({
      message: "Server error while fetching seller services",
      error: error.message,
    });
  }
};

/**
 * Get all services with filtering and searching
 */
export const getAllServices = async (req: Request, res: Response) => {
  try {
    const { category, search, minPrice, maxPrice } = req.query;
    const query: any = {};

    // Apply filters
    if (category) {
      if (
        ![
          "Hair Stylist",
          "Fashion Designer",
          "Caterer",
          "Plumber",
          "Mechanic",
          "Photographer",
          "Electrician",
          "Makeup Artist",
          "Barber",
          "Cleaner",
          "Car Wash",
          "Other",
        ].includes(category as string)
      ) {
        return res.status(400).json({ message: "Invalid category" });
      }
      query.category = category;
    }
    if (search) {
      query.name = { $regex: search, $options: "i" }; // Fixed typo: antipsychotics to $options
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) {
        const parsedMinPrice = Number(minPrice);
        if (isNaN(parsedMinPrice) || parsedMinPrice < 0) {
          return res.status(400).json({ message: "Invalid minPrice" });
        }
        query.price.$gte = parsedMinPrice;
      }
      if (maxPrice) {
        const parsedMaxPrice = Number(maxPrice);
        if (isNaN(parsedMaxPrice) || parsedMaxPrice < 0) {
          return res.status(400).json({ message: "Invalid maxPrice" });
        }
        query.price.$lte = parsedMaxPrice;
      }
    }

    // Fetch services and populate sellerId
    const services = await Service.find(query).populate({
      path: "sellerId",
      select: "name email",
      // Allow population even if some sellerId references are invalid
      options: { strictPopulate: false },
    });

    // Log services to debug population
    console.log("Services fetched:", JSON.stringify(services, null, 2));

    return res.status(200).json({
      message: "Services retrieved successfully",
      services,
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    return res.status(500).json({
      message: "Server error while fetching services",
      error: error.message,
    });
  }
};

/**
 * Get a single service by ID
 */
export const getServiceById = async (req: Request, res: Response) => {
  try {
    const { serviceId } = req.params;

    // Validate serviceId
    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      return res.status(400).json({ message: "Invalid service ID" });
    }

    const service = await Service.findById(serviceId).populate(
      "sellerId",
      "name email"
    );
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    return res.status(200).json({
      message: "Service retrieved successfully",
      service,
    });
  } catch (error) {
    console.error("Error fetching service:", error);
    return res.status(500).json({
      message: "Server error while fetching service",
      error: error.message,
    });
  }
};
