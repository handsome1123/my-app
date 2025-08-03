# Real OTP Setup Guide

## Overview

This guide will help you set up real email and SMS OTP services for your authentication system.

## Email Service Setup (Gmail)

### 1. Enable 2-Factor Authentication on Gmail
1. Go to your Google Account settings
2. Navigate to Security
3. Enable 2-Step Verification

### 2. Generate App Password
1. Go to Google Account → Security
2. Under "2-Step Verification", click "App passwords"
3. Generate a new app password for "Mail"
4. Copy the 16-character password

### 3. Configure Environment Variables
Add to your `.env.local`:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-character-app-password
```

## SMS Service Setup (Twilio)

### 1. Create Twilio Account
1. Go to [Twilio.com](https://www.twilio.com/)
2. Sign up for a free account
3. Verify your phone number

### 2. Get Twilio Credentials
1. Go to Twilio Console
2. Copy your Account SID and Auth Token
3. Get a Twilio phone number

### 3. Configure Environment Variables
Add to your `.env.local`:
```env
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number
```

## Testing the OTP Services

### 1. Test Email OTP
1. Start your development server: `npm run dev`
2. Go to `/auth/signup`
3. Choose "Email" tab
4. Enter your email and name
5. Click "Send OTP"
6. Check your email for the OTP

### 2. Test SMS OTP
1. Go to `/auth/signup`
2. Choose "Phone" tab
3. Enter your phone number (e.g., 0812345678 for Thailand)
4. Click "Send OTP"
5. Check your phone for the SMS

## Phone Number Formatting

The system automatically formats phone numbers:
- **Thai numbers**: `0812345678` → `+66812345678`
- **International**: `+66812345678` → `+66812345678`
- **With spaces**: `0812 345 678` → `+66812345678`

## Production Considerations

### 1. Email Service Alternatives
- **SendGrid**: More reliable for production
- **AWS SES**: Cost-effective for high volume
- **Mailgun**: Good for transactional emails

### 2. SMS Service Alternatives
- **AWS SNS**: Cost-effective for high volume
- **Vonage**: Good international coverage
- **MessageBird**: European provider

### 3. OTP Storage
For production, replace in-memory storage with:
- **Redis**: Fast and scalable
- **Database**: Persistent storage
- **TTL**: Set appropriate expiration times

## Troubleshooting

### Email Issues
1. **Authentication failed**: Check app password
2. **Gmail blocked**: Enable "Less secure app access" or use app password
3. **Rate limiting**: Gmail has daily sending limits

### SMS Issues
1. **Invalid phone number**: Check international format
2. **Twilio trial**: Free accounts have limitations
3. **Country restrictions**: Some countries may have restrictions

### Common Error Messages
- `Failed to send email OTP`: Check email configuration
- `Failed to send SMS OTP`: Check Twilio configuration
- `Invalid phone number`: Check phone number format

## Security Best Practices

1. **Rate Limiting**: Implement rate limiting for OTP requests
2. **OTP Expiration**: Set appropriate expiration times (10 minutes)
3. **Failed Attempts**: Lock accounts after multiple failed attempts
4. **HTTPS**: Always use HTTPS in production
5. **Environment Variables**: Never commit credentials to version control

## Cost Considerations

### Email (Gmail)
- **Free tier**: 500 emails/day
- **Paid**: $0.0001 per email

### SMS (Twilio)
- **Free trial**: $15 credit
- **Paid**: ~$0.0075 per SMS (varies by country)

## Next Steps

1. ✅ Set up Gmail app password
2. ✅ Configure Twilio account
3. ✅ Test email OTP
4. ✅ Test SMS OTP
5. ✅ Deploy to production
6. ✅ Monitor usage and costs

Your real OTP system is now ready! 🚀 