import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import userModel from "../models/userModel.js";
import sendEmail from "../helpers/sendEmail.js";
import verifyEmailTemplate from "../helpers/emailTemplates.js";
import registerTemplate from "../helpers/registerTemplate.js";


// Generate JWT token
export const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// REGISTER USER

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate fields
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: "All fields are required" });

    if (!validator.isEmail(email))
      return res.status(400).json({ success: false, message: "Invalid email" });

    if (password.length < 8)
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });

    // Check if user exists
    const exists = await userModel.findOne({ email });
    if (exists)
      return res.status(400).json({ success: false, message: "User already exists" });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Email verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Create new user
    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
      isVerified: false,
      verificationToken,
    });

    const savedUser = await newUser.save();

    // SEND EMAIL VERIFICATION
    const VerifyEmailUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    await sendEmail({
      sendTo: email,
      subject: "Verify your email",
      html: verifyEmailTemplate({ name, url: VerifyEmailUrl }),
    });

    // SEND WELCOME EMAIL
    await sendEmail({
      sendTo: email,
      subject: "Welcome to Forever!",
      html: registerTemplate({ name }),
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully. Verification and welcome email sent.",
      data: savedUser,
    });

  } catch (error) {
    console.error("Register user error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};



// LOGIN USER 

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });
    if (!user)
      return res.json({ success: false, message: "User doesn't exist" });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.json({ success: false, message: "Invalid credentials" });

    const token = createToken(user.id);

    res.json({ success: true, token });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};




// ADMIN LOGIN

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(
        { email, role: "admin" },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );
      return res.json({ success: true, token });
    }

    return res.status(400).json({ success: false, message: "Invalid credentials" });

  } catch (error) {
    console.error("Admin login error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};




// FORGOT PASSWORD

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await userModel.findOne({ email });
    if (!user)
      return res.status(400).json({ success: false, message: "User not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const message = `
      <p>Hello ${user.name},</p>
      <p>You requested a password reset.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
    `;

    await sendEmail({
      sendTo: email,
      subject: "Password Reset Request",
      html: message,
    });

    return res.json({
      success: true,
      message: "Password reset link sent to your email",
    });

  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ success: false, message: "Failed to send reset link" });
  }
};




// VERIFY EMAIL 

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    const user = await userModel.findOne({ verificationToken: token });

    if (!user)
      return res.status(400).json({ success: false, message: "Invalid or expired token" });

    user.isVerified = true;
    user.verificationToken = undefined;

    await user.save();

    return res.json({
      success: true,
      message: "Email verified successfully",
    });

  } catch (error) {
    console.error("Verify email error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};



export {
  registerUser,
  loginUser,
  adminLogin,
  forgotPassword,
  verifyEmail
};
