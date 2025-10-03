const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorMiddleware = require('./middleware/errorMiddleware');
const cors = require('cors');

// Import models
require('./models/Counter');
require('./models/User');
require('./models/Testimonial');
require('./models/Booking');
require('./models/Trainer');
require('./models/Membership');
require('./models/MembershipRequest');
require('./models/Class');
require('./models/Plan');
require('./models/Session');
require('./models/Question');

dotenv.config();
connectDB();

const app = express(); // ✅ initialize app first

// ✅ CORS middleware must come after app is created
app.use(cors({
  origin: ['http://localhost:3000'],  // your Next.js frontend
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true, // if you send cookies/auth headers
}));

app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/trainers', require('./routes/trainerRoutes'));
app.use('/api/classes', require('./routes/classRoutes'));
app.use('/api/memberships', require('./routes/membershipRoutes'));
app.use('/api/membership-requests', require('./routes/membershipRequestRoutes'));
app.use('/api/plans', require('./routes/planRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/testimonials', require('./routes/testimonialRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/sessions', require('./routes/sessionRoutes'));
app.use('/api/questions', require('./routes/questionRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Error middleware
app.use(errorMiddleware);

// Start booking status scheduler
// require('./scheduler/membershipScheduler')();
require('./scheduler/bookingScheduler')();
require('./scheduler/emailScheduler')();

const port = process.env.PORT || 5000; // use 5000 as default if no .env
app.listen(port, () => console.log(`Server running on port ${port}`));
