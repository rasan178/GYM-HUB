const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorMiddleware = require('./middleware/errorMiddleware');
const cors = require('cors');
const path = require('path');

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

// Trust first proxy hop (Render sets X-Forwarded-*). Needed so req.protocol becomes "https" behind the proxy.
app.set('trust proxy', 1);

// ✅ CORS middleware must come after app is created
const isAllowedOrigin = (origin) => {
  if (!origin) return true; // allow non-browser/healthcheck/no-origin requests

  const allowList = new Set([
    'http://localhost:3000',
    'https://gym-hub-kappa.vercel.app',
  ]);
  if (allowList.has(origin)) return true;

  // Allow Vercel preview deployments as well (https://*.vercel.app)
  try {
    const u = new URL(origin);
    return u.protocol === 'https:' && u.hostname.endsWith('.vercel.app');
  } catch {
    return false;
  }
};

app.use(cors({
  origin: (origin, cb) => cb(null, isAllowedOrigin(origin)),
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 204,
}));
// Express 5 is stricter about wildcard routes; use a regex to match all paths.
app.options(/.*/, cors());

app.use(express.json());

// Publicly serve uploads. Add headers to avoid cross-origin policy surprises on mobile browsers.
app.use(
  '/uploads',
  cors({ origin: '*', credentials: false }),
  express.static(path.join(__dirname, 'uploads'), {
    fallthrough: true,
    setHeaders: (res) => {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    },
  })
);

// Health check endpoint for Render (configure health check path to /healthz, or keep / as needed)
app.get('/healthz', (req, res) => {
  res.status(200).json({ ok: true });
});

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

// Start schedulers
require('./scheduler/bookingScheduler')();
require('./scheduler/emailScheduler')();
require('./scheduler/membershipScheduler')();

const port = process.env.PORT || 5000; // use 5000 as default if no .env
app.listen(port, () => console.log(`Server running on port ${port}`));
