import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },

  items: {
    type: Array,
    required: true,
  },

  amount: {
    type: Number,
    required: true,
  },

  address: {
    type: Object,
    required: true,
  },

  status: {
    type: String,
    enum: ["Food Processing", "Out for Delivery", "Delivered"],
    default: "Food Processing",
  },

  date: {
    type: Date,
    default: Date.now,
  },

  payment: {
    type: Boolean,
    default: false,
  },

  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending",
  },

  razorpayOrderId: {
    type: String,
    default: null,
  },
});

const orderModel =
  mongoose.models.order || mongoose.model("order", orderSchema);

export default orderModel;
