import UserModel from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sendEmail from "../helpers/sendEmail.js";
import forgotPasswordTemplate from "../helpers/emailTemplates.js";
import { generatedOtp, generatedAccessToken } from "../helpers/tokenHelper.js";

// Forgot Password
export const forgotPasswordController = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await UserModel.findOne({ email });

    if (!user)
      return res.status(400).json({ success: false, message: "Email not found" });

    // Generate OTP
    const otp = generatedOtp();
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save OTP and expiry in user document
    await UserModel.findByIdAndUpdate(user._id, {
      forgot_password_otp: otp,
      forgot_password_expiry: expiry,
    });

    // Send email with verified sender
    await sendEmail({
      sendTo: email,
      subject: "Reset Your Password",
      html: forgotPasswordTemplate({ name: user.name, otp }),
    });

    res.json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
};

// Verify OTP
export const verifyForgotPasswordOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await UserModel.findOne({ email });

    if (!user)
      return res.status(400).json({ success: false, message: "Email not found" });

    if (new Date() > new Date(user.forgot_password_expiry))
      return res.status(400).json({ success: false, message: "OTP expired" });

    if (otp !== user.forgot_password_otp)
      return res.status(400).json({ success: false, message: "Invalid OTP" });

    // Clear OTP after verification
    await UserModel.findByIdAndUpdate(user._id, {
      forgot_password_otp: "",
      forgot_password_expiry: "",
    });

    res.json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to verify OTP" });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    if (!email || !newPassword || !confirmPassword)
      return res.status(400).json({ success: false, message: "All fields are required" });

    if (newPassword !== confirmPassword)
      return res.status(400).json({ success: false, message: "Passwords do not match" });

    const user = await UserModel.findOne({ email });
    if (!user)
      return res.status(400).json({ success: false, message: "Email not found" });

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(newPassword, salt);

    await UserModel.findByIdAndUpdate(user._id, { password: hashPassword });

    res.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to reset password" });
  }
};

// Refresh Token
export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.headers.authorization?.split(" ")[1];
    if (!refreshToken)
      return res.status(401).json({ success: false, message: "Invalid token" });

    const verifyToken = jwt.verify(refreshToken, process.env.SECRET_KEY_REFRESH_TOKEN);
    if (!verifyToken)
      return res.status(401).json({ success: false, message: "Token expired" });

    const userId = verifyToken._id;
    const newAccessToken = generatedAccessToken(userId);

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    res.json({
      success: true,
      message: "New access token generated",
      data: { accessToken: newAccessToken },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to refresh token" });
  }
};

