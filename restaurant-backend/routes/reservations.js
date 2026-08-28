const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

// GET all reservations (admin/waiter)
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT reservations.*, users.username, users.email
       FROM reservations
       JOIN users ON reservations.user_id = users.id
       ORDER BY reservations.reservation_date DESC, reservations.reservation_time DESC`
    );
    res.json({ success: true, reservations: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch reservations' });
  }
});

// GET customer's own reservations
router.get('/my', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM reservations WHERE user_id = $1 ORDER BY reservation_date DESC`,
      [req.user.userId]
    );
    res.json({ success: true, reservations: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch reservations' });
  }
});

// POST create reservation (customer)
router.post('/', authenticate, async (req, res) => {
  const { reservation_date, reservation_time, guests, special_requests } = req.body;

  if (!reservation_date || !reservation_time || !guests) {
    return res.status(400).json({ error: 'Date, time, and number of guests are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO reservations (user_id, reservation_date, reservation_time, guests, special_requests, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING *`,
      [req.user.userId, reservation_date, reservation_time, guests, special_requests || null]
    );
    res.status(201).json({ success: true, reservation: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create reservation' });
  }
});

// PUT approve/reject reservation and assign table (admin/waiter)
router.put('/:id', authenticate, authorize('admin', 'waiter'), async (req, res) => {
  const { id } = req.params;
  const { status, table_number, special_requests } = req.body;

  const allowedStatuses = ['pending', 'approved', 'rejected', 'completed', 'cancelled'];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const result = await pool.query(
      `UPDATE reservations
       SET status = $1, table_number = $2, special_requests = $3
       WHERE id = $4
       RETURNING *`,
      [status, table_number || null, special_requests || null, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    res.json({ success: true, reservation: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update reservation' });
  }
});

module.exports = router;
