import express from "express";
import {
  addCategory,
  deleteCategory,
  getCategory,
} from "../controllers/categoryController.js";
import upload from "../middleware/upload.js";

const categoryRouter = express.Router();

categoryRouter.post("/", upload.single("image"), addCategory);
categoryRouter.delete("/delete/:id", deleteCategory);
categoryRouter.get("/get", getCategory);

export default categoryRouter;
