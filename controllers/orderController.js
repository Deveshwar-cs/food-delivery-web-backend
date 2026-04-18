import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import razorpay from "../config/razorpay.js";
import crypto from "crypto";

// placing user order for frontend
export const placeOrder = async (req, res) => {
  try {
    // Saver order in DB
    const newOrder = new orderModel({
      userId: req.user,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
    });
    await newOrder.save();

    // clear user cart
    await userModel.findByIdAndUpdate(req.user, {cartData: {}});

    // Create Razorpay Order
    const options = {
      amount: req.body.amount * 100,
      currency: "INR",
      receipt: "order_" + newOrder._id,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // send order to frontend
    res.status(200).json({
      success: true,
      orderId: newOrder._id,
      razorpayOrder,
      key: process.env.RAZORPAY_KEY_ID, // ✅ send key
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({message: error.message});
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const {razorpay_order_id, razorpay_payment_id, razorpay_signature} =
      req.body;

    // 🔥 Step 1: Create body string
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    // 🔥 Step 2: Generate expected signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    // 🔥 Step 3: Compare signatures
    if (expectedSignature === razorpay_signature) {
      res.json({success: true, message: "Payment Verified"});
    } else {
      res.json({success: false, message: "Invalid Signature"});
    }
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

export const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({userId: req.user});
    res.status(200).json({success: true, data: orders});
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

// Listing orders for admin panel
export const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.json({success: true, data: orders});
  } catch (error) {
    console.log(error);
    res.json({success: false, message: "Error"});
  }
};

export const updateStatus = async (req, res) => {
  try {
    await orderModel.findByIdAndUpdate(req.body.orderId, {
      status: req.body.status,
    });
    res.json({success: true, message: "Status Updated"});
  } catch (error) {
    res.status(500).json({message: error});
  }
};
