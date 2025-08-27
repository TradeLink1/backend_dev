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

const router = Router();


// ---------------- SELLER ROUTES ----------------
router.post("/create", protect, createProduct); // Create new product
router.put("/edit/:productId", protect, updateProduct); // Update product
router.delete("delete//:productId", protect, deleteProduct); // Delete product
router.get("/seller/:sellerId", getSellerProducts); // Get products for a specific seller

// ---------------- USER ROUTES ----------------
router.get("/get/all", getAllProducts); // Get all products (filterable)
router.get("/get/by/:productId", getProductById); // Get single product by ID
router.get("/get/user/:userId", getProductsByUser)

export default router;
