// routes/userRoutes.ts
import { Router } from "express";
import {
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
  changePassword,
} from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router: Router = Router();

router.get("/get/profile", protect, getUserProfile);
router.put("/edit/profile", protect, updateUserProfile);
router.delete("/delete/profile", protect, deleteUserProfile);
router.put("/change-password", protect, changePassword);

export default router;
