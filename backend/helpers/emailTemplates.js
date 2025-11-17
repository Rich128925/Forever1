export default function forgotPasswordTemplate({ name, otp }) {
  return `
    <div style="font-family: sans-serif; line-height: 1.5;">
      <h2>Hello ${name},</h2>
      <p>You requested a password reset. Use this OTP:</p>
      <h3>${otp}</h3>
      <p>This OTP is valid for 1 hour.</p>
      <p>If you did not request this, ignore this email.</p>
    </div>
  `;
}
