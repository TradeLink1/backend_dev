import { Router } from "express";
import {
  getSellerProfile,
  updateSellerProfile,
  deleteSellerProfile,
} from "../controllers/sellerController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router: Router = Router();

router.get("/profile", protect, getSellerProfile);
router.put("/profile", protect, updateSellerProfile);
router.delete("/profile", protect, deleteSellerProfile);

export default router;
