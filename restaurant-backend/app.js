require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');

// Import database connection
const pool = require('./db');

// Import routes
const menuRoutes = require('./routes/menu');
const orderRoutes = require('./routes/orders');
const authRoutes = require('./routes/auth');
const googleAuthRoutes = require('./routes/googleAuth');
const adminRoutes = require('./routes/admin');
const reviewRoutes = require('./routes/reviews');
const reservationRoutes = require('./routes/reservations');
const inventoryRoutes = require('./routes/inventory');
const messageRoutes = require('./routes/messages');

const app = express();

// Middleware
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "https://restaurant-management-system-kpwc0hskf-eden-sahlie-s-projects.vercel.app", "https://restaurant-management-system-d9cleqo9p-eden-sahlie-s-projects.vercel.app", "https://restaurant-management-system-git-master-eden-sahlie-s-projects.vercel.app"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Session + Passport (required for Google OAuth)
app.use(session({
  secret: process.env.SESSION_SECRET || 'liyu_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false },
}));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', googleAuthRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/messages', messageRoutes);

// Basic test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Restaurant API is running!' });
});

// Test database connection route
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as current_time');
    res.json({
      message: 'Database connected successfully!',
      time: result.rows[0].current_time
    });
  } catch (err) {
    console.error(`Database connection error:`, err.message);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;