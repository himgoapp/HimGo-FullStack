# HimGo Driver Backend API

A fully-featured backend API for HimGo Driver app with authentication, ride management, earnings tracking, wallet, and Razorpay payment integration.

## 🏗️ Project Structure

```
backend/
├── controllers/          # Business logic
│   ├── authController.js      # OTP, login, profile
│   ├── kycController.js       # Document uploads
│   ├── rideController.js      # Ride lifecycle
│   ├── earningsController.js  # Analytics & stats
│   └── walletController.js    # Payments & payouts
├── models/              # Mongoose schemas
│   ├── Driver.js
│   ├── Vehicle.js
│   ├── Ride.js
│   ├── Wallet.js
│   ├── Transaction.js
│   └── Document.js
├── routes/              # API endpoints
│   ├── authRoutes.js
│   ├── kycRoutes.js
│   ├── rideRoutes.js
│   ├── earningsRoutes.js
│   └── walletRoutes.js
├── middleware/          # Auth & validation
│   └── auth.js
├── server.js            # Express app & Socket.io
├── package.json
├── .env                 # Configuration
└── .env.example         # Template
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 14
- MongoDB (local or Atlas)
- Cloudinary account (for document uploads)
- Razorpay account (for payments)

### Installation

1. **Install dependencies**:
```bash
cd backend
npm install
```

2. **Configure environment variables**:
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```
MONGO_URI=mongodb://localhost:27017/himgo-driver
JWT_SECRET=your_secure_secret_key
PORT=5000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

3. **Start MongoDB** (if local):
```bash
mongod
```

4. **Run the server**:
```bash
npm start          # Production
npm run dev        # Development with nodemon
```

Server will start on `http://localhost:5000`

## 📚 API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP to phone
- `POST /api/auth/verify-otp` - Verify OTP & login
- `GET /api/auth/profile` - Get driver profile (Protected)
- `PUT /api/auth/profile` - Update profile (Protected)
- `GET /api/auth/check-kyc` - Check KYC status (Protected)

### KYC Documents
- `POST /api/kyc/upload-document` - Upload document (Protected)
- `GET /api/kyc/status` - Get KYC status (Protected)
- `PUT /api/kyc/verify` - Verify KYC (Admin)

### Rides
- `POST /api/rides/request` - Create ride request
- `POST /api/rides/:rideId/accept` - Accept ride (Protected)
- `POST /api/rides/:rideId/start` - Start ride (Protected)
- `POST /api/rides/:rideId/end` - End ride & earn (Protected)
- `POST /api/rides/:rideId/cancel` - Cancel ride (Protected)
- `GET /api/rides/driver/history` - Get ride history (Protected)
- `POST /api/rides/:rideId/rate` - Rate ride (Protected)

### Earnings & Analytics
- `GET /api/earnings/today` - Today's earnings (Protected)
- `GET /api/earnings/week` - Weekly earnings (Protected)
- `GET /api/earnings/month` - Monthly earnings (Protected)
- `GET /api/earnings/transactions` - Transaction history (Protected)
- `GET /api/earnings/stats` - Overall statistics (Protected)

### Wallet & Payments
- `GET /api/wallet/balance` - Get wallet balance (Protected)
- `POST /api/wallet/topup` - Create Razorpay order (Protected)
- `POST /api/wallet/verify-payment` - Verify & add topup (Protected)
- `POST /api/wallet/request-payout` - Request payout (Protected)
- `GET /api/wallet/payouts` - Payout history (Protected)
- `PUT /api/wallet/bank-details` - Update bank details (Protected)

## 🔌 Socket.io Events

Real-time features using WebSocket:

### Emit Events
```javascript
// Driver goes online
socket.emit('driver-online', { driverId, location });

// Driver goes offline
socket.emit('driver-offline', { driverId });

// Update driver location
socket.emit('update-location', { driverId, latitude, longitude });

// New ride request
socket.emit('ride-request', { rideId, passengerLocation, destination, fare });

// Accept ride
socket.emit('ride-accepted', { rideId, driverId, driverLocation });

// Reject ride
socket.emit('ride-rejected', { rideId, driverId });

// Start ride
socket.emit('ride-started', { rideId, driverId });

// Complete ride
socket.emit('ride-completed', { rideId, driverId, fare, rating });

// Send message
socket.emit('send-message', { senderId, receiverId, message });
```

### Listen Events
```javascript
// New ride available
socket.on('new-ride-request', (data) => {});

// Ride accepted by driver
socket.on('ride-accepted-by-driver', (data) => {});

// Ride in progress
socket.on('ride-in-progress', (data) => {});

// Ride finished
socket.on('ride-finished', (data) => {});

// Driver location updated
socket.on('driver-location-updated', (data) => {});

// Driver status changed
socket.on('driver-status-updated', (data) => {});

// Receive message
socket.on('receive-message', (data) => {});
```

## 🔐 Authentication

JWT token-based authentication. Include token in header:
```
Authorization: Bearer <token>
```

## 💳 Payment Flow

1. **Request Topup**:
```javascript
POST /api/wallet/topup
{ "amount": 500 }
// Response: { orderId, amount, keyId }
```

2. **Initialize Razorpay** in frontend with `orderId` and `keyId`

3. **Verify Payment**:
```javascript
POST /api/wallet/verify-payment
{
  "razorpayOrderId": "...",
  "razorpayPaymentId": "...",
  "razorpaySignature": "..."
}
```

## 📊 Earnings Model

- **Base Rate**: ₹10 per km
- **Commission**: 20% of fare
- **Driver Earnings**: Base amount - Commission
- Automatic calculation on ride completion

## 🗄️ Database Models

### Driver
- phone (unique, 10 digits)
- name, email
- profilePhoto
- vehicle reference
- rating, totalRides, totalEarnings
- kycStatus (pending/approved/rejected)
- documents (license, registration, insurance, photo)
- isOnline status
- location (geospatial)
- walletBalance
- bankDetails

### Ride
- driver reference
- passenger info (name, phone, rating, trips)
- pickupLocation, dropoffLocation
- distance, duration
- fare (base, commission, earnings)
- isRoundTrip, returnDate
- status (requested/accepted/ongoing/completed/cancelled)
- ratings (driver & passenger)

### Wallet
- driver reference (unique)
- balance, totalEarnings, totalWithdrawn
- transactions array

### Transaction
- driver, wallet references
- type (ride_earning/wallet_topup/withdrawal/commission/refund)
- amount, status
- paymentGateway (razorpay/bank_transfer/manual)
- razorpay IDs
- balance before/after

## 🧪 Testing with Postman

1. **Send OTP**:
```
POST http://localhost:5000/api/auth/send-otp
{ "phone": "9876543210" }
```

2. **Verify OTP** (use OTP from response):
```
POST http://localhost:5000/api/auth/verify-otp
{
  "phone": "9876543210",
  "otp": "1234",
  "name": "Rajesh Kumar",
  "email": "rajesh@example.com"
}
```

3. **Get Profile** (use returned token):
```
GET http://localhost:5000/api/auth/profile
Header: Authorization: Bearer <token>
```

## 🚨 Error Handling

All errors return standardized JSON:
```json
{
  "message": "Error description",
  "error": "Optional error details"
}
```

Status codes:
- 200: Success
- 201: Created
- 400: Bad request
- 401: Unauthorized
- 404: Not found
- 500: Server error

## 📝 Environment Variables

```env
# Database
MONGO_URI=mongodb://localhost:27017/himgo-driver

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=30d

# Server
PORT=5000
NODE_ENV=development

# Cloudinary (Document uploads)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Razorpay (Payments)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

## 🔄 Next Steps

1. Deploy to cloud (Heroku, Railway, AWS)
2. Setup production MongoDB cluster (Atlas)
3. Configure Cloudinary & Razorpay live keys
4. Add email notifications
5. Implement SMS OTP with Twilio
6. Create admin dashboard for KYC verification
7. Add comprehensive logging
8. Setup monitoring & error tracking

## 📦 Dependencies

- **express**: Web framework
- **mongoose**: MongoDB ODM
- **jsonwebtoken**: JWT authentication
- **bcryptjs**: Password hashing
- **multer**: File uploads
- **cloudinary**: Cloud storage
- **razorpay**: Payment gateway
- **socket.io**: Real-time communication
- **dotenv**: Environment variables
- **cors**: Cross-origin requests
- **nodemailer**: Email sending

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## 📄 License

ISC License

---

**Happy Coding! 🚗💨**
