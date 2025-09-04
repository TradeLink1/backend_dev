// models/Message.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IMessage extends Document {
  senderId: mongoose.Types.ObjectId;
  recipientId: mongoose.Types.ObjectId;
  content: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true, // removes leading/trailing spaces
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // auto-manages createdAt & updatedAt
  }
);

// Optional: index for faster lookups in conversations
messageSchema.index({ senderId: 1, recipientId: 1, createdAt: -1 });

const Message = mongoose.model<IMessage>("Message", messageSchema);

export default Message;
