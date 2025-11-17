import orderModel from "../middleware/orderModel.js"
import userModel from "../models/userModel.js";  
import Stripe from 'stripe'


// global variables 
const currency = 'inr'
const deliveryCharge = 10

// gateway initalize
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// placing order using COD Method

const placeOrder = async(req,res) => {

  try {
    
    const { userId, items, amount, address } = req.body

    const orderData = {
      userId,
      items,
      address,
      amount,
      paymentMethod: "COD",
      payment: false,
      date: Date.now()
    }

      const newOrder = new orderModel(orderData)
      await newOrder.save()

      await userModel.findByIdAndUpdate(userId,{cartdata:{}})

      res.json({success: true, message:"Order Placed"})

  } catch (error) {
    console.log(error);
    res.json({success:false, message:error.message})
    
  }

}
// placing order using Stripe Method

const placeOrderStripe = async(req,res) => {
 try {
  // Create a new order in MongoDB
  const newOrder = new orderModel(orderData);
  await newOrder.save();

  // Convert order items to Stripe line_items
  const line_items = orderData.items.map((item) => ({
    price_data: {
      currency: currency,
      product_data: {
        name: item.name,
      },
      unit_amount: item.price * 100, 
    },
    quantity: item.quantity,
  }));

  line_items.push({
    price_data: {
      currency: currency,
      product_data: {
        name: 'Delivery Charges'
      },
      unit_amount: deliveryCharge * 100, 
    },
  })

  const session = await stripe.checkout.create({
    success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
    cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
    line_items,
    mode: 'payment',
  })

  res.json({success: true,session_url: session.url})
  
} catch (error) {
 console.log(error);
 res.json({success:false, message:error.message})
 
}
  
}
// placing order using Razorpay Method

const placeOrderRazorpay = async(req,res) => {
  
}


// All Order data for Admin panel
const allOrders = async(req,res) => {

try {
  const orders = await orderModel.find({})
  res.json({success: true,orders})
} catch (error) {
  console.log(error);
    res.json({success: false, message:error.message})
}

}

// All Order data for Frontend 
const userOrders = async(req,res) => {
  try {
    
    const { userId } = req.body

    const orders = await orderModel.find({ userId })
    res.json({success: true, orders})

  } catch (error) {
    console.log(error);
    res.json({success: false, message:error.message})
    
  }
}

// update oder status from Admin Panel
const updateStatus = async(req,res) => {
  try {
    
    const { orderId, status } = req.body

    await orderModel.findByIdAndUpdate(orderId, {status})
    res.json({success: true, message: 'Status Update'})

  } catch (error) {
     console.log(error);
     res.json({success: false, message:error.message})
  }
}

export { placeOrder, placeOrderStripe, placeOrderRazorpay, allOrders, userOrders, updateStatus }