// backend/routes/admin.js
const express = require('express');
const router = express.Router();
const { User } = require('../db');
const { authenticate, authorize } = require('../middleware/auth'); // see below

// Only admin can access
router.put('/users/:userId/role', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { userId } = req.params;
    const { newRole } = req.body;
    
    const allowedRoles = ['admin', 'chef', 'waiter', 'customer']; // define your roles
    if (!allowedRoles.includes(newRole)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }
    
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    // Prevent admin from accidentally removing own admin role (optional safety)
    if (userId === req.user.id && newRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'Cannot demote yourself' });
    }
    
    user.role = newRole;
    await user.save();
    
    res.json({ success: true, user: { id: user.id, name: user.username, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all users (admin only)
router.get('/users', authenticate, authorize(['admin']), async (req, res) => {
  const users = await User.findAll({ attributes: { exclude: ['password'] } });
  res.json({ success: true, users });
});

module.exports = router;