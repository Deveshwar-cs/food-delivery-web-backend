import cloudinary from "../config/cloudinary.js";
import categoryModel from "../models/categoryModel.js";

export const addCategory = async (req, res) => {
  try {
    const {name} = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image is required",
      });
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "categories",
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

    const category = categoryModel.create({
      name: name,
      image: result.secure_url,
    });

    res.status(201).json({
      success: true,
      message: "Category added successfully",
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add category",
      error: error.message,
    });
  }
};

export const getCategory = async (req, res) => {
  try {
    const categories = await categoryModel.find({});
    if (!categories) {
      res.status(400).json({
        success: false,
        message: "Category not found!",
      });
    }
    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch category",
      error: error.message,
    });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const {id} = req.params;
    console.log(id);
    const category = await categoryModel.findByIdAndDelete({_id: id});

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found!",
      });
    }

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete category error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete category",
    });
  }
};
