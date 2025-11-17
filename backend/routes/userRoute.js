import express from "express";
import { loginUser, registerUser, adminLogin } from "../controllers/user.controller.js";

import { 
  forgotPasswordController,
  verifyForgotPasswordOtp,
  resetPassword
} from "../controllers/authController.js"; 

const userRouter = express.Router();

// Test POST route
userRouter.post("/", (req, res) => {
  res.json({ success: true, message: "POST /api/user is working!", data: req.body });
});

// User Routes
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/admin", adminLogin);

// Logout
userRouter.post("/logout", (req, res) => {
  try {
    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Forgot Password Routes
userRouter.post("/forgot-password", forgotPasswordController);
userRouter.post("/verify-otp", verifyForgotPasswordOtp);
userRouter.post("/reset-password", resetPassword);

export default userRouter;
