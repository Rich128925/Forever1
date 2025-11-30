const forgotPasswordTemplate = ({ name, otp }) => {
  return `
    <p>Dear ${name},</p>
    <p>You requested a password reset. Use this OTP:</p>
    <h2>${otp}</h2>
    <p>This OTP is valid for 1 hour.</p>
    <p>If you did not request this, ignore this email.</p>
  `;
};

export default forgotPasswordTemplate;
