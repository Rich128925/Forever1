import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import userModel from "../models/userModel.js";
import sendEmail from "../helpers/sendEmail.js";
import verifyEmailTemplate from "../helpers/emailTemplates.js";

// Generate JWT token
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// USER REGISTER 
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ success: false, error: true, message: "All fields are required" });

    if (!validator.isEmail(email))
      return res.status(400).json({ success: false, error: true, message: "Invalid email" });

    if (password.length < 8)
      return res.status(400).json({ success: false, error: true, message: "Password must be at least 8 characters" });

    const exists = await userModel.findOne({ email });
    if (exists) return res.status(400).json({ success: false, error: true, message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
      isVerified: false,
      verificationToken,
    });

    const savedUser = await newUser.save();

    // Send verification email
    const VerifyEmailUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    await sendEmail({
      sendTo: email,
      subject: "Verify your email",
      html: verifyEmailTemplate({ name, url: VerifyEmailUrl }),
    });

    return res.status(201).json({
      success: true,
      error: false,
      message: "User registered successfully. Verification email sent.",
      data: savedUser,
    });
  } catch (error) {
    console.error("Register user error:", error);
    return res.status(500).json({
      success: false,
      error: true,
      message: error.message || "Internal server error",
    });
  }
};

// USER LOGIN
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User doesn't exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const token = createToken(user._id);
    res.json({ success: true, token });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ADMIN LOGIN
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign({ email, role: "admin" }, process.env.JWT_SECRET, { expiresIn: "7d" });
      return res.json({ success: true, error: false, token });
    } else {
      return res.status(400).json({ success: false, error: true, message: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Admin login error:", error);
    return res.status(500).json({ success: false, error: true, message: error.message });
  }
};

//  FORGOT PASSWORD 
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) return res.status(400).json({ success: false, error: true, message: "User not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const message = `You requested a password reset. Click here to reset your password: ${resetUrl}`;

    await sendEmail({
      sendTo: email,
      subject: "Password Reset Request",
      html: message,
    });

    return res.json({ success: true, error: false, message: "Password reset link sent to your email" });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ success: false, error: true, message: "Failed to send reset link" });
  }
};

// VERIFY EMAIL 
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    const user = await userModel.findOne({ verificationToken: token });
    if (!user) return res.status(400).json({ success: false, error: true, message: "Invalid or expired token" });

    user.isVerified = true;
    user.verificationToken = undefined; // remove token after verification
    await user.save();

    return res.json({ success: true, error: false, message: "Email verified successfully" });
  } catch (error) {
    console.error("Verify email error:", error);
    return res.status(500).json({ success: false, error: true, message: error.message });
  }
};



export { registerUser, loginUser, adminLogin, forgotPassword, verifyEmail };
