import mongoose, { Document } from "mongoose";

export interface IProducts extends Document {
  sellerId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  price: number; 
  category:
    | "Groceries & Essentials"
    | "Fresh & Perishables"
    | "Fashion & Clothing"
    | "Home & Kitchen"
    | "Building Materials & Hardware"
    | "Electronics & Gadgets"
    | "Automobile & Parts"
    | "Health & Beauty"
    | "Toys, Baby & Kids"
    | "Sports & Fitness"
    | "Books, Stationery & Office";
  quantity: number;
  description: string;
}

const productSchema = new mongoose.Schema<IProducts>(
  {
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: {
      type: String,
      enum: [
        "Groceries & Essentials",
        "Fresh & Perishables",
        "Fashion & Clothing",
        "Home & Kitchen",
        "Building Materials & Hardware",
        "Electronics & Gadgets",
        "Automobile & Parts",
        "Health & Beauty",
        "Toys, Baby & Kids",
        "Sports & Fitness",
        "Books, Stationery & Office"
      ],
      required: true,
    },
    quantity: { type: Number, required: true },
    description: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IProducts>("Product", productSchema);
