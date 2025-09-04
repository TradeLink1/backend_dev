// controllers/serviceController.ts
import { Request, Response } from "express";
import Service from "../models/Service.js";
import mongoose from "mongoose";
import { cloudinary } from "../config/cloudinary.js";

interface AuthRequestWithFile extends Request {
  user?: {
    id: string;
    role: string;
  };
  file?: Express.Multer.File;
}

export const createService = async (
  req: AuthRequestWithFile,
  res: Response
) => {
  try {
    if (!req.user || req.user.role !== "seller") {
      return res
        .status(403)
        .json({ message: "Only sellers can post services" });
    }

    const { name, price, category, quantity, description } = req.body;
    let serviceImg = null;

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "tradelink/services",
      });
      serviceImg = result.secure_url;
    }

    const service = await Service.create({
      sellerId: req.user.id,
      name,
      price,
      category,
      quantity,
      description,
      serviceImg,
    });

    res.status(201).json({
      message: "Service created successfully",
      service,
    });
  } catch (error) {
    console.error("Error creating service:", error);
    res.status(500).json({ message: "Error creating service", error });
  }
};

export const updateService = async (
  req: AuthRequestWithFile,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { serviceId } = req.params;
    const { name, price, category, quantity, description } = req.body;
    let serviceImg = null;

    if (req.file) {
      const oldService = await Service.findOne({ _id: serviceId });
      if (oldService && oldService.serviceImg) {
        let imgUrl = Array.isArray(oldService.serviceImg)
          ? oldService.serviceImg.join("/")
          : oldService.serviceImg;
        const publicId = imgUrl.split("/").pop()?.split(".")[0];
        if (publicId) {
          await cloudinary.uploader.destroy(`tradelink/services/${publicId}`);
        }
      }

      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "tradelink/services",
      });
      serviceImg = result.secure_url;
    }

    // Update the service
    const service = await Service.findOneAndUpdate(
      { _id: serviceId, sellerId: req.user.id },
      {
        name,
        price,
        category,
        quantity,
        description,
        serviceImg: serviceImg || req.body.serviceImg,
      },
      { new: true }
    );

    if (!service) return res.status(404).json({ message: "Service not found" });

    res.json(service);
  } catch (error) {
    res.status(500).json({ message: "Error updating service", error });
  }
};

export const deleteService = async (
  req: AuthRequestWithFile,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { serviceId } = req.params;

    const service = await Service.findOneAndDelete({
      _id: serviceId,
      sellerId: req.user.id,
    });

    if (!service) return res.status(404).json({ message: "Service not found" });

    if (service.serviceImg) {
      const imgUrl = Array.isArray(service.serviceImg)
        ? service.serviceImg.join("/")
        : service.serviceImg;
      const lastSegment = imgUrl.split("/").pop();
      const publicId = lastSegment ? lastSegment.split(".")[0] : undefined;
      if (publicId) {
        await cloudinary.uploader.destroy(`tradelink/services/${publicId}`);
      }
    }

    res.json({ message: "Service deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting service", error });
  }
};

export const getSellerServices = async (req: Request, res: Response) => {
  try {
    const { sellerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
      return res.status(400).json({ message: "Invalid seller ID format" });
    }

    const services = await Service.find({ sellerId });

    res.status(200).json({ services });
  } catch (error) {
    res.status(500).json({ message: "Error fetching seller services", error });
  }
};

/**
 * USER: Get All Services with filtering, searching, and pricing
 */
export const getAllServices = async (req: Request, res: Response) => {
  try {
    const { category, search, minPrice, maxPrice } = req.query;
    const query: any = {};

    if (category) query.category = category;
    if (search) query.name = { $regex: search, $options: "i" };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const services = await Service.find(query);
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: "Error fetching services", error });
  }
};

/**
 * USER: Get Service by ID
 */
export const getServiceById = async (req: Request, res: Response) => {
  try {
    const { serviceId } = req.params;
    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: "Service not found" });
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: "Error fetching service", error });
  }
};
