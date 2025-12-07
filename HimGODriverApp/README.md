# HimGo Driver - React Native Frontend

A fully-featured React Native app for HimGo Driver built with Expo, featuring authentication, real-time ride management, earnings tracking, and Razorpay payment integration.

## 🏗️ Project Structure

```
HimGoUserApp/
├── src/
│   ├── screens/              # App screens
│   │   ├── SplashScreen.js
│   │   ├── auth/
│   │   │   ├── LoginScreen.js
│   │   │   ├── OTPScreen.js
│   │   │   └── KYCScreen.js
│   │   └── app/
│   │       ├── DashboardScreen.js
│   │       ├── RideFlowScreen.js
│   │       ├── EarningsScreen.js
│   │       ├── ProfileScreen.js
│   │       └── WalletScreen.js
│   ├── context/              # State management
│   │   ├── AuthContext.js
│   │   └── SocketContext.js
│   ├── services/
│   │   └── api.js            # API calls & Axios config
│   └── utils/
├── App.js                    # Root component & navigation
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 14
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your phone (Android/iOS)

### Installation

1. **Install dependencies**:
```bash
cd HimGoUserApp
npm install
```

2. **Configure API URL**:
Edit `src/services/api.js` and `src/context/SocketContext.js`:
```javascript
const API_URL = 'http://YOUR_BACKEND_URL:5000/api';
const SOCKET_URL = 'http://YOUR_BACKEND_URL:5000';
```

3. **Start Expo**:
```bash
npm start
# or
expo start
```

4. **Run on device**:
   - Android: Press `a` in terminal
   - iOS: Press `i` in terminal
   - Web: Press `w` in terminal

## 📱 Features

### Authentication
- ✅ Phone-based OTP login
- ✅ Driver registration with name & email
- ✅ JWT token-based authentication
- ✅ Secure token storage

### KYC & Documents
- Document upload (License, Registration, Insurance, Photo)
- Cloudinary integration
- Real-time verification status

### Dashboard
- Online/Offline toggle
- Today's earnings display
- Ride count
- Quick access to features

### Ride Management
- View available rides
- Accept/Reject rides
- Start/End trips
- Rate passengers
- Ride history

### Earnings & Analytics
- Today's earnings
- Weekly performance chart
- Monthly statistics
- Transaction history
- Average rating

### Wallet & Payments
- View wallet balance
- Razorpay wallet topup
- Request payouts
- Bank account management
- Transaction history

### Real-time Features
- Socket.io live updates
- Live ride requests
- Driver status sync
- Location tracking
- Instant notifications

## 🧠 Context & State Management

### AuthContext
Manages:
- User authentication (login/register)
- JWT token storage
- User profile
- Logout functionality

```javascript
const { user, token, sendOTP, verifyOTP, logout, isSignedIn } = useAuth();
```

### SocketContext
Manages:
- WebSocket connection
- Real-time ride requests
- Driver location
- Ride acceptance/rejection
- Status updates

```javascript
const { isConnected, rideRequest, goOnline, acceptRide, updateLocation } = useSocket();
```

## 🔌 Socket.io Events

### Emit (Send to Server)
```javascript
// Go online
socket.emit('driver-online', { driverId, location });

// Update location
socket.emit('update-location', { driverId, latitude, longitude });

// Accept ride
socket.emit('ride-accepted', { rideId, driverId, driverLocation });

// Reject ride
socket.emit('ride-rejected', { rideId, driverId });

// Start ride
socket.emit('ride-started', { rideId, driverId });

// Complete ride
socket.emit('ride-completed', { rideId, driverId, fare, rating });
```

### Listen (Receive from Server)
```javascript
// New ride available
socket.on('new-ride-request', (data) => setRideRequest(data));

// Ride status updated
socket.on('ride-accepted-by-driver', (data) => {});
socket.on('ride-in-progress', (data) => {});
socket.on('ride-finished', (data) => {});

// Location updates
socket.on('driver-location-updated', (data) => {});
socket.on('driver-status-updated', (data) => {});
```

## 📚 API Integration

All API calls use Axios with automatic token injection:

```javascript
// Auth
await authAPI.sendOTP(phone);
await authAPI.verifyOTP(phone, otp, name, email);
await authAPI.getProfile();

// Rides
await rideAPI.acceptRide(rideId);
await rideAPI.startRide(rideId);
await rideAPI.endRide(rideId);

// Earnings
await earningsAPI.getTodayEarnings();
await earningsAPI.getWeeklyEarnings();
await earningsAPI.getMonthlyEarnings();

// Wallet
await walletAPI.getBalance();
await walletAPI.createTopupOrder(amount);
await walletAPI.verifyPayment(orderId, paymentId, signature);
await walletAPI.requestPayout(amount);
```

## 🎨 Design System

### Colors
```javascript
Primary: #00914e (Green)
Secondary: #006b3a (Dark Green)
Success: #4facfe (Blue)
Warning: #f093fb (Pink)
Background: #f8f8f8
```

### Typography
- **Font Family**: System default
- **Bold**: fontWeight: 'bold'
- **Heading**: 20px+
- **Body**: 14px
- **Small**: 12px

### Spacing
- Standard padding: 16px
- Gap between items: 12px
- Border radius: 12-16px

## 🔐 Authentication Flow

1. **Splash Screen** - Check for stored token
2. **Login Screen** - Enter phone number
3. **OTP Screen** - Enter OTP, then name & email
4. **KYC Screen** - Upload documents (optional)
5. **Dashboard** - Main app experience

## 💳 Payment Integration

### Razorpay Setup

1. Get API keys from Razorpay dashboard
2. Configure in backend `.env`
3. Frontend automatically loads Razorpay SDK

### Topup Flow
```javascript
1. User enters amount
2. Frontend calls createTopupOrder() → Gets orderId
3. Show Razorpay payment sheet
4. User completes payment
5. Frontend calls verifyPayment() with signature
6. Wallet balance updated
```

## 📊 Navigation Structure

```
App
├── Auth Stack (if not logged in)
│   ├── Login
│   ├── OTP
│   └── KYC
└── App Tabs (if logged in)
    ├── Dashboard
    ├── Rides
    ├── Earnings
    └── Profile
```

## 🧪 Testing

### Test User Credentials
```
Phone: 9876543210
OTP: 1234 (for development)
Name: Test Driver
Email: driver@himgo.com
```

### Test Razorpay (if using sandbox)
- Card: 4111111111111111
- Exp: Any future date
- CVV: Any 3 digits

## 📦 Key Dependencies

- **react-native**: Mobile framework
- **@react-navigation**: Navigation
- **axios**: HTTP client
- **socket.io-client**: Real-time communication
- **react-native-toast-message**: Notifications
- **@react-native-async-storage**: Local storage
- **razorpay-react-native**: Payment SDK
- **react-native-geolocation-service**: Location
- **react-native-image-picker**: Photo upload

## 🚨 Error Handling

All API calls include:
- Automatic token injection
- Error status code handling
- Toast notifications for errors
- Logout on 401 Unauthorized

```javascript
try {
  await apiCall();
} catch (error) {
  Toast.show({
    type: 'error',
    text1: 'Error Title',
    text2: error.response?.data?.message
  });
}
```

## 📍 Location Permissions

Required permissions (add to app.json):
```json
{
  "plugins": [
    [
      "expo-location",
      {
        "locationAlwaysAndWhenInUsePermissions": ["Allow"]
      }
    ]
  ]
}
```

## 🔄 Offline Support

- AsyncStorage for token persistence
- Automatic reconnection to Socket.io
- Offline-first data handling

## 🚀 Build & Deploy

### Build for Android
```bash
eas build --platform android
```

### Build for iOS
```bash
eas build --platform ios
```

### Publish to Stores
```bash
eas submit --platform android
eas submit --platform ios
```

## 📝 Environment Variables

Create `.env` (not tracked in git):
```
BACKEND_URL=http://your-backend-url:5000
API_URL=http://your-backend-url:5000/api
SOCKET_URL=http://your-backend-url:5000
```

## 🎯 Next Steps

1. ✅ Complete remaining screens (Earnings, Rides, Profile, Wallet)
2. ✅ Add geolocation for driver tracking
3. ✅ Implement real-time location updates
4. ✅ Add push notifications
5. ✅ Integrate Maps (Google Maps/Apple Maps)
6. ✅ Add ride request modal
7. ✅ Implement rating system
8. ✅ Add support chat
9. ✅ Performance optimization
10. ✅ App store publishing

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit PR

## 📄 License

ISC License

---

**Happy Coding! 📱💚**
