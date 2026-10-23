const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    const result = await pool.query(
      `INSERT INTO contact_messages (name, email, subject, message)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, subject, message, status, created_at`,
      [name.trim(), email.trim(), subject.trim(), message.trim()]
    );

    res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully',
      contactMessage: result.rows[0]
    });
  } catch (err) {
    console.error('Submit contact message error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to send your message. Please try again.'
    });
  }
});

module.exports = router;
