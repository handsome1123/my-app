# MongoDB Setup Guide

## Prerequisites

1. **Install MongoDB** (if using local database):
   - Download from [MongoDB Community Server](https://www.mongodb.com/try/download/community)
   - Or use MongoDB Atlas (cloud service)

2. **Install MongoDB Compass** (optional but recommended):
   - Download from [MongoDB Compass](https://www.mongodb.com/try/download/compass)

## Setup Steps

### 1. Create Environment File

Copy the `env.example` file to `.env.local` and update the values:

```bash
cp env.example .env.local
```

Edit `.env.local` with your MongoDB connection string:

```env
# For local MongoDB
MONGODB_URI=mongodb://localhost:27017/your-database-name

# For MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/your-database-name

# NextAuth Configuration
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# JWT Secret
JWT_SECRET=your-jwt-secret-here
```

### 2. Generate Secret Keys

Generate secure secret keys:

```bash
# For NEXTAUTH_SECRET
openssl rand -base64 32

# For JWT_SECRET
openssl rand -base64 32
```

### 3. Start MongoDB (Local)

If using local MongoDB:

```bash
# Start MongoDB service
mongod

# Or on Windows
net start MongoDB
```

### 4. Test Connection

1. Start your Next.js development server:
   ```bash
   npm run dev
   ```

2. Visit `http://localhost:3000` and click "Test Connection"

3. Or test directly via API:
   ```bash
   curl http://localhost:3000/api/test-db
   ```

## Database Models

### User Model
- `email`: User's email address (unique)
- `password`: Hashed password
- `role`: User role ('admin', 'seller', 'buyer')
- `active`: Account status

### Product Model
- `name`: Product name
- `price`: Product price
- `owner`: Reference to User who created the product
- `imageUrl`: Optional product image URL

## API Endpoints

### Database Test
- `GET /api/test-db` - Test MongoDB connection

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create new product

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Ensure MongoDB is running
   - Check if port 27017 is available
   - Verify connection string format

2. **Authentication Failed**
   - Check username/password in connection string
   - Ensure user has proper permissions

3. **Environment Variables Not Loading**
   - Restart development server after creating `.env.local`
   - Check file name and location

### MongoDB Atlas Setup

1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create new cluster
3. Create database user
4. Get connection string
5. Add your IP to whitelist

## Next Steps

1. ✅ Test database connection
2. ✅ Create users and products
3. ✅ Integrate with authentication
4. ✅ Add data validation
5. ✅ Implement error handling 