import twilio from 'twilio';

export class SMSService {
  private client: twilio.Twilio | null = null;

  constructor() {
    // Only initialize Twilio if credentials are provided and valid
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    
    if (accountSid && authToken && accountSid.startsWith('AC')) {
      this.client = twilio(accountSid, authToken);
    } else {
      this.client = null;
    }
  }

  async sendOTP(phone: string, otp: string) {
    try {
      if (!this.client) {
        // Fallback: log the OTP for development
        console.log(`📱 SMS OTP for ${phone}: ${otp}`);
        console.log('ℹ️  Twilio not configured. Add TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN to .env.local for real SMS');
        return true;
      }

      const message = await this.client.messages.create({
        body: `Your SecondHand App verification code is: ${otp}. This code expires in 10 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone,
      });

      console.log('✅ SMS sent successfully:', message.sid);
      return true;
    } catch (error) {
      console.error('❌ SMS sending failed:', error);
      return false;
    }
  }

  // Format phone number for international format
  formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // If it's a Thai number (starts with 0), convert to international format
    if (cleaned.startsWith('0')) {
      return '+66' + cleaned.substring(1);
    }
    
    // If it doesn't start with +, add it
    if (!cleaned.startsWith('+')) {
      return '+' + cleaned;
    }
    
    return cleaned;
  }
}

export const smsService = new SMSService(); 