import mongoose, { Document } from "mongoose";

export interface IServices extends Document {
  sellerId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  price: number; 
  category:
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
  quantity: number;
  description: string;
}

const serviceSchema = new mongoose.Schema<IServices>(
  {
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
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
          "Other"
      ],
      required: true,
    },
    quantity: { type: Number, required: true },
    description: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IServices>("Service", serviceSchema);
