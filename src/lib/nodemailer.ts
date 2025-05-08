import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'secondhand.mfu@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'imyl viwi lugc irhb'
  },
  tls: {
    rejectUnauthorized: false // Allow self-signed certificates (not recommended for production)
  }
});

export async function sendOtpEmail(email: string, otpCode: string) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"MFU Secondhand" <secondhand.mfu@gmail.com>',
      to: email,
      subject: 'Verify Your Email Address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Email Verification</h2>
          <p>Thank you for registering! Please use the following verification code to complete your registration:</p>
          <div style="background-color: #f4f4f4; padding: 12px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px; margin: 20px 0;">
            ${otpCode}
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}
