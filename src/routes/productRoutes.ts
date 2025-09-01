// src/routes/productRoutes.js (updated)

import { Router } from "express";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getSellerProducts,
  getAllProducts,
  getProductById,
  getProductsByUser,
} from "../controllers/productController.js";
import { protect } from "../middlewares/authMiddleware.js";
// import upload from "../middlewares/upload.js";

const router = Router();

// ---------------- SELLER ROUTES ----------------
// Add the upload middleware here, specifically expecting the 'image' field
router.post("/create", protect, createProduct);
router.put("/edit/:productId", protect, updateProduct);
router.delete("/delete/:productId", protect, deleteProduct); // Fix the delete route
router.get("/seller/:sellerId", getSellerProducts);

// ---------------- USER ROUTES ----------------
router.get("/get/all", getAllProducts);
router.get("/get/by/:productId", getProductById);
router.get("/get/user/:userId", getProductsByUser);

export default router;
