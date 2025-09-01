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
import { productUpload } from "../middlewares/productUpload.js"; // Import the multer middleware

const router = Router();

// Use the productUpload middleware here
router.post("/create", protect, productUpload.single("image"), createProduct);

router
  .route("/:productId")
  .put(protect, updateProduct)
  .delete(protect, deleteProduct);

router.get("/seller/:sellerId", getSellerProducts);
router.get("/user/:userId", getProductsByUser);
router.get("/", getAllProducts);
router.get("/:productId", getProductById);

export default router;
