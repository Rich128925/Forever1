import UserModel from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import sendEmail from "../helpers/sendEmail.js";
import forgotPasswordTemplate from "../helpers/emailTemplates.js";
import welcomeEmailTemplate from "../helpers/welcomeEmailTemplate.js";
import { generatedOtp, generatedAccessToken } from "../helpers/tokenHelper.js";

// REGISTER USER
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check existing user
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Create new user
    const newUser = await UserModel.create({
      name,
      email,
      password: hashedPassword,
      isVerified: false,
      verificationToken,
    });

    // Send Welcome Email
    await sendEmail({
      sendTo: newUser.email,
      subject: "Welcome to Forever!",
      html: welcomeEmailTemplate({ name: newUser.name }),
    });

    // Send Verification Email
    await sendEmail({
      sendTo: newUser.email,
      subject: "Verify Your Email",
      html: verifyEmailTemplate({
        name: newUser.name,
        url: `${process.env.FRONTEND_URL}/verify-email/${newUser.verificationToken}`,
      }),
    });

    res.status(201).json({
      success: true,
      message: "Registration successful! Please verify your email.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// LOGIN USER 
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user)
      return res.status(400).json({ success: false, message: "Invalid email or password" });

    // Compare password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(400).json({ success: false, message: "Invalid email or password" });

    // Access token
    const accessToken = generatedAccessToken(user._id);

    res.json({ success: true, message: "Login successful", data: { accessToken, user } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// FORGOT PASSWORD
export const forgotPasswordController = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: "Email not found" });

    // Generate OTP
    const otp = generatedOtp();
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save OTP
    await UserModel.findByIdAndUpdate(user._id, {
      forgot_password_otp: otp,
      forgot_password_expiry: expiry,
    });

    // Send OTP email
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

// VERIFY OTP
export const verifyForgotPasswordOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: "Email not found" });

    if (new Date() > new Date(user.forgot_password_expiry))
      return res.status(400).json({ success: false, message: "OTP expired" });

    if (otp !== user.forgot_password_otp)
      return res.status(400).json({ success: false, message: "Invalid OTP" });

    // Clear OTP
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

// RESET PASSWORD 
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword)
      return res.status(400).json({ success: false, message: "Passwords do not match" });

    const user = await UserModel.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: "Email not found" });

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(newPassword, salt);

    await UserModel.findByIdAndUpdate(user._id, { password: hashPassword });

    res.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to reset password" });
  }
};

// REFRESH TOKEN
export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.headers.authorization?.split(" ")[1];

    if (!refreshToken)
      return res.status(401).json({ success: false, message: "Invalid token" });

    const verifyToken = jwt.verify(refreshToken, process.env.SECRET_KEY_REFRESH_TOKEN);
    const newAccessToken = generatedAccessToken(verifyToken._id);

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    res.json({ success: true, message: "New access token generated", data: { accessToken: newAccessToken } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to refresh token" });
  }
};
