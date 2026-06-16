const express = require('express');
const router = express.Router();
const pool = require('../db');
const path = require('path');
const multer = require('multer');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

// Multer setup for local disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  }
});

// GET all menu items
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT menu_items.*, categories.name as category_name
      FROM menu_items
      JOIN categories ON menu_items.category_id = categories.id
      WHERE menu_items.is_available = true
      ORDER BY categories.sort_order, menu_items.name
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
});

// GET all categories
router.get('/categories', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM categories ORDER BY sort_order`);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET single menu item
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT menu_items.*, categories.name as category_name
       FROM menu_items
       JOIN categories ON menu_items.category_id = categories.id
       WHERE menu_items.id = $1`,
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

// POST create menu item (supports both JSON and multipart/form-data)
router.post('/', authenticate, authorize('admin'), upload.single('image'), async (req, res) => {
  try {
    const { category_id, name, description, price, is_available } = req.body;

    if (!category_id || !name || !price) {
      return res.status(400).json({ error: 'Category, name, and price are required' });
    }

    // Use uploaded local file path or provided URL
    const image_url = req.file
      ? `/uploads/${req.file.filename}`
      : (req.body.image_url || null);

    // Convert is_available to boolean — FormData sends strings
    const isAvailable = is_available === false || is_available === 'false' ? false : true;

    const query = `
      INSERT INTO menu_items (category_id, name, description, price, is_available, image_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`;
    const values = [category_id, name, description, parseFloat(price), isAvailable, image_url];
    const result = await pool.query(query, values);

    res.status(201).json({ message: 'Menu item created successfully', item: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create menu item' });
  }
});

// PUT update menu item
router.put('/:id', authenticate, authorize('admin'), upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { category_id, name, description, price, is_available } = req.body;

    // Use uploaded local file path, or provided URL, or keep existing
    const image_url = req.file
      ? `/uploads/${req.file.filename}`
      : (req.body.image_url || null);

    // Convert is_available to boolean — FormData sends strings
    const isAvailable = is_available === false || is_available === 'false' ? false : true;

    const query = `
      UPDATE menu_items
      SET category_id = $1, name = $2, description = $3, price = $4,
          is_available = $5, image_url = COALESCE($6, image_url)
      WHERE id = $7
      RETURNING *`;
    const values = [category_id, name, description, parseFloat(price), isAvailable, image_url, id];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.json({ message: 'Menu item updated successfully', item: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
});

// DELETE (soft delete — marks as unavailable)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE menu_items SET is_available = false WHERE id = $1 RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Menu item not found" });
    }
    res.json({ message: "Menu item deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
});

module.exports = router;
