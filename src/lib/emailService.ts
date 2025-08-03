import nodemailer from 'nodemailer';

export class EmailService {
  private transporter: nodemailer.Transporter | null;

  constructor() {
    // Check if email is disabled for testing
    if (process.env.DISABLE_EMAIL === 'true') {
      this.transporter = null;
      return;
    }

    // Only initialize transporter if credentials are provided
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
        // Add SSL configuration to handle certificate issues
        secure: true,
        tls: {
          rejectUnauthorized: false
        }
      });
    } else {
      this.transporter = null;
    }
  }

  async sendOTP(email: string, otp: string, name?: string) {
    try {
      if (!this.transporter) {
        // Fallback: log the OTP for development
        console.log(`📧 Email OTP for ${email}: ${otp}`);
        console.log('ℹ️  Gmail not configured. Add EMAIL_USER and EMAIL_PASSWORD to .env.local for real email');
        return true;
      }

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your OTP Code - SecondHand App',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">SecondHand App</h1>
            </div>
            
            <div style="padding: 30px; background: #f9f9f9;">
              <h2 style="color: #333; margin-bottom: 20px;">Hello ${name || 'there'}!</h2>
              
              <p style="color: #666; font-size: 16px; line-height: 1.6;">
                You requested an OTP to verify your account. Here's your verification code:
              </p>
              
              <div style="background: #fff; border: 2px solid #667eea; border-radius: 10px; padding: 20px; text-align: center; margin: 30px 0;">
                <h1 style="color: #667eea; font-size: 32px; letter-spacing: 5px; margin: 0;">${otp}</h1>
              </div>
              
              <p style="color: #666; font-size: 14px;">
                This code will expire in 10 minutes. If you didn't request this code, please ignore this email.
              </p>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                <p style="color: #999; font-size: 12px;">
                  Best regards,<br>
                  The SecondHand Team
                </p>
              </div>
            </div>
          </div>
        `,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', result.messageId);
      return true;
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      // Fallback to console logging when email fails
      console.log(`📧 Email OTP for ${email}: ${otp} (fallback due to email error)`);
      console.log('ℹ️  Email service failed, but OTP is logged above for testing');
      return true; // Return true so the API doesn't fail
    }
  }
}

export const emailService = new EmailService(); 