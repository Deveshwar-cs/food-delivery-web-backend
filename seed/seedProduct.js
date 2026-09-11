import {fileURLToPath} from "url";
import fs from "fs/promises";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cloudinary from "../config/cloudinary.js";
import foodModel from "../models/foodModel.js";
import categoryModel from "../models/categoryModel.js";

dotenv.config();
// Get current file directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const productsPath = path.join(__dirname, "products.json");
const imagesPath = path.join(__dirname, "images");

const seedProducts = async () => {
  try {
    console.log(process.env.MONGO_URI);
    // Connect MongoDB
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    // Read products.json
    const fileData = await fs.readFile(productsPath, "utf-8");

    const products = JSON.parse(fileData);

    console.log(`Found ${products.length} category`);

    // Upload each product
    for (let i = 0; i < products.length; i++) {
      const product = products[i];

      console.log(
        `\nProcessing ${i + 1}/${products.length}: ${product.menu_name}`,
      );

      // Local image path
      const imagePath = path.join(imagesPath, `${product.menu_image}.png`);

      // Upload image to Cloudinary
      console.log("Uploading image...");

      const uploadResult = await cloudinary.uploader.upload(imagePath, {
        folder: "food-delivery/menu",
      });

      console.log("Image uploaded");

      // Save product in MongoDB
      const savedProduct = await categoryModel.create({
        name: product.menu_name,
        image: uploadResult.secure_url,
      });

      console.log(`✓ Product saved: ${savedProduct.name}`);
    }

    console.log("\n================================");
    console.log("All products imported successfully!");
    console.log("================================");
  } catch (error) {
    console.error("\nSeed error:", error);
  } finally {
    await mongoose.connection.close();

    console.log("MongoDB connection closed");
  }
};

seedProducts();
