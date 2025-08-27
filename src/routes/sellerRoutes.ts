import { Router } from "express";
import {
  getSellerProfile,
  updateSellerProfile,
  deleteSellerProfile,
} from "../controllers/sellerController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router: Router = Router();

router.get("/get/profile", protect, getSellerProfile);
router.put("/edit/profile", protect, updateSellerProfile);
router.delete("/delete/profile", protect, deleteSellerProfile);

export default router;
