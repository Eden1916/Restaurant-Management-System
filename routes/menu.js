const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all menu items with categories
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT m.*, c.name as category_name, c.description as category_description
      FROM menu_items m
      JOIN categories c ON m.category_id = c.id
      WHERE m.is_available = true
      ORDER BY c.sort_order, m.name
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
});

// Get menu items by category
router.get('/category/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const result = await pool.query(
      'SELECT * FROM menu_items WHERE category_id = $1 AND is_available = true',
      [categoryId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch category items' });
  }
});

// Get all categories
router.get('/categories', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM categories ORDER BY sort_order'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get single menu item
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM menu_items WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch menu item' });
  }
});

module.exports = router;