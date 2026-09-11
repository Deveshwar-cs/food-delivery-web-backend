import express from "express";
import {addFood, listFood, removeFood} from "../controllers/foodController.js";
import upload from "../middleware/upload.js";

const foodRouter = express.Router();

foodRouter.post("/add", upload.single("image"), addFood);
foodRouter.get("/list", listFood);
foodRouter.delete("/remove/:foodId", removeFood);

export default foodRouter;
