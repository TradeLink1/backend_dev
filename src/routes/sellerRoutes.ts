import { Router } from "express";
import {
  getSellerProfile,
  updateSellerProfile,
  deleteSellerProfile,
  uploadSellerLogo,
  getAllSellers,
  searchSellers,
} from "../controllers/sellerController.js";
import { protect } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/upload.js";

const router: Router = Router();

router.get("/profile", protect, getSellerProfile);
router.put("/profile", protect, updateSellerProfile);
router.post("/profile/logo", protect, upload.single("logo"), uploadSellerLogo);

router.delete("/profile", protect, deleteSellerProfile);

router.get("/", protect, getAllSellers);
router.get("/search", protect, searchSellers);

export default router;
