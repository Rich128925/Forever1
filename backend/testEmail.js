// backend/testEmail.js
import sendEmail from './helpers/sendEmail.js';

const runTestEmail = async () => {
  try {
    const data = await sendEmail({
      sendTo: 'your-email@gmail.com',  // replace with your real email
      subject: 'Test Email from Resend',
      html: '<h1>Hello!</h1><p>This is a test email from Resend.</p>',
    });

    console.log('Email sent successfully:', data);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

runTestEmail();
