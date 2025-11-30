const welcomeEmailTemplate = ({ name }) => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Welcome to Forever, ${name}!</h2>

      <p>Thank you for registering with <strong>Forever</strong>.</p>

      <p>We are excited to have you as part of our community.</p>

      <p>If you ever need help, feel free to reach out anytime.</p>

      <br />
      <p>Best Regards,<br/>The Forever Team</p>
    </div>
  `;
};

export default welcomeEmailTemplate;