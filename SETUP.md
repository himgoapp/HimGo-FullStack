# HimGo FullStack - Complete Setup Guide

Complete step-by-step guide to set up, configure, and run the entire HimGo Driver app.

## 📋 Prerequisites

- **Node.js**: v14 or higher
- **npm**: v6 or higher
- **MongoDB**: Local instance or Atlas cloud
- **Expo CLI**: Install with `npm install -g expo-cli`
- **Git**: For version control
- **Third-party Accounts**:
  - Cloudinary (for document uploads)
  - Razorpay (for payments)
  - MongoDB Atlas (optional, for cloud database)

## 🛠️ Step 1: Backend Setup

### 1.1 Navigate to Backend Directory
```bash
cd HimGo-FullStack/backend
```

### 1.2 Install Dependencies
```bash
npm install
```

This installs:
- express, mongoose, jsonwebtoken
- bcryptjs, multer, cloudinary
- razorpay, socket.io
- nodemailer, dotenv, cors

### 1.3 Configure Environment Variables

Copy the example file:
```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Database
MONGO_URI=mongodb://localhost:27017/himgo-driver
# OR for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/himgo-driver

# JWT
JWT_SECRET=your_super_secret_key_min_32_characters
JWT_EXPIRES_IN=30d

# Server
PORT=5000
NODE_ENV=development

# Cloudinary Setup:
# 1. Go to https://cloudinary.com/
# 2. Sign up for free account
# 3. Get credentials from dashboard
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay Setup:
# 1. Go to https://razorpay.com/
# 2. Create account and get test API keys
# 3. Use test keys for development
RAZORPAY_KEY_ID=rzp_test_your_key_here
RAZORPAY_KEY_SECRET=your_secret_key_here

# Optional Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### 1.4 Start MongoDB

If using local MongoDB:
```bash
# macOS/Linux
mongod

# Windows (if installed)
mongod.exe
```

Or use MongoDB Atlas (cloud):
- Create free account at https://www.mongodb.com/cloud/atlas
- Replace `MONGO_URI` in `.env`

### 1.5 Start Backend Server

```bash
npm start
```

Expected output:
```
MongoDB Connected Successfully! ✅
Server running on port 5000 🚀
Socket.io listening on port 5000 🔌
```

Test with:
```bash
curl http://localhost:5000
# Should return: { message: 'HimGo Driver API is running! 🏔️', status: 'online' }
```

## 📱 Step 2: Frontend Setup

### 2.1 Navigate to Frontend Directory
```bash
cd HimGo-FullStack/HimGoDriverApp
```

### 2.2 Install Dependencies
```bash
npm install
```

### 2.3 Configure Backend URL

Edit `src/services/api.js`:
```javascript
// Line 3
const API_URL = 'http://localhost:5000/api';  // If backend on localhost
// OR use your backend URL
// const API_URL = 'http://192.168.x.x:5000/api';  // For physical device
```

Edit `src/context/SocketContext.js`:
```javascript
// Line 5
const SOCKET_URL = 'http://localhost:5000';  // Same as backend
```

### 2.4 Start Expo Development Server
```bash
npm start
```

Or use:
```bash
expo start
```

### 2.5 Run on Device/Emulator

```bash
# Android (requires Android Studio emulator)
Press 'a' in terminal

# iOS (requires Xcode, macOS only)
Press 'i' in terminal

# Web browser
Press 'w' in terminal

# Physical device
Scan QR code with Expo Go app
```

## 🧪 Step 3: Testing the App

### 3.1 Test Login Flow

1. **Send OTP**
   - Phone: `9876543210`
   - Wait for OTP (logged in console)

2. **Verify OTP**
   - OTP: `1234` (development mode)
   - Name: `Rajesh Kumar`
   - Email: `driver@example.com`

3. **KYC Upload**
   - Click on each document type
   - They auto-mark as uploaded

4. **Dashboard**
   - Toggle online/offline
   - View earnings
   - Access other features

### 3.2 Test API Endpoints

Use Postman or curl:

**Send OTP:**
```bash
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210"}'
```

**Verify OTP:**
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone":"9876543210",
    "otp":"1234",
    "name":"Test Driver",
    "email":"test@himgo.com"
  }'
```

### 3.3 Test Payments

Create a Razorpay test order:
```bash
curl -X POST http://localhost:5000/api/wallet/topup \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount":500}'
```

Use Razorpay test card:
- Number: `4111111111111111`
- Expiry: `12/25` (any future date)
- CVV: `123` (any 3 digits)

## 📊 Database Verification

### Check MongoDB Collections

```bash
# Connect to MongoDB
mongo

# or for MongoDB Atlas
mongo "mongodb+srv://user:pass@cluster.mongodb.net/himgo-driver"

# List databases
show dbs

# Use HimGo database
use himgo-driver

# Show collections
show collections

# View sample driver
db.drivers.findOne()

# View rides
db.rides.find().pretty()
```

## 🔍 Troubleshooting

### Issue: Cannot connect to MongoDB
**Solution:**
- Ensure MongoDB service is running
- Check `MONGO_URI` in `.env`
- For MongoDB Atlas, whitelist your IP

### Issue: Port 5000 already in use
**Solution:**
```bash
# Kill process on port 5000
# macOS/Linux
lsof -i :5000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Windows (PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process
```

Or change PORT in `.env`:
```env
PORT=5001
```

### Issue: Expo app cannot connect to backend
**Solution:**
- Use actual IP instead of `localhost`
- Get your IP: `ipconfig` (Windows) or `ifconfig` (macOS/Linux)
- Update API URLs to: `http://192.168.x.x:5000/api`
- Ensure phone and computer on same WiFi

### Issue: Cloudinary upload not working
**Solution:**
- Verify `CLOUDINARY_CLOUD_NAME`, `API_KEY`, `API_SECRET`
- Check credentials in Cloudinary dashboard
- Test upload with curl

### Issue: Razorpay payment failing
**Solution:**
- Use Razorpay test keys (starts with `rzp_test_`)
- Use provided test card numbers
- Check your Razorpay account settings

## 📦 Project Files Created

### Backend Files
```
backend/
├── models/
│   ├── Driver.js           ✅
│   ├── Vehicle.js          ✅
│   ├── Ride.js             ✅
│   ├── Wallet.js           ✅
│   ├── Transaction.js      ✅
│   └── Document.js         ✅
├── controllers/
│   ├── authController.js   ✅
│   ├── kycController.js    ✅
│   ├── rideController.js   ✅
│   ├── earningsController.js ✅
│   └── walletController.js ✅
├── routes/
│   ├── authRoutes.js       ✅
│   ├── kycRoutes.js        ✅
│   ├── rideRoutes.js       ✅
│   ├── earningsRoutes.js   ✅
│   └── walletRoutes.js     ✅
├── middleware/
│   └── auth.js             ✅
├── server.js               ✅ (Updated with Socket.io)
├── package.json            ✅ (Updated dependencies)
├── .env                    ✅ (Created)
├── .env.example            ✅ (Created)
└── README.md               ✅ (Created)
```

### Frontend Files
```
HimGoUserApp/
├── src/
│   ├── screens/
│   │   ├── SplashScreen.js ✅
│   │   ├── auth/
│   │   │   ├── LoginScreen.js ✅
│   │   │   ├── OTPScreen.js ✅
│   │   │   └── KYCScreen.js ✅
│   │   └── app/
│   │       ├── DashboardScreen.js ✅
│   │       ├── RideFlowScreen.js ✅
│   │       ├── EarningsScreen.js ✅
│   │       ├── ProfileScreen.js ✅
│   │       └── WalletScreen.js ✅
│   ├── context/
│   │   ├── AuthContext.js ✅
│   │   └── SocketContext.js ✅
│   ├── services/
│   │   └── api.js ✅
├── App.js ✅ (Created with navigation)
├── package.json ✅ (Updated)
└── README.md ✅ (Created)
```

## ✅ Verification Checklist

- [ ] Backend npm packages installed
- [ ] MongoDB running (check with `mongo`)
- [ ] `.env` configured with all keys
- [ ] Backend server starts on port 5000
- [ ] API responds to health check
- [ ] Frontend npm packages installed
- [ ] Expo CLI installed globally
- [ ] API URL configured in frontend
- [ ] Expo app can start
- [ ] Can log in with phone
- [ ] OTP verification works
- [ ] Dashboard displays correctly
- [ ] Can toggle online/offline
- [ ] Database has driver records

## 🚀 Next Steps

1. **Complete Remaining Screens**
   - Enhanced earnings analytics
   - Real-time ride flow
   - Profile management
   - Wallet operations

2. **Add Advanced Features**
   - GPS location tracking
   - Map integration
   - Real-time notifications
   - Push notifications
   - Chat messaging

3. **Production Deployment**
   - Deploy backend to cloud
   - Deploy database to MongoDB Atlas
   - Configure Cloudinary for production
   - Switch to live Razorpay keys
   - Build APK/IPA
   - Publish to app stores

4. **Optimization**
   - Performance improvements
   - Offline support
   - Caching strategies
   - Error handling
   - Logging system

## 📞 Common Commands

```bash
# Backend
cd backend
npm install          # Install dependencies
npm start           # Start server
npm run dev         # Start with nodemon

# Frontend
cd HimGoUserApp
npm install         # Install dependencies
npm start           # Start Expo
expo start          # Alternative

# MongoDB
mongod              # Start service
mongo               # Connect to CLI
show dbs            # List databases
use himgo-driver    # Select database
```

## 📚 Documentation Links

- Backend: `backend/README.md`
- Frontend: `HimGoUserApp/README.md`
- Main: `README.md`

## 🎯 Success Indicators

✅ Backend running without errors  
✅ Frontend loads in Expo  
✅ Can complete auth flow  
✅ Dashboard shows data  
✅ Database has records  
✅ Socket.io connects  
✅ Payments configured  

---

**🎉 You're all set! Happy coding! 💚🚗**
