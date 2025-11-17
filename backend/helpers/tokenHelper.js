import jwt from "jsonwebtoken";

// Generate a random 6-digit OTP
export function generatedOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Generate JWT Access Token
export function generatedAccessToken(userId) {
  return jwt.sign(
    { _id: userId },
    process.env.SECRET_KEY_ACCESS_TOKEN || "defaultsecret",
    { expiresIn: "15m" } // token expires in 15 minutes
  );
}

// Generate JWT Refresh Token (optional)
export function generatedRefreshToken(userId) {
  return jwt.sign(
    { _id: userId },
    process.env.SECRET_KEY_REFRESH_TOKEN || "refreshsecret",
    { expiresIn: "7d" } // token expires in 7 days
  );
}
