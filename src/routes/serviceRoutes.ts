// routes/serviceRoutes.ts
import { Router } from "express";
import {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
  getSellerServices,
} from "../controllers/serviceController.js";
import { protect } from "../middlewares/authMiddleware.js";
import uploadServiceImages from "../middlewares/servicesUpload.js";

const router = Router();

// ---------------- SELLER ROUTES ----------------
// Create a new service with optional image upload (requires seller role)
router.post(
  "/create",
  protect,
  uploadServiceImages, // Expects file in 'serviceImg' field
  createService
);

// Update an existing service with optional new image upload (requires seller role)
router.put(
  "/edit/:serviceId",
  protect,
  uploadServiceImages, // Expects file in 'serviceImg' field
  updateService
);

// Delete a service and its associated image (requires seller role)
router.delete("/delete/:serviceId", protect, deleteService);

// Get all services by a specific seller (public, no auth required)
router.get("/seller/:sellerId", getSellerServices);

// ---------------- USER ROUTES ----------------
// Get all services with optional filtering and searching (public)
router.get("/all", getAllServices);

// Get a single service by ID (public)
router.get("/get/by/:serviceId", getServiceById);

export default router;
