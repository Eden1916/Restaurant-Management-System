// middleware/auth.js
const jwt = require('jsonwebtoken');
const pool = require('../db');

// This middleware checks if the user is authenticated
async function authenticateToken(req, res, next) {
  // 1. Get the token from the Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN_HERE"
  
  // 2. If no token, deny access
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }
  
  try {
    // 3. Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 4. Get the user from database (make sure they still exist and are active)
    const userResult = await pool.query(
      'SELECT id, username, email, role FROM users WHERE id = $1 AND is_active = true',
      [decoded.userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'User not found or inactive.' });
    }
    
    // 5. Attach user to the request object
    req.user = userResult.rows[0];
    
    // 6. Continue to the next middleware/route handler
    next();
    
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please login again.' });
    }
    return res.status(403).json({ error: 'Invalid token.' });
  }
}

module.exports = { authenticateToken };