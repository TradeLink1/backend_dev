import { Request, Response } from "express";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import Service from "../models/Service.js";

interface AuthRequestWithFile extends Request {
  user?: {
    _id: string;
    role: string;
  };
  file?: Express.Multer.File;
}

export const createService = async (
  req: AuthRequestWithFile,
  res: Response
) => {
  try {
    // ✅ Authentication + Role check
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    if (req.user.role !== "seller") {
      return res
        .status(403)
        .json({ message: "Only sellers can create services" });
    }

    const { name, price, category, duration, description } = req.body;

    let serviceImgUrl: string | null = null;

    // ✅ Upload file with stream if exists
    if (req.file) {
      serviceImgUrl = await new Promise<string>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "tradelink/services" },
          (error, result) => {
            if (error) {
              reject(error);
            } else if (result) {
              resolve(result.secure_url);
            } else {
              reject(new Error("Cloudinary upload failed with no result"));
            }
          }
        );
        uploadStream.end(req.file!.buffer); // <-- TS now knows req.file exists here
      });
    }

    // ✅ Create service document
    const newService = new Service({
      sellerId: new mongoose.Types.ObjectId(req.user._id),
      name,
      price,
      category,
      duration,
      description,
      serviceImg: serviceImgUrl,
    });

    const savedService = await newService.save();

    res.status(201).json({
      success: true,
      message: "Service created successfully",
      service: savedService,
    });
  } catch (error) {
    console.error("Error creating service:", error);
    res.status(500).json({ message: "Error creating service", error });
  }
};



/*export const createService = async (
  req: AuthRequestWithFile,
  res: Response
) => {
  try {
    // ✅ Ensure the user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // ✅ Ensure the user is a seller
    if (req.user.role !== "seller") {
      return res
        .status(403)
        .json({ message: "Only sellers can create services" });
    }

    const { name, price, category, duration, description } = req.body;

    let serviceImgUrl = null;

    if (req.file) {
      const result = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${req.file.buffer.toString(
          "base64"
        )}`,
        {
          folder: "tradelink/services",
        }
      );
      serviceImgUrl = result.secure_url;
    }

    const newService = new Service({
      sellerId: new mongoose.Types.ObjectId(req.user._id),
      name,
      price,
      category,
      duration,
      description,
      serviceImg: serviceImgUrl,
    });

    const savedService = await newService.save();

    res.status(201).json({
      success: true,
      message: "Service created successfully",
      service: savedService,
    });
  } catch (error) {
    console.error("Error creating service:", error);
    res.status(500).json({ message: "Failed to create service" });
  }
}; */


/**
 * Create a new service (Seller only)
 */
/*export const createService = async (
  req: AuthRequestWithFile,
  res: Response
) => {
  try {
    if (!req.user || req.user.role !== "seller") {
      return res
        .status(403)
        .json({ message: "Only sellers can create services" });
    }

    const { name, price, category, quantity, description } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: "Name and price are required" });
    }

    const parsedPrice = Number(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return res
        .status(400)
        .json({ message: "Price must be a valid positive number" });
    }

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

    let serviceImg = null;
    let serviceImgId = null;
    if (req.file) {
      try {
        const result = await uploadToCloudinary(
          req.file.buffer,
          "tradelink/services"
        );
        serviceImg = result.secure_url;
        serviceImgId = result.public_id; // store Cloudinary ID
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        return res.status(500).json({ message: "Error uploading image" });
      }
    }

    const service = await Service.create({
      sellerId: req.user.id,
      name,
      price: parsedPrice,
      category,
      quantity: quantity ? Number(quantity) : undefined,
      description,
      serviceImg,
      serviceImgId, // keep Cloudinary ID for delete
    });

    return res.status(201).json({
      message: "Service created successfully",
      service,
    });
  } catch (error: any) {
    console.error("Error creating service:", error);
    return res.status(500).json({
      message: "Server error while creating service",
      error: error.message,
    });
  }
}; */

/**
 * Update an existing service (Seller only)
 */
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

    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      return res.status(400).json({ message: "Invalid service ID" });
    }

    if (!name || !price) {
      return res.status(400).json({ message: "Name and price are required" });
    }

    const parsedPrice = Number(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return res
        .status(400)
        .json({ message: "Price must be a valid positive number" });
    }

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

    const existingService = await Service.findOne({
      _id: serviceId,
      sellerId: req.user.id,
    });
    if (!existingService) {
      return res.status(404).json({
        message: "Service not found or you are not authorized to update it",
      });
    }

    let serviceImg = existingService.serviceImg;
    let serviceImgId = existingService.serviceImgId;

    if (req.file) {
      try {
        // delete old image if exists
        if (serviceImgId) {
          await cloudinary.uploader.destroy(serviceImgId);
        }

        const result = await uploadToCloudinary(
          req.file.buffer,
          "tradelink/services"
        );
        serviceImg = result.secure_url;
        serviceImgId = result.public_id;
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        return res.status(500).json({ message: "Error uploading image" });
      }
    }

    const updatedService = await Service.findOneAndUpdate(
      { _id: serviceId, sellerId: req.user.id },
      {
        name,
        price: parsedPrice,
        category,
        quantity: quantity ? Number(quantity) : undefined,
        description,
        serviceImg,
        serviceImgId,
      },
      { new: true }
    );

    return res.status(200).json({
      message: "Service updated successfully",
      service: updatedService,
    });
  } catch (error: any) {
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
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { serviceId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      return res.status(400).json({ message: "Invalid service ID" });
    }

    const service = await Service.findOne({
      _id: serviceId,
      sellerId: req.user.id,
    });
    if (!service) {
      return res.status(404).json({
        message: "Service not found or you are not authorized to delete it",
      });
    }

    // delete image from Cloudinary
    if (service.serviceImgId) {
      try {
        await cloudinary.uploader.destroy(service.serviceImgId);
      } catch (uploadError) {
        console.error("Cloudinary delete error:", uploadError);
      }
    }

    await Service.deleteOne({ _id: serviceId });

    return res.status(200).json({ message: "Service deleted successfully" });
  } catch (error: any) {
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
  } catch (error: any) {
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
      query.name = { $regex: search, $options: "i" };
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

    const services = await Service.find(query).populate(
      "sellerId",
      "name email"
    );

    return res.status(200).json({
      message: "Services retrieved successfully",
      services,
    });
  } catch (error: any) {
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
  } catch (error: any) {
    console.error("Error fetching service:", error);
    return res.status(500).json({
      message: "Server error while fetching service",
      error: error.message,
    });
  }
};
