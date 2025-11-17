import express from "express";
import {
  forgotPasswordController,
  verifyForgotPasswordOtp,
  resetPassword,
  refreshToken, 
} from "../controllers/authController.js";
const authRoute = express.Router();

// Forgot Password Flow
authRoute.post("/forgot-password", forgotPasswordController);              
authRoute.post("/verify-forgot-password-otp", verifyForgotPasswordOtp);  
authRoute.post("/reset-password", resetPassword);                          

// Refresh Access Token
authRoute.post("/refresh-token", refreshToken);

export default authRoute;
