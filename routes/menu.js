const express = require('express');
const router = express.Router();
const pool = require('../db');
const {authenticateToken} = require('../middleware/auth');
const {authorize} = require('../middleware/role')


router.get('/', async (req, res)=> {
  try{
    const result = await pool.query(`
      SELECT menu_items.*, categories.name as category_name FROM menu_items JOIN categories ON menu_items.category_id = categories.id WHERE menu_items.is_available = true ORDER BY categories.sort_order, menu_items.name
      `);
      if(result.rows.length===0){
        return res.status(404).json({error: 'No menu items found'})
      }
      res.json(result.rows);
  }catch(err){
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch menu'})
  }
});

router.get('/categories', async (req, res)=>{
  try{
    const result = await pool.query(`SELECT * FROM categories ORDER BY sort_order`);
    res.json(result.rows);
  }catch(err){
    console.error(err);
    res.status(500).json({error: ' Failed to fetch categories'})
  }
})

router.get('/menu/:id', async (req, res)=>{
  try{
    const {id} = req.params.id;
    const result = await pool.query(`SELECT * FROM menu_items JOIN categories ON menu_items.categories_id = categoryies.id WHERE menu_iems.id = $1`, [id])
    if(result.rows.length === 0){
      return res.status(404).json({error: 'Menu not found'})
    }
    res.json(result.rows[0]);
  }catch(err){
    console.error(err);
    res.status(500).json({error: 'Failed to fetch menu item'})
  }
})

router.post('/', authenticateToken, authorize('admin'), async (req, res) =>{
  try{
    const {category_id, name, description, price, is_available, image_url} = req.body;
    if(!category_id || !name || !price){
      return res.status(400).json({error: 'Category, name, and price are required'})
    }
    const query = ` INSERT INTO menu_items (category_id, name, description, price, is_available, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
    const values = [category_id, name, description, price, is_available, image_url];
    const result = await pool.query(query, values);

    res.status(201).json({message: 'Menu item created successfully'})
  }catch(err){
    console.error(err);
    res.status(500).json({error: 'Failed to create menu item'})
  }
  }
);

router.put('/:id', authenticateToken, authorize('admin'), async(req, res)=>{
  try{
    const {id}= req.params.id;
    const {category_id, name, description, price, is_available, image_url} = req.body;
    const query = `UPDATE menu_items SET category_id = $1, name = $2, description = $3, price = $4, is_available = $5, image_url = $6 WHERE id = $7 RETURNING *`;
    const values =[category_id, name, description, price, is_available, image_url, id];
    const result = await pool.query(query, values);
    if(result.rows.length === 0 ){
      return res.status(404).json({error: 'Menu item not found'})
    }
    res.json({message: 'Menu item updated successfully'})
  }catch(err){
    console.error(err);
    res.status(500).json({error: 'Failed to update menu item'})
  }
})

router.delete('/:id', authenticateToken, authorize('admin'), async(req, res)=>{
  try{
    const {id} = req.params.id;
    const query = `UPDATE menu_item SET is_available = false WHERE id = $1`

    const result = await pool.query(query,[id])
    if (result.rows.length === 0){
      res.status(404).json({error:"The menu item doesn't exist"})
    }
    res.json({message: "Menu item deleted successfully"})
  }catch(err){
    console.error(err);
    res.status(500).json({error: 'Failed to delet menu item'})
  }
}
)

module.exports = router;
/*
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

module.exports = router;*/