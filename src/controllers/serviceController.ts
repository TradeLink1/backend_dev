import { Request, Response } from "express";
import Service from "../models/Service.js";
import mongoose from "mongoose";

/**
 * Create a new service
 */
export const createService = async (req: Request, res: Response) => {
  try {
    const { name, price, category, quantity, description, userId } = req.body;

    // Assume seller is authenticated user
    const sellerId = (req as any).user?._id;  

    if (!sellerId) {
      return res.status(401).json({ message: "Unauthorized: Seller not found" });
    }

    const newService = new Service({
      sellerId,
      userId,
      name,
      price,
      category,
      quantity,
      description,
    });

    const savedService = await newService.save();
    res.status(201).json(savedService);
  } catch (error) {
    res.status(500).json({ message: "Error creating service", error });
  }
};

/**
 * Get all services
 */
export const getServices = async (req: Request, res: Response) => {
  try {
    const services = await Service.find().populate("sellerId userId", "name email");
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: "Error fetching services", error });
  }
};

/**
 * Get service by ID
 */
export const getServiceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid service ID" });
    }

    const service = await Service.findById(id).populate("sellerId userId", "name email");
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ message: "Error fetching service", error });
  }
};

/**
 * Update a service
 */
export const updateService = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid service ID" });
    }

    const updatedService = await Service.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedService) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.status(200).json(updatedService);
  } catch (error) {
    res.status(500).json({ message: "Error updating service", error });
  }
};

/**
 * Delete a service
 */
export const deleteService = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid service ID" });
    }

    const deletedService = await Service.findByIdAndDelete(id);
    if (!deletedService) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.status(200).json({ message: "Service deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting service", error });
  }
};

/**
 * Get services by Seller
 */
export const getServicesBySeller = async (req: Request, res: Response) => {
  try {
    const { sellerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
      return res.status(400).json({ message: "Invalid seller ID" });
    }

    const services = await Service.find({ sellerId }).populate("userId", "name email");
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: "Error fetching seller services", error });
  }
};

/**
 * Get services by User
 */
export const getServicesByUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const services = await Service.find({ userId }).populate("sellerId", "name email");
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user services", error });
  }
};
