import { Router } from "express";
import {
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
  changePassword,
} from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router: Router = Router();

router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);
router.delete("/profile", protect, deleteUserProfile);
router.put("/change-password", protect, changePassword);

export default router;
