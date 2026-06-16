const express = require('express');
const router = express.Router();
const axios = require('axios');
const pool = require('../db');
const { authenticate } = require('../middleware/auth');

const CHAPA_URL = 'https://api.chapa.co/v1/transaction/initialize';
const CHAPA_VERIFY_URL = 'https://api.chapa.co/v1/transaction/verify';

// POST /api/orders — place an order and initialize Chapa payment
router.post('/', authenticate, async (req, res) => {
  const {
    items,
    total_amount,
    order_type,
    delivery_address,
    delivery_phone,
    special_instructions,
    payment_method,
    bank_id,
  } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Order must have at least one item' });
  }

  try {
    const user = req.user;
    const tx_ref = `liyu-${Date.now()}-${user.userId}`;

    // 1. Create order in DB
    const orderResult = await pool.query(
      `INSERT INTO orders (
        user_id, total_amount, status, order_type,
        delivery_address, delivery_phone, special_instructions,
        payment_method, payment_status, tx_ref, bank_id
      ) VALUES ($1,$2,'pending_payment',$3,$4,$5,$6,$7,'pending',$8,$9)
      RETURNING *`,
      [
        user.userId,
        total_amount,
        order_type || 'dine_in',
        delivery_address || null,
        delivery_phone || null,
        special_instructions || null,
        payment_method || 'tele_birr',
        tx_ref,
        bank_id || null,
      ]
    );
    const order = orderResult.rows[0];

    // 2. Insert order items
    for (const item of items) {
      await pool.query(
        `INSERT INTO order_items (order_id, menu_item_id, quantity, price_at_time, special_instructions)
         VALUES ($1, $2, $3, $4, $5)`,
        [order.id, item.menu_item_id, item.quantity, item.price, item.special_instructions || null]
      );
    }

    // 3. Initialize Chapa payment
    const chapaRes = await axios.post(
      CHAPA_URL,
      {
        amount: total_amount,
        currency: 'ETB',
        email: user.email || `user${user.userId}@liyurestaurant.com`,
        first_name: user.username || 'Customer',
        last_name: 'Customer',
        tx_ref,
        callback_url: `http://localhost:5000/api/orders/verify/${tx_ref}`,
        return_url: `http://localhost:5173/customer/orders?payment=success`,
        customization: {
          title: 'Liyu Restaurant',
          description: `Order ${order.id}`,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json({
      success: true,
      order_id: order.id,
      checkout_url: chapaRes.data.data.checkout_url,
    });
  } catch (err) {
    console.error('Order/payment error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

// GET /api/orders/verify/:tx_ref — Chapa calls this after payment completes
router.get('/verify/:tx_ref', async (req, res) => {
  const { tx_ref } = req.params;

  try {
    const verifyRes = await axios.get(`${CHAPA_VERIFY_URL}/${tx_ref}`, {
      headers: { Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}` },
    });

    const chapaData = verifyRes.data.data;
    const status = chapaData.status; // 'success' or 'failed'

    if (status === 'success') {
      await pool.query(
        `UPDATE orders
         SET payment_status = 'paid',
             status = 'payment_verified',
             payment_id = $1,
             payment_reference = $2,
             payment_verified_at = NOW()
         WHERE tx_ref = $3`,
        [chapaData.id, chapaData.reference, tx_ref]
      );
    } else {
      await pool.query(
        `UPDATE orders SET payment_status = 'failed', status = 'payment_failed' WHERE tx_ref = $1`,
        [tx_ref]
      );
    }

    res.redirect(`http://localhost:5173/customer/orders?payment=${status}`);
  } catch (err) {
    console.error('Verify error:', err.response?.data || err.message);
    res.redirect('http://localhost:5173/customer/orders?payment=failed');
  }
});

// GET /api/orders/my — customer's own orders
router.get('/my', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT orders.*,
        json_agg(json_build_object(
          'name', menu_items.name,
          'quantity', order_items.quantity,
          'price', order_items.price_at_time,
          'special_instructions', order_items.special_instructions
        )) as items
       FROM orders
       JOIN order_items ON orders.id = order_items.order_id
       JOIN menu_items ON order_items.menu_item_id = menu_items.id
       WHERE orders.user_id = $1
       GROUP BY orders.id
       ORDER BY orders.created_at DESC`,
      [req.user.userId]
    );
    res.json({ success: true, orders: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET /api/orders — all orders (admin, waiter, chef)
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT orders.*, users.username,
        json_agg(json_build_object(
          'name', menu_items.name,
          'quantity', order_items.quantity,
          'price', order_items.price_at_time
        )) as items
       FROM orders
       JOIN users ON orders.user_id = users.id
       JOIN order_items ON orders.id = order_items.order_id
       JOIN menu_items ON order_items.menu_item_id = menu_items.id
       GROUP BY orders.id, users.username
       ORDER BY orders.created_at DESC`
    );
    res.json({ success: true, orders: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

module.exports = router;
