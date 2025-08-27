import { Router } from "express";
import {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService,
  getServicesBySeller,
  getServicesByUser,
} from "../controllers/serviceController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router();

// ---------------- SELLER ROUTES ----------------
router.post("/create", protect, createService); // Create a new service
router.put("/edit/:id", protect, updateService); // Update a service
router.delete("/delete/:id", protect, deleteService); // Delete a service
router.get("/seller/:sellerId", getServicesBySeller); // Get services by seller

// ---------------- USER ROUTES ----------------
router.get("/all", getServices); // Get all services
router.get("/get/by/:id", getServiceById); // Get single service by ID
router.get("/get/user/:userId", getServicesByUser); // Get services by user

export default router;
