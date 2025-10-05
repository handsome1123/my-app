import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail", // or use your SMTP
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false, // ✅ allows self-signed certificates
  },
});


export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify?token=${token}`;

  const mailOptions = {
    from: `"MFU - 2ndHand" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify your email address – MFU - 2ndHand",
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 40px 0;">
        <div style="max-width: 600px; background: #ffffff; margin: auto; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
          
          <div style="background-color: #007bff; color: #ffffff; text-align: center; padding: 20px;">
            <h1 style="margin: 0; font-size: 24px;">Welcome to MFU - 2ndHand</h1>
          </div>

          <div style="padding: 30px;">
            <h2 style="font-size: 20px; color: #333;">Confirm your email address</h2>
            <p style="font-size: 16px; color: #555;">
              Thank you for signing up! Please verify your email address to activate your account.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verifyUrl}" 
                style="background-color: #007bff; color: #ffffff; padding: 12px 25px; 
                       border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
                Verify Email
              </a>
            </div>

            <p style="font-size: 14px; color: #777;">
              This verification link will expire in <strong>1 hour</strong>. If you didn’t create an account, 
              you can safely ignore this email.
            </p>

            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #aaa; text-align: center;">
              © ${new Date().getFullYear()} MFU - 2ndHand. All rights reserved.<br/>
              This is an automated message, please do not reply.
            </p>
          </div>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

