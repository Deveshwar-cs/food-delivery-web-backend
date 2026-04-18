import express from "express";
import authMiddleware from "../middleware/auth.js";
import {
  listOrders,
  placeOrder,
  updateStatus,
  userOrders,
  verifyPayment,
} from "../controllers/orderController.js";

const orderRouter = express.Router();

orderRouter.post("/place", authMiddleware, placeOrder);
orderRouter.post("/verify", authMiddleware, verifyPayment);
orderRouter.get("/userorders", authMiddleware, userOrders);
orderRouter.get("/list", listOrders);
orderRouter.put("/updateStatus", updateStatus);

// food processing, out for deliver ,delivered

export default orderRouter;
