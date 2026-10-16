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

// POST create user (admin only)
router.post('/users', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email and password are required' });
    }
    const allowedRoles = ['admin', 'chef', 'waiter', 'customer'];
    const userRole = allowedRoles.includes(role) ? role : 'customer';

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, role)
       VALUES ($1, $2, $3, $4) RETURNING id, username, email, role`,
      [username, email, hashedPassword, userRole]
    );
    res.status(201).json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// PUT restore deactivated user (must be before /:userId)
router.put('/users/:userId/restore', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(
      'UPDATE users SET is_active = true WHERE id = $1 RETURNING id, username, email, role',
      [userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to restore user' });
  }
});

// PUT update user role (must be before /:userId)
router.put('/users/:userId/role', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { userId } = req.params;
    const { newRole } = req.body;

    const allowedRoles = ['admin', 'chef', 'waiter', 'customer'];
    if (!allowedRoles.includes(newRole)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

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

// PUT update user (generic — must be after specific routes)
router.put('/users/:userId', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { userId } = req.params;
    const { username, email, password, role } = req.body;

    const allowedRoles = ['admin', 'chef', 'waiter', 'customer'];
    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    let query, values;
    if (password) {
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash(password, 10);
      query = `UPDATE users SET username=$1, email=$2, password_hash=$3, role=$4 WHERE id=$5 RETURNING id, username, email, role`;
      values = [username, email, hashedPassword, role, userId];
    } else {
      query = `UPDATE users SET username=$1, email=$2, role=$3 WHERE id=$4 RETURNING id, username, email, role`;
      values = [username, email, role, userId];
    }

    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE user (admin only) — soft delete by deactivating
router.delete('/users/:userId', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { userId } = req.params;

    if (parseInt(userId) === req.user.userId) {
      return res.status(403).json({ error: 'Cannot delete your own account' });
    }

    const result = await pool.query(
      'UPDATE users SET is_active = false WHERE id = $1 RETURNING id',
      [userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// PUT restore deactivated user
router.put('/users/:userId/restore', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(
      'UPDATE users SET is_active = true WHERE id = $1 RETURNING id, username, email, role',
      [userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to restore user' });
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
