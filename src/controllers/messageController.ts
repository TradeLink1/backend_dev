import { Request, Response } from "express";
import mongoose from "mongoose";
import Message from "../models/Message.js";

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

// Send a message
export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { senderId, recipientId, content } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const message = await Message.create({
      senderId: req.user.id,
      recipientId: req.body.recipientId,
      content,
    });

    res.status(201).json({
      message: "Message sent successfully",
      data: message,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all messages between logged-in user and another user
export const getConversation = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params; 

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const messages = await Message.find({
      $or: [
        { senderId: req.user.id, recipientId: userId },
        { senderId: userId, recipientId: req.user.id },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json({
      message: "Conversation retrieved successfully",
      data: messages,
    });
  } catch (error) {
    console.error("Error retrieving conversation:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all user conversations (last message per participant)
export const getUserConversations = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: new mongoose.Types.ObjectId(req.user.id) },
            { recipientId: new mongoose.Types.ObjectId(req.user.id) },
          ],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$senderId", new mongoose.Types.ObjectId(req.user.id)] },
              "$recipientId",
              "$senderId",
            ],
          },
          lastMessage: { $first: "$$ROOT" },
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

// Mark a message as read
export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findByIdAndUpdate(
      messageId,
      { read: true },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    res.status(200).json({
      message: "Message marked as read",
      data: message,
    });
  } catch (error) {
    console.error("Error marking message as read:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a message
export const deleteMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findByIdAndDelete(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    res.status(200).json({
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ message: "Server error" });
  }
};
