// routes/messageRoutes.ts
import { Router } from "express";
import {
  sendMessage,
  getConversation,
  getUserConversations,
  markAsRead,
  deleteMessage,
} from "../controllers/messageController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router();

/**
 * @route   POST /api/v1/messages
 * @desc    Send a new message
 * @access  Private
 */
router.post("/", protect, sendMessage);

/**
 * @route   GET /api/v1/messages/conversation/:userId
 * @desc    Get all messages between logged-in user and another user
 * @access  Private
 */
router.get("/conversation/:userId", protect, getConversation);

/**
 * @route   GET /api/v1/messages
 * @desc    Get all conversations (last message per participant)
 * @access  Private
 */
router.get("/", protect, getUserConversations);

/**
 * @route   PATCH /api/v1/messages/:messageId/read
 * @desc    Mark a message as read
 * @access  Private
 */
router.patch("/:messageId/read", protect, markAsRead);

/**
 * @route   DELETE /api/v1/messages/:messageId
 * @desc    Delete a message
 * @access  Private
 */
router.delete("/:messageId", protect, deleteMessage);

export default router;
