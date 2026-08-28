const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticate } = require('../middleware/auth');

// GET all approved reviews (public — for landing page)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT reviews.*, users.username
       FROM reviews
       JOIN users ON reviews.user_id = users.id
       WHERE reviews.is_approved = true
       ORDER BY reviews.created_at DESC
       LIMIT 20`
    );
    res.json({ success: true, reviews: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// POST submit a review (must be logged in)
router.post('/', authenticate, async (req, res) => {
  const { rating, comment } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }

  try {
    // Check if user has an order or reservation (must have used the service)
    const eligible = await pool.query(
      `SELECT id FROM orders WHERE user_id = $1 AND payment_status = 'completed' LIMIT 1`,
      [req.user.userId]
    );

    if (eligible.rows.length === 0) {
      return res.status(403).json({
        error: 'You must complete an order before leaving a review'
      });
    }

    // Check if user already reviewed
    const existing = await pool.query(
      'SELECT id FROM reviews WHERE user_id = $1',
      [req.user.userId]
    );

    if (existing.rows.length > 0) {
      // Update existing review
      const result = await pool.query(
        `UPDATE reviews SET rating = $1, comment = $2, is_approved = true, created_at = NOW()
         WHERE user_id = $3 RETURNING *`,
        [rating, comment || null, req.user.userId]
      );
      return res.json({ success: true, review: result.rows[0] });
    }

    // Insert new review
    const result = await pool.query(
      `INSERT INTO reviews (user_id, rating, comment, is_approved)
       VALUES ($1, $2, $3, true) RETURNING *`,
      [req.user.userId, rating, comment || null]
    );

    res.status(201).json({ success: true, review: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

// GET check if current user can review and has already reviewed
router.get('/my', authenticate, async (req, res) => {
  try {
    const [eligible, existing] = await Promise.all([
      pool.query(
        `SELECT id FROM orders WHERE user_id = $1 AND payment_status = 'completed' LIMIT 1`,
        [req.user.userId]
      ),
      pool.query(
        'SELECT * FROM reviews WHERE user_id = $1',
        [req.user.userId]
      ),
    ]);

    res.json({
      success: true,
      canReview: eligible.rows.length > 0,
      existingReview: existing.rows[0] || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch review status' });
  }
});

module.exports = router;
