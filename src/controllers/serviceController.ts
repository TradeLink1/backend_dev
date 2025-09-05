import { Request, Response } from "express";
import Service, { IServices } from "../models/serviceModel";
import asyncHandler from "express-async-handler";
import { Types } from "mongoose";
import cloudinary from "../config/cloudinary";
import { UploadedFile } from "express-fileupload";

// Interface for request with user (from auth middleware)
interface AuthRequest extends Request {
  user?: { _id: Types.ObjectId };
}

// Create a new service
export const createService = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, price, category, quantity, description } = req.body;
  const sellerId = req.user?._id;

  if (!sellerId) {
    res.status(401);
    throw new Error("User not authenticated");
  }

  if (!name || !price) {
    res.status(400);
    throw new Error("Name and price are required");
  }

  let serviceImg: string | undefined;
  let serviceImgId: string | undefined;

  // Handle image upload if present
  if (req.files && req.files.serviceImg) {
    const file = req.files.serviceImg as UploadedFile;
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: "services",
    });
    serviceImg = result.secure_url;
    serviceImgId = result.public_id;
  }

  const service = await Service.create({
    sellerId,
    name,
    price: Number(price),
    category,
    quantity: quantity ? Number(quantity) : undefined,
    description,
    serviceImg,
    serviceImgId,
  });

  res.status(201).json({
    success: true,
    data: service,
  });
});

// Get all services with filtering and searching
export const getAllServices = asyncHandler(async (req: Request, res: Response) => {
  const { category, search, minPrice, maxPrice } = req.query;

  const query: any = {};

  if (category) query.category = category;
  if (search) query.name = { $regex: search, $options: "i" };
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  const services = await Service.find(query).populate("sellerId", "name email");
  res.json({
    success: true,
    data: services,
  });
});

// Get single service by ID
export const getServiceById = asyncHandler(async (req: Request, res: Response) => {
  const service = await Service.findById(req.params.serviceId).populate(
    "sellerId",
    "name email"
  );

  if (!service) {
    res.status(404);
    throw new Error("Service not found");
  }

  res.json({
    success: true,
    data: service,
  });
});

// Update a service
export const updateService = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { serviceId } = req.params;
  const { name, price, category, quantity, description } = req.body;
  const sellerId = req.user?._id;

  const service = await Service.findById(serviceId);

  if (!service) {
    res.status(404);
    throw new Error("Service not found");
  }

  if (service.sellerId.toString() !== sellerId?.toString()) {
    res.status(403);
    throw new Error("Not authorized to update this service");
  }

  // Handle image update if present
  let serviceImg: string | undefined = service.serviceImg;
  let serviceImgId: string | undefined = service.serviceImgId;

  if (req.files && req.files.serviceImg) {
    const file = req.files.serviceImg as UploadedFile;
    
    // Delete old image from Cloudinary if exists
    if (service.serviceImgId) {
      await cloudinary.uploader.destroy(service.serviceImgId);
    }

    // Upload new image
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: "services",
    });
    serviceImg = result.secure_url;
    serviceImgId = result.public_id;
  }

  // Update service fields
  service.name = name || service.name;
  service.price = price ? Number(price) : service.price;
  service.category = category || service.category;
  service.quantity = quantity ? Number(quantity) : service.quantity;
  service.description = description || service.description;
  service.serviceImg = serviceImg;
  service.serviceImgId = serviceImgId;

  const updatedService = await service.save();

  res.json({
    success: true,
    data: updatedService,
  });
});

// Delete a service
export const deleteService = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { serviceId } = req.params;
  const sellerId = req.user?._id;

  const service = await Service.findById(serviceId);

  if (!service) {
    res.status(404);
    throw new Error("Service not found");
  }

  if (service.sellerId.toString() !== sellerId?.toString()) {
    res.status(403);
    throw new Error("Not authorized to delete this service");
  }

  // Delete image from Cloudinary if exists
  if (service.serviceImgId) {
    await cloudinary.uploader.destroy(service.serviceImgId);
  }

  await service.remove();

  res.json({
    success: true,
    message: "Service deleted successfully",
  });
});

// Get all services by a specific seller
export const getSellerServices = asyncHandler(async (req: Request, res: Response) => {
  const services = await Service.find({ sellerId: req.params.sellerId }).populate(
    "sellerId",
    "name email"
  );

  res.json({
    success: true,
    data: services,
  });
});
