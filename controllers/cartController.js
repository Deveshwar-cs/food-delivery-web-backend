import userModel from "../models/userModel.js";

// add items to user cart
export const addToCart = async (req, res) => {
  try {
    let userData = await userModel.findOne({_id: req.user});
    let cartData = await userData.cartData;
    if (!cartData[req.body.itemId]) {
      cartData[req.body.itemId] = 1;
    } else {
      cartData[req.body.itemId] += 1;
    }
    await userModel.findByIdAndUpdate(req.user, {cartData});
    res.json({success: true, message: "Added to Cart"});
  } catch (error) {
    console.log(error);
    res.status(500).json({success: false, message: "error"});
  }
};

// remove items from user cart
export const removeFromCart = async (req, res) => {
  try {
    let userData = await userModel.findById(req.user);
    let cartData = userData.cartData;
    if (cartData[req.body.itemId] > 0) {
      cartData[req.body.itemId] -= 1;
    }
    await userModel.findByIdAndUpdate(req.user, {cartData});
    res.status(200).json({success: true, message: "Removed from Cart"});
  } catch (error) {
    console.log(error);
    res.status(500).json({success: false, message: "error"});
  }
};

// fetch user cart data
export const getCart = async (req, res) => {
  try {
    let userData = await userModel.findById(req.user);
    let cartData = await userData.cartData;
    res.status(200).json({success: true, cartData});
  } catch (error) {
    console.log(error);
    res.status(500).json({success: false, message: "Error"});
  }
};
