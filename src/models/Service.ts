import mongoose, { Document } from "mongoose";

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
  serviceImg?: string; // Cloudinary secure_url
  serviceImgId?: string; // Cloudinary public_id
}

const serviceSchema = new mongoose.Schema<IServices>(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // links to User model
      required: true,
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
    serviceImg: { type: String }, // Cloudinary secure_url
    serviceImgId: { type: String }, // Cloudinary public_id
  },
  { timestamps: true }
);

export default mongoose.model<IServices>("Service", serviceSchema);
