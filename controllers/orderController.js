import orderModel from "../models/orderModel.js";
import razorpay from "../config/razorpay.js";
import crypto from "crypto";
import userModel from "../models/userModel.js";

// ========================================
// PLACE ORDER
// ========================================

export const placeOrder = async (req, res) => {
  try {
    const {items, amount, address} = req.body;

    // ----------------------------------------
    // Check user
    // ----------------------------------------

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    console.log("USER ID:", req.user);

    // ----------------------------------------
    // Check items
    // ----------------------------------------

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    // ----------------------------------------
    // Check amount
    // ----------------------------------------

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    // ----------------------------------------
    // Check address
    // ----------------------------------------

    if (!address) {
      return res.status(400).json({
        success: false,
        message: "Address is required",
      });
    }

    // ----------------------------------------
    // 1. Create Razorpay order
    // ----------------------------------------

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    console.log("RAZORPAY ORDER ID:", razorpayOrder.id);

    // ----------------------------------------
    // 2. Save order in MongoDB
    // ----------------------------------------

    const newOrder = await orderModel.create({
      userId: req.user,
      items,
      amount,
      address,

      payment: false,
      paymentStatus: "pending",

      razorpayOrderId: razorpayOrder.id,

      status: "Food Processing",
    });

    console.log("MONGO ORDER ID:", newOrder._id);

    console.log("MONGO RAZORPAY ORDER ID:", newOrder.razorpayOrderId);

    // ----------------------------------------
    // 3. Send response
    // ----------------------------------------

    return res.status(201).json({
      success: true,
      message: "Order created successfully",

      razorpayOrder: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },

      orderId: newOrder._id,
    });
  } catch (error) {
    console.error("Place order error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================================
// VERIFY PAYMENT
// ========================================

export const verifyPayment = async (req, res) => {
  try {
    const {razorpay_order_id, razorpay_payment_id, razorpay_signature} =
      req.body;

    console.log("VERIFY USER:", req.user);

    console.log("RAZORPAY ORDER:", razorpay_order_id);

    console.log("RAZORPAY PAYMENT:", razorpay_payment_id);

    // ----------------------------------------
    // Check payment data
    // ----------------------------------------

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Incomplete payment data",
      });
    }

    // ----------------------------------------
    // Generate expected signature
    // ----------------------------------------

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    // ----------------------------------------
    // Compare signatures
    // ----------------------------------------

    if (expectedSignature !== razorpay_signature) {
      console.log("INVALID SIGNATURE");

      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    console.log("SIGNATURE VERIFIED");

    // ----------------------------------------
    // Find order
    // ----------------------------------------

    const order = await orderModel.findOne({
      razorpayOrderId: razorpay_order_id,
      userId: req.user,
    });

    console.log("FOUND ORDER:", order);

    // ----------------------------------------
    // Order doesn't exist
    // ----------------------------------------

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // ----------------------------------------
    // Update payment
    // ----------------------------------------

    order.payment = true;
    order.paymentStatus = "paid";

    await order.save();

    console.log("PAYMENT SUCCESSFULLY UPDATED");
    const user = await userModel.findByIdAndUpdate(
      {_id: req.user},
      {cartData: {}},
    );

    // ----------------------------------------
    // Send response
    // ----------------------------------------

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
    });
  } catch (error) {
    console.error("Verify payment error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================================
// USER ORDERS
// ========================================

export const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({
      userId: req.user,
    });

    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================================
// LIST ORDERS - ADMIN
// ========================================

export const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});

    return res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.log(error);

    return res.json({
      success: false,
      message: "Error",
    });
  }
};

// ========================================
// UPDATE STATUS
// ========================================

export const updateStatus = async (req, res) => {
  try {
    await orderModel.findByIdAndUpdate(req.body.orderId, {
      status: req.body.status,
    });

    return res.json({
      success: true,
      message: "Status Updated",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
