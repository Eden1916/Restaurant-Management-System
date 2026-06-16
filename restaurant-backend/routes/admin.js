const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

// GET all users (admin only)
router.get('/users', authenticate, authorize('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, email, role, is_active, created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ success: true, users: result.rows });
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
});

// PUT update user role (admin only)
router.put('/users/:userId/role', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { userId } = req.params;
    const { newRole } = req.body;

    const allowedRoles = ['admin', 'chef', 'waiter', 'customer'];
    if (!allowedRoles.includes(newRole)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    // Prevent admin from demoting themselves
    if (parseInt(userId) === req.user.userId && newRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'Cannot demote yourself' });
    }

    const result = await pool.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, username, email, role',
      [newRole, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error('Update role error:', err);
    res.status(500).json({ success: false, message: 'Failed to update role' });
  }
});

module.exports = router;
