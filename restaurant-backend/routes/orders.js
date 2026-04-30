const express = require('express');
const router = express.Router();
const pool = require('../db');

// Create a new order
router.post('/', async (req, res) => {
  const { tableNumber, items, specialInstructions } = req.body;
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Create order
    const orderResult = await client.query(
      `INSERT INTO orders (table_number, status, total_amount) 
       VALUES ($1, $2, $3) RETURNING id`,
      [tableNumber, 'pending', 0]
    );
    const orderId = orderResult.rows[0].id;
    
    let totalAmount = 0;
    
    // Add order items
    for (const item of items) {
      // Get current price
      const priceResult = await client.query(
        'SELECT price FROM menu_items WHERE id = $1',
        [item.menuItemId]
      );
      
      if (priceResult.rows.length === 0) {
        throw new Error(`Menu item ${item.menuItemId} not found`);
      }
      
      const price = priceResult.rows[0].price;
      const itemTotal = price * item.quantity;
      totalAmount += itemTotal;
      
      await client.query(
        `INSERT INTO order_items (order_id, menu_item_id, quantity, price_at_time, special_instructions)
         VALUES ($1, $2, $3, $4, $5)`,
        [orderId, item.menuItemId, item.quantity, price, item.specialInstructions || null]
      );
    }
    
    // Update order total
    await client.query(
      'UPDATE orders SET total_amount = $1 WHERE id = $2',
      [totalAmount, orderId]
    );
    
    await client.query('COMMIT');
    
    res.status(201).json({ 
      orderId, 
      totalAmount,
      message: 'Order created successfully' 
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Order creation error:', err);
    res.status(500).json({ error: 'Failed to create order' });
  } finally {
    client.release();
  }
});

// Get all orders (with optional status filter)
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT o.*, u.username as created_by,
      COALESCE(
        json_agg(
          json_build_object(
            'id', oi.id,
            'menu_item_id', oi.menu_item_id,
            'quantity', oi.quantity,
            'price', oi.price_at_time,
            'name', mi.name,
            'special_instructions', oi.special_instructions
          ) ORDER BY oi.id
        ) FILTER (WHERE oi.id IS NOT NULL), '[]'
      ) as items
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
    `;
    
    const params = [];
    if (status) {
      query += ' WHERE o.status = $1';
      params.push(status);
    }
    
    query += ' GROUP BY o.id, u.username ORDER BY o.created_at DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Update order status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const result = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Get single order
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const orderResult = await pool.query(`
      SELECT o.*, u.username as created_by
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = $1
    `, [id]);
    
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const itemsResult = await pool.query(`
      SELECT oi.*, mi.name, mi.description
      FROM order_items oi
      JOIN menu_items mi ON oi.menu_item_id = mi.id
      WHERE oi.order_id = $1
    `, [id]);
    
    const order = orderResult.rows[0];
    order.items = itemsResult.rows;
    
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

module.exports = router;