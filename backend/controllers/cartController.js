import userModel from "../models/userModel.js";

export const addToCart = async (req, res) => {
  try {
    
    const { userId, itemId, size } = req.body

    const userData = await userModel.findById(userId)
    let cartData = await userData.cartData;

    if (cartData[itemId]) {
      if (cartData[itemId][size]) {
            cartData[itemId][size] += 1
      }
      else {
        cartData[itemId][size] = 1
      }
    } else {
      cartData[itemId] = {};
      cartData[itemId][size] = 1
    }

    await userModel.findByIdAndUpdate(userId, {cartData})

    res.json({ success: true, message: "Added To Cart"})

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message})
    
  }
};



// Update user cart
export const updateCart = async (req, res) => {
  try {
    const { userId, itemId, size, quantity } = req.body;
    if (!userId || !itemId || !size || quantity == null)
      return res.status(400).json({ success: false, message: "Missing fields" });

    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    let cartData = user.cartData || {};

    if (quantity === 0) {
      // Remove the size
      if (cartData[itemId] && cartData[itemId][size] !== undefined) {
        delete cartData[itemId][size];
      }
      // Remove item if empty
      if (cartData[itemId] && Object.keys(cartData[itemId]).length === 0) {
        delete cartData[itemId];
      }
    } else {
      if (!cartData[itemId]) cartData[itemId] = {};
      cartData[itemId][size] = quantity;
    }

    user.cartData = cartData;
    await user.save();

    res.json({ success: true, message: "Cart updated", cartData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user cart
export const getUserCart = async (req, res) => {
  try {
    const userId = req.body.userId; // comes from JWT
    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, cartData: user.cartData || {} });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Clear Cart
export const clearCart = async (req, res) => {
  try {
    const userId = req.body.userId;
    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.cartData = {};
    await user.save();

    res.json({ success: true, message: "Cart cleared" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};