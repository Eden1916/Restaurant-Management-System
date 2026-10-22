const express = require('express');
const router = express.Router();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const pool = require('../db');

// ---- Safe startup logs (no secrets are printed) ----
console.log('Google callbackURL:', `${process.env.BACKEND_URL}/api/auth/google/callback`);
console.log('Client ID set:', !!process.env.GOOGLE_CLIENT_ID, '| ends with:', (process.env.GOOGLE_CLIENT_ID || '').slice(-30));
console.log('Client secret set:', !!process.env.GOOGLE_CLIENT_SECRET, '| length:', (process.env.GOOGLE_CLIENT_SECRET || '').length);

// Configure Google Strategy
passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      const username = profile.displayName || '';

      // Check whether a user with this email already exists
      let result = await pool.query(
        'SELECT id, username, email, role FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        // Make a unique username if the Google display name is taken
        const baseUsername = username.trim() || 'google_user';
        let uniqueUsername = baseUsername;
        let suffix = 1;

        while (true) {
          const existingUsername = await pool.query(
            'SELECT id FROM users WHERE username = $1',
            [uniqueUsername]
          );

          if (existingUsername.rows.length === 0) {
            break;
          }

          uniqueUsername = `${baseUsername}${suffix}`;
          suffix++;
        }

        // Create the new Google user
        result = await pool.query(
          `INSERT INTO users (username, email, password_hash, role, is_active)
           VALUES ($1, $2, $3, 'customer', true)
           RETURNING id, username, email, role`,
          [uniqueUsername, email, `google_oauth_${profile.id}`]
        );
      }

      return done(null, result.rows[0]);
    } catch (err) {
      return done(err, null);
    }
  }
));

// GET /api/auth/google — redirect to Google
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

// GET /api/auth/google/callback — Google redirects here
router.get(
  '/google/callback',

  // 1) Log every time this route is hit (to detect double requests)
  (req, res, next) => {
    console.log('Google callback hit at', new Date().toISOString());
    next();
  },

  // 2) Run Passport, and log the real error if something fails
  (req, res, next) => {
    passport.authenticate('google', { session: false }, (err, user) => {
      if (err) {
        console.error('Google OAuth error:', err.name, '|', err.code, '|', err.message);
        return res.redirect(`${process.env.FRONTEND_URL}/Login?error=google_failed`);
      }
      if (!user) {
        console.error('Google OAuth: no user returned');
        return res.redirect(`${process.env.FRONTEND_URL}/Login?error=google_failed`);
      }
      req.user = user;
      next();
    })(req, res, next);
  },

  // 3) Your original code: issue JWT and redirect to the frontend
  (req, res) => {
    const user = req.user;

    const token = jwt.sign(
      { userId: user.id, username: user.username, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    const params = new URLSearchParams({
      token,
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });

    res.redirect(`${process.env.FRONTEND_URL}/auth/google/success?${params.toString()}`);
  }
);

module.exports = router;