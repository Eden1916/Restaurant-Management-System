const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

// GET all low stock reports (admin only)
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT low_stock_reports.*, users.username as chef_name
       FROM low_stock_reports
       JOIN users ON low_stock_reports.reported_by = users.id
       ORDER BY low_stock_reports.created_at DESC`
    );
    res.json({ success: true, reports: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// GET chef's own reports
router.get('/my', authenticate, authorize('chef'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM low_stock_reports WHERE reported_by = $1 ORDER BY created_at DESC`,
      [req.user.userId]
    );
    res.json({ success: true, reports: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// POST submit a low stock report (chef only)
router.post('/', authenticate, authorize('chef'), async (req, res) => {
  const { item_name, current_quantity, unit, notes } = req.body;

  if (!item_name) {
    return res.status(400).json({ error: 'Item name is required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO low_stock_reports (reported_by, item_name, current_quantity, unit, notes)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.user.userId, item_name, current_quantity || null, unit || null, notes || null]
    );
    res.status(201).json({ success: true, report: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit report' });
  }
});

// PUT mark report as resolved (admin only)
router.put('/:id/resolve', authenticate, authorize('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE low_stock_reports SET status = 'resolved' WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json({ success: true, report: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to resolve report' });
  }
});

module.exports = router;
