# Exam Pack - Backend

Complete backend solution for Providence Publishers Exam Pack platform with payment processing and file downloads.

## Features

- **User Authentication**: Register, login, and profile management
- **Payment Processing**: Integrated Paystack for Nigerian Naira transactions
- **Download Management**: Secure file delivery after payment
- **Purchase Tracking**: Complete purchase and download history
- **Pack Management**: Categorized exam packs by education level

## Project Structure

```
├── models/
│   ├── User.js          # User schema with purchases and downloads
│   ├── Pack.js          # Exam pack schema
│   └── Payment.js       # Payment transaction schema
├── routes/
│   ├── auth.js          # Authentication endpoints
│   ├── payments.js      # Payment processing endpoints
│   ├── downloads.js     # File download endpoints
│   ├── packs.js         # Pack listing endpoints
│   └── users.js         # User profile endpoints
├── middleware/
│   └── auth.js          # JWT authentication middleware
├── server.js            # Express server setup
└── package.json         # Dependencies
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd Exam-Pack-
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/exam-pack
   JWT_SECRET=your_secret_key
   PAYSTACK_SECRET_KEY=sk_test_xxx
   PAYSTACK_PUBLIC_KEY=pk_test_xxx
   ```

4. **Create uploads directory**
   ```bash
   mkdir uploads
   ```

5. **Start the server**
   ```bash
   npm start
   # or for development with auto-reload:
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Payments
- `POST /api/payments/initialize` - Initialize Paystack payment
- `GET /api/payments/verify/:reference` - Verify payment
- `GET /api/payments/history` - Get payment history (requires auth)

### Downloads
- `GET /api/downloads/pack/:packId` - Download pack file (requires auth + purchase)
- `GET /api/downloads/history` - Get download history (requires auth)
- `GET /api/downloads/purchased-packs` - Get purchased packs (requires auth)

### Packs
- `GET /api/packs` - Get all packs
- `GET /api/packs/:packId` - Get single pack
- `GET /api/packs/level/:level` - Get packs by level

### Users
- `GET /api/users/profile` - Get user profile (requires auth)
- `PUT /api/users/profile` - Update profile (requires auth)
- `GET /api/users/stats` - Get user statistics (requires auth)

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Paystack Integration

1. **Sign up** at [Paystack.com](https://paystack.com)
2. **Get API keys** from your dashboard
3. **Add to `.env`**:
   ```
   PAYSTACK_SECRET_KEY=sk_test_xxx
   PAYSTACK_PUBLIC_KEY=pk_test_xxx
   ```

## Frontend Integration

Update your `index.html` to use these endpoints:

```javascript
// Register
const registerUser = async (fullName, email, phoneNumber, password) => {
  const response = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fullName, email, phoneNumber, password })
  });
  return response.json();
};

// Initialize Payment
const initializePayment = async (packId) => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:5000/api/payments/initialize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ packId })
  });
  return response.json();
};

// Download Pack
const downloadPack = async (packId) => {
  const token = localStorage.getItem('token');
  window.location.href = `http://localhost:5000/api/downloads/pack/${packId}?token=${token}`;
};
```

## Database Setup (MongoDB)

For local development:
```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or install locally
# macOS: brew install mongodb-community
# Linux: Follow MongoDB documentation
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|----------|
| PORT | Server port | 5000 |
| NODE_ENV | Environment | development/production |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/exam-pack |
| JWT_SECRET | JWT secret key | your_secret_key |
| JWT_EXPIRE | Token expiration | 7d |
| PAYSTACK_SECRET_KEY | Paystack API secret | sk_test_xxx |
| PAYSTACK_PUBLIC_KEY | Paystack API public key | pk_test_xxx |
| FRONTEND_URL | Frontend URL for CORS | http://localhost:3000 |

## Security Notes

- Always use HTTPS in production
- Keep `.env` file private (added to `.gitignore`)
- Hash passwords with bcryptjs
- Use JWT for stateless authentication
- Validate all user inputs
- Implement rate limiting for production

## Next Steps

1. Set up MongoDB database
2. Configure Paystack API keys
3. Test authentication flow
4. Integrate with frontend
5. Add file upload functionality for packs
6. Deploy to production server

## Support

For issues or questions, contact Providence Publishers.