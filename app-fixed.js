// filepath: app-fixed.js
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

// Get all products
app.get('/api/products', (req, res) => {
  db.all("SELECT * FROM products", (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Add item to cart
app.post('/api/cart/add', (req, res) => {
  const { product_id, quantity } = req.body;
  
  if (!product_id || !quantity) {
    return res.status(400).json({ error: 'Product ID and quantity required' });
  }

  // Input validation: ensure quantity is positive
  if (quantity <= 0) {
    return res.status(400).json({ error: 'Quantity must be positive' });
  }

  db.run(
    "INSERT INTO cart (product_id, quantity) VALUES (?, ?)",
    [product_id, quantity],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to add to cart' });
      }
      res.json({ message: 'Item added to cart', cart_id: this.lastID });
    }
  );
});

// Get cart contents
app.get('/api/cart', (req, res) => {
  const query = `
    SELECT c.id, c.quantity, p.name, p.price, (c.quantity * p.price) as subtotal
    FROM cart c
    JOIN products p ON c.product_id = p.id
  `;
  
  db.all(query, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    const total = rows.reduce((sum, item) => sum + item.subtotal, 0);
    res.json({ items: rows, total: total.toFixed(2) });
  });
});

// Create order (checkout)
app.post('/api/checkout', (req, res) => {
  // Get cart total
  const cartQuery = `
    SELECT c.quantity, p.price, p.id as product_id
    FROM cart c
    JOIN products p ON c.product_id = p.id
  `;
  
  db.all(cartQuery, (err, cartItems) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }
    
    const total = cartItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    
    // Create order
    db.run(
      "INSERT INTO orders (total_amount, status) VALUES (?, 'completed')",
      [total],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to create order' });
        }
        
        const orderId = this.lastID;
        
        // Clear cart after successful checkout
        db.run("DELETE FROM cart", (err) => {
          if (err) {
            console.error('Error clearing cart:', err);
          }
        });
        
        res.json({ 
          message: 'Order created successfully', 
          order_id: orderId,
          total: total.toFixed(2)
        });
      }
    );
  });
});

// FIXED: Secure refund processing with proper validation
app.post('/api/refund', (req, res) => {
  const { order_id, refund_amount } = req.body;
  
  if (!order_id || refund_amount === undefined) {
    return res.status(400).json({ error: 'Order ID and refund amount required' });
  }
  
  // FIX 1: Input validation - ensure refund amount is a valid positive number
  const refundValue = parseFloat(refund_amount);
  if (isNaN(refundValue) || refundValue <= 0) {
    return res.status(400).json({ 
      error: 'Invalid refund amount. Refund amount must be a positive number.' 
    });
  }
  
  db.get("SELECT * FROM orders WHERE id = ?", [order_id], (err, order) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // FIX 2: Business logic validation - ensure refund doesn't exceed order total
    if (refundValue > order.total_amount) {
      return res.status(400).json({ 
        error: `Refund amount ($${refundValue.toFixed(2)}) cannot exceed order total ($${order.total_amount.toFixed(2)})` 
      });
    }
    
    // FIX 3: Prevent refunding already refunded orders
    if (order.status === 'refunded') {
      return res.status(400).json({ 
        error: 'This order has already been refunded' 
      });
    }
    
    // Calculate new total (original - refund)
    const newTotal = order.total_amount - refundValue;
    
    db.run(
      "UPDATE orders SET total_amount = ?, status = ? WHERE id = ?",
      [newTotal, newTotal <= 0 ? 'fully_refunded' : 'partially_refunded', order_id],
      (err) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to process refund' });
        }
        
        // Secure response that doesn't reveal sensitive information
        res.json({ 
          message: 'Refund processed successfully',
          refunded_amount: refundValue.toFixed(2),
          remaining_total: newTotal.toFixed(2),
          order_status: newTotal <= 0 ? 'fully_refunded' : 'partially_refunded'
        });
      }
    );
  });
});

// Get order details
app.get('/api/orders/:id', (req, res) => {
  const orderId = req.params.id;
  
  // Input validation for order ID
  if (!orderId || isNaN(parseInt(orderId))) {
    return res.status(400).json({ error: 'Invalid order ID' });
  }
  
  db.get("SELECT * FROM orders WHERE id = ?", [orderId], (err, order) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
  });
});

// Clear cart (for demo reset)
app.delete('/api/cart/clear', (req, res) => {
  db.run("DELETE FROM cart", (err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to clear cart' });
    }
    res.json({ message: 'Cart cleared' });
  });
});

app.listen(PORT, () => {
  console.log(`🛒 Shopping cart server running at http://localhost:${PORT}`);
  console.log(`✅ SECURE VERSION - Refund system with proper validation!`);
  console.log(`🔒 Features: Input validation, business logic checks, secure error handling`);
});