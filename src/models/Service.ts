// models/Service.ts
import mongoose, { Document } from "mongoose";

// Corrected interface to match the schema.
// A service should not belong to a user directly, but a seller.
// The `userId` field might be more appropriate for a separate booking or order model.
export interface IServices extends Document {
  sellerId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  category?:
    | "Hair Stylist"
    | "Fashion Designer"
    | "Caterer"
    | "Plumber"
    | "Mechanic"
    | "Photographer"
    | "Electrician"
    | "Makeup Artist"
    | "Barber"
    | "Cleaner"
    | "Car Wash"
    | "Other";
  quantity?: number;
  description?: string;
  serviceImg?: string; // Corrected to an array of strings
}

const serviceSchema = new mongoose.Schema<IServices>(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: {
      type: String,
      enum: [
        "Hair Stylist",
        "Fashion Designer",
        "Caterer",
        "Plumber",
        "Mechanic",
        "Photographer",
        "Electrician",
        "Makeup Artist",
        "Barber",
        "Cleaner",
        "Car Wash",
        "Other",
      ],
    },
    quantity: { type: Number },
    description: { type: String },
    serviceImg: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IServices>("Service", serviceSchema);
