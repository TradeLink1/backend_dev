import { Request, Response } from "express";
import Product from "../models/Product.js";
import mongoose from "mongoose";

interface AuthRequestWithFile extends Request {
  user?: {
    id: string;
    role: string;
  };
  file?: Express.Multer.File;
}

// SELLER: Create Product
export const createProduct = async (
  req: AuthRequestWithFile,
  res: Response
) => {
  try {
    if (!req.user || req.user.role !== "seller") {
      return res
        .status(403)
        .json({ message: "Only sellers can post products" });
    }

    const { name, price, category, quantity, description } = req.body;
    let productImg = null;

    if (req.file) {
      productImg = `/uploads/products/${req.file.filename}`;
    }

    const product = await Product.create({
      sellerId: req.user.id,
      name,
      price,
      category,
      quantity,
      description,
      productImg,
    });

    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Error creating product", error });
  }
};

// SELLER: Update Product
export const updateProduct = async (
  req: AuthRequestWithFile,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { productId } = req.params;

    const product = await Product.findOneAndUpdate(
      { _id: productId, sellerId: req.user.id },
      req.body,
      { new: true }
    );

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Error updating product", error });
  }
};

// SELLER: Delete Product
export const deleteProduct = async (
  req: AuthRequestWithFile,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { productId } = req.params;

    const product = await Product.findOneAndDelete({
      _id: productId,
      sellerId: req.user.id,
    });

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product", error });
  }
};

// SELLER: Get All Products of a Seller
export const getSellerProducts = async (req: Request, res: Response) => {
  try {
    const { sellerId } = req.params;
    const products = await Product.find({ sellerId });
    // CORRECTED: Wrap the products array in a JSON object
    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({ message: "Error fetching seller products", error });
  }
};

// USER: Get All Products
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const { category, search, minPrice, maxPrice } = req.query;
    const query: any = {};

    if (category) query.category = category;
    if (search) query.name = { $regex: search, $options: "i" };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(query);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products", error });
  }
};

// USER: Get Product by ID
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Error fetching product", error });
  }
};
