import express from "express";
import "dotenv/config";
import cors from "cors";

import connectDB from "./config/db.js";

import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import categoryRouter from "./routes/categoryRoute.js";

const app = express();
const port = 5000;

app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://food-delivery-web-logic-lords.vercel.app",
      "https://food-delivery-web-olive-eight.vercel.app",
    ],
  }),
);

app.use("/api/food", foodRouter);
app.use("/images", express.static("uploads"));
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/category", categoryRouter);

app.get("/", (req, res) => {
  res.send("API Working");
});

const startServer = async () => {
  try {
    await connectDB();

    app.listen(port, () => {
      console.log(`Server Started on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
  }
};

startServer();
