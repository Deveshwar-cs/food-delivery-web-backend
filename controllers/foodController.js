import foodModel from "../models/foodModel.js";
import fs from "fs";
import cloudinary from "../config/cloudinary.js";

export const addFood = async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: "Image is Required!",
      });
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "Products",
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        },
      );
      stream.end(req.file.buffer);
    });
    const food = new foodModel({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      image: result.secure_url,
    });
    await food.save();
    res.json({success: true, message: "food Added"});
  } catch (error) {
    console.log(error.message);
    res.status(500).json({message: error.message});
  }
};

export const listFood = async (req, res) => {
  try {
    const foods = await foodModel.find({});
    res.json({success: true, data: foods});
  } catch (error) {
    console.log(error);
    res.status(500).json({message: error.message});
  }
};

export const removeFood = async (req, res) => {
  try {
    const food = await foodModel.findById(req.params.foodId);

    if (!food) {
      return res.json({success: false, message: "Food not found"});
    }
    fs.unlink(`uploads/${food.image}`, (err) => {
      if (err) console.log(err);
    });

    await foodModel.findByIdAndDelete(req.params.foodId);
    res.json({success: true, message: "Food Removed"});
  } catch (error) {
    console.log(error);
    res.json({success: false, message: error});
  }
};
