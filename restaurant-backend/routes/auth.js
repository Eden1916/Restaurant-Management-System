// routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { hashPassword, comparePassword } = require('../utils/hash');

// REGISTER - Create a new user account
router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  
  // Validate required fields
  if (!username || !email || !password) {
    return res.status(400).json({ 
      error: 'Username, email, and password are required' 
    });
  }
  
  try {
    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Username or email already exists' 
      });
    }
    
    // Hash the password
    const hashedPassword = await hashPassword(password);
    
    // Insert new user (default role is 'customer')
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, role) 
       VALUES ($1, $2, $3, 'customer') 
       RETURNING id, username, email, role`,
      [username, email, hashedPassword]
    );
    
    const user = result.rows[0];
    
    // Create JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username,
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
    
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// LOGIN - Authenticate existing user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ 
      success: false,
      message: 'Email and password are required' 
    });
  }
  
  try {
    // Find user by email
    const result = await pool.query(
      'SELECT id, username, email, password_hash, role, is_active FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    const user = result.rows[0];
    
    // Check if account is active
    if (!user.is_active) {
      return res.status(401).json({ error: 'Account is deactivated. Contact admin.' });
    }
    
    // Verify password
    const isValidPassword = await comparePassword(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    // Create JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username,
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
    
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;