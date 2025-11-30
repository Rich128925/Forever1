import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cartData: { type: Object, default: {} },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },
    forgot_password_otp: { type: String, default: null },
    forgot_password_expiry: { type: Date, default: null },
    last_login_date: { type: Date, default: null },
    status: { type: String, enum: ["Active", "Inactive", "Suspended"], default: "Active" },
    address_details: [{ type: mongoose.Schema.ObjectId, ref: "address" }],
    shopping_cart: [{ type: mongoose.Schema.ObjectId, ref: "cartproduct" }],
    orderHistory: [{ type: mongoose.Schema.ObjectId, ref: "order" }],
  },
  { timestamps: true, minimize: false }
);

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
