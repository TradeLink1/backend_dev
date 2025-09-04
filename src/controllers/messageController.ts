// controllers/messageController.ts
import { Request, Response } from "express";
import mongoose from "mongoose";
import Message from "../models/Message.js";
import User from "../models/User.js"; // Assuming User model exists

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

// ------------------------------
// Send a message
// ------------------------------
export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { recipientId, content } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!recipientId || !mongoose.Types.ObjectId.isValid(recipientId)) {
      return res.status(400).json({ message: "Invalid recipient ID" });
    }

    if (!content || content.trim() === "") {
      return res.status(400).json({ message: "Message content is required" });
    }

    const message = await Message.create({
      senderId: req.user.id,
      recipientId,
      content: content.trim(),
    });

    // Optional: populate sender info (for frontend chat display)
    await message.populate("senderId", "username email profilePicture");

    res.status(201).json({
      message: "Message sent successfully",
      data: message,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------------------
// Get conversation between two users
// ------------------------------
export const getConversation = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const messages = await Message.find({
      $or: [
        { senderId: req.user.id, recipientId: userId },
        { senderId: userId, recipientId: req.user.id },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("senderId", "username email profilePicture")
      .populate("recipientId", "username email profilePicture");

    res.status(200).json({
      message: "Conversation retrieved successfully",
      data: messages,
    });
  } catch (error) {
    console.error("Error retrieving conversation:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------------------
// Get all user conversations (last message per participant)
// ------------------------------
export const getUserConversations = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = new mongoose.Types.ObjectId(req.user.id);

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: userId }, { recipientId: userId }],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [{ $eq: ["$senderId", userId] }, "$recipientId", "$senderId"],
          },
          lastMessage: { $first: "$$ROOT" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "participant",
        },
      },
      { $unwind: "$participant" },
      {
        $project: {
          _id: "$lastMessage._id",
          content: "$lastMessage.content",
          senderId: "$lastMessage.senderId",
          recipientId: "$lastMessage.recipientId",
          createdAt: "$lastMessage.createdAt",
          read: "$lastMessage.read",
          participant: {
            _id: "$participant._id",
            username: "$participant.username",
            email: "$participant.email",
            profilePicture: "$participant.profilePicture",
          },
        },
      },
    ]);

    res.status(200).json({
      message: "Conversations retrieved successfully",
      data: conversations,
    });
  } catch (error) {
    console.error("Error retrieving conversations:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------------------
// Mark a message as read
// ------------------------------
export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { messageId } = req.params;

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({ message: "Invalid message ID" });
    }

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (message.recipientId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You are not authorized to perform this action" });
    }

    message.read = true;
    await message.save();

    res.status(200).json({
      message: "Message marked as read",
      data: message,
    });
  } catch (error) {
    console.error("Error marking message as read:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------------------
// Delete a message
// ------------------------------
export const deleteMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { messageId } = req.params;

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({ message: "Invalid message ID" });
    }

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (
      message.senderId.toString() !== req.user.id &&
      message.recipientId.toString() !== req.user.id
    ) {
      return res
        .status(403)
        .json({ message: "You are not authorized to perform this action" });
    }

    await message.deleteOne();

    res.status(200).json({
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ message: "Server error" });
  }
};
