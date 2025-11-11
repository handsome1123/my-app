# MFU SecondHand - E-commerce Platform

A comprehensive second-hand marketplace platform built for Mae Fah Luang University students and community members. This full-stack application enables users to buy and sell pre-owned items with features like secure payment processing, real-time inventory management, and a modern, responsive user interface.

## 🚀 Features

### 🛒 Core E-commerce Functionality
- **Product Listings**: Browse, search, and filter products with advanced search capabilities
- **User Authentication**: Secure login/signup with email verification and Google OAuth integration
- **Shopping Cart**: Add, remove, and manage cart items with real-time updates
- **Secure Checkout**: Stripe-powered payment processing with multiple payment methods
- **Order Management**: Complete order lifecycle from placement to delivery confirmation

### 👥 Multi-Role System
- **Buyers**: Browse products, place orders, track purchases, and manage profiles
- **Sellers**: List products, manage inventory, process orders, and handle payouts
- **Administrators**: Oversee platform operations, manage users, process refunds, and monitor analytics

### 💳 Payment & Payout Features
- **Stripe Integration**: Secure credit card and digital wallet payments
- **PromptPay Support**: QR code-based payments for Thai users
- **Automated Payouts**: Seller payout processing with transaction history
- **Refund Management**: Comprehensive refund processing system

### 🎨 Modern UI/UX
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Glass Morphism**: Modern UI with backdrop blur effects and gradient designs
- **Image Carousel**: Dynamic product banners and image galleries
- **Real-time Updates**: Live inventory and order status updates
- **Accessibility**: WCAG-compliant design with proper ARIA labels

### 🔧 Technical Features
- **Real-time Search**: Debounced search with instant results
- **Inventory Management**: Stock tracking and low-stock alerts
- **Cloud Storage**: Cloudinary integration for image management
- **Email Notifications**: Automated email communication for orders and verification
- **Data Persistence**: MongoDB with Mongoose ODM
- **API Documentation**: RESTful API endpoints for all platform features

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom glass morphism effects
- **UI Components**: Radix UI for accessible, unstyled components
- **State Management**: Zustand for client-side state
- **Icons**: Lucide React
- **Forms**: React Hook Form with validation
- **Authentication**: NextAuth.js with Google OAuth

### Backend
- **Runtime**: Node.js with Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcryptjs for password hashing
- **Payments**: Stripe API for payment processing
- **Email**: Nodemailer for email communications
- **Image Storage**: Cloudinary for media management
- **QR Codes**: PromptPay QR generation

### Development & Testing
- **Testing**: Playwright for end-to-end testing
- **Linting**: ESLint with Next.js configuration
- **Type Checking**: TypeScript strict mode
- **Build Tool**: Next.js built-in bundler
- **Package Manager**: npm

### Infrastructure
- **Hosting**: Vercel (recommended)
- **Database Hosting**: MongoDB Atlas
- **File Storage**: Cloudinary
- **Payment Processing**: Stripe
- **Email Service**: Custom SMTP (configurable)

## 📋 Prerequisites

Before running this application, make sure you have:

- **Node.js**: Version 18.17 or higher
- **MongoDB**: Local instance or MongoDB Atlas account
- **Stripe Account**: For payment processing
- **Cloudinary Account**: For image storage
- **Google OAuth Credentials**: For social login
- **SMTP Service**: For email notifications (optional)

## 🚀 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mfu-secondhand
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**

   Create a `.env.local` file in the root directory with the following variables:

   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/mfu-secondhand

   # Authentication
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-nextauth-secret

   # Google OAuth
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id

   # JWT
   JWT_SECRET=your-jwt-secret

   # Stripe
   STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
   STRIPE_SECRET_KEY=your-stripe-secret-key
   STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key

   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-api-secret

   # Email (optional)
   EMAIL_USER=your-email@example.com
   EMAIL_PASS=your-email-password
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   ```

4. **Database Setup**

   Ensure MongoDB is running locally or configure your MongoDB Atlas connection.

5. **Stripe Webhooks** (Optional but recommended for production)

   Configure webhook endpoints in your Stripe dashboard pointing to:
   ```
   https://your-domain.com/api/webhooks/stripe
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000) to view the application.

## 📖 Usage

### For Buyers
1. **Sign Up/Login**: Create an account or sign in with Google
2. **Browse Products**: Use search and filters to find items
3. **Add to Cart**: Select items and proceed to checkout
4. **Complete Payment**: Use credit card or PromptPay
5. **Track Orders**: Monitor order status and history

### For Sellers
1. **Become a Seller**: Apply through the buyer dashboard
2. **List Products**: Add products with images and descriptions
3. **Manage Orders**: Confirm orders and update shipping status
4. **Receive Payouts**: Automatic payouts for completed sales

### For Administrators
1. **Access Admin Panel**: Use admin credentials to log in
2. **Manage Users**: View and moderate user accounts
3. **Process Refunds**: Handle refund requests
4. **Monitor Platform**: View analytics and system health

## 🧪 Testing

```bash
# Run end-to-end tests
npm run test:e2e

# Run all tests
npm run test

# Type checking
npm run typecheck

# Linting
npm run lint
```

## 🏗️ API Documentation

The application provides RESTful API endpoints organized by functionality:

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/logout` - User logout
- `POST /api/auth/verify` - Email verification

### Buyer Endpoints
- `GET /api/buyer/products` - Get all products
- `POST /api/buyer/cart` - Manage shopping cart
- `POST /api/buyer/checkout` - Process checkout
- `GET /api/buyer/orders` - Get user orders

### Seller Endpoints
- `POST /api/seller/products` - Create/list products
- `PUT /api/seller/products/[id]` - Update product
- `GET /api/seller/orders` - Get seller orders
- `POST /api/seller/orders/[id]/confirm` - Confirm orders

### Admin Endpoints
- `GET /api/admin/users` - Manage users
- `GET /api/admin/orders` - Manage orders
- `POST /api/admin/refunds/[id]/approve` - Process refunds

## 📁 Project Structure

```
mfu-secondhand/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── admin/             # Admin dashboard pages
│   │   ├── api/               # API route handlers
│   │   ├── buyer/             # Buyer-facing pages
│   │   ├── seller/            # Seller dashboard pages
│   │   ├── cart/              # Shopping cart page
│   │   ├── login/             # Login page
│   │   ├── signup/            # Signup page
│   │   └── globals.css        # Global styles
│   ├── components/            # Reusable React components
│   │   ├── ui/                # UI component library
│   │   └── layout/            # Layout components
│   ├── context/               # React context providers
│   ├── lib/                   # Utility functions and configurations
│   └── models/                # MongoDB data models
├── public/                    # Static assets
├── tests/                     # Test files
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── playwright.config.ts
└── README.md
```

## 🤝 Contributing

We welcome contributions to MFU SecondHand! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Run tests and linting**
   ```bash
   npm run lint
   npm run test
   npm run typecheck
   ```
5. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
6. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests for new features
- Maintain code quality with ESLint
- Use semantic commit messages
- Update documentation for API changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support & Contact

- **Project Repository**: [GitHub Repository URL]
- **Issue Tracker**: [GitHub Issues]
- **Documentation**: [Wiki/Documentation URL]
- **Email**: [Contact Email]

## 🙏 Acknowledgments

- **Mae Fah Luang University** for providing the platform vision
- **Next.js Team** for the excellent React framework
- **Stripe** for secure payment processing
- **MongoDB** for reliable data storage
- **Open Source Community** for the amazing tools and libraries

---

**Built with ❤️ for the MFU Community**
