import foodModel from "../models/foodModel.js";
import fs from "fs";

export const addFood = async (req, res) => {
  try {
    let image_filename = `${req.file.filename}`;

    const food = new foodModel({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      image: image_filename,
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
