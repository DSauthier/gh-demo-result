// filepath: app.js
const express = require('express');
const fs = require('fs');

// Set up a write stream for logging (commented out for now)
// const logStream = fs.createWriteStream('/home/ec2-user/gh-demo/app.log', { flags: 'a' });

// Helper to log to both console and file
// Helper to log to both console and file (commented out for now)
function logBoth(...args) {
  const msg = args.map(a => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ');
  console.log(msg);
  // logStream.write(msg + '\n');
}
const bodyParser = require('body-parser');
const db = require('./db');
const path = require('path');
const { setupMetricsRoutes } = require('./copilot-metrics');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

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

// Create order (checkout) - VULNERABLE: Uses client-supplied total!
app.post('/api/checkout', (req, res) => {
  // VULNERABILITY: Trust the client-supplied total instead of calculating server-side
  const { total } = req.body;

  if (total === undefined) {
    return res.status(400).json({ error: 'Total amount required' });
  }

  // Get cart items to verify cart exists and calculate real total
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

    // VULNERABILITY: Use the client-supplied total directly!
    const clientTotal = parseFloat(total);
    // Create order with client-supplied total
    db.run(
      "INSERT INTO orders (total_amount, status) VALUES (?, 'completed')",
      [clientTotal],
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
          total: clientTotal.toFixed(2)
        });
      }
    );
  });
});

// VULNERABLE: Process refund without proper validation
app.post('/api/refund', (req, res) => {
  const { order_id, refund_amount } = req.body;
  
  if (!order_id || refund_amount === undefined) {
    return res.status(400).json({ error: 'Order ID and refund amount required' });
  }
  
  // VULNERABILITY: No validation on refund amount
  // Users can input negative values to get money instead of refunding
  
  db.get("SELECT * FROM orders WHERE id = ?", [order_id], (err, order) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // CRITICAL BUG: No check if refund_amount is negative
    // A negative refund_amount will actually add money to customer account
    const newTotal = order.total_amount - refund_amount;
    
    db.run(
      "UPDATE orders SET total_amount = ?, status = 'refunded' WHERE id = ?",
      [newTotal, order_id],
      (err) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to process refund' });
        }
        
        // This message reveals the vulnerability when negative amounts are used
        res.json({ 
          message: `Refund processed successfully. New order total: $${newTotal.toFixed(2)}`,
          refunded_amount: refund_amount,
          new_total: newTotal.toFixed(2)
        });
      }
    );
  });
});

// Get order details
app.get('/api/orders/:id', (req, res) => {
  const orderId = req.params.id;
  
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

// Get all orders (for order history page)
app.get('/api/orders', (req, res) => {
  db.all("SELECT * FROM orders ORDER BY created_at DESC", (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Setup Copilot metrics routes
setupMetricsRoutes(app, 'DSauthier', 'gh-demo-result');

app.listen(PORT, HOST, () => {
  logBoth(`🛒 Shopping cart server running at http://${HOST}:${PORT}`);
  logBoth(`📊 Copilot metrics dashboard: http://${HOST}:${PORT}/copilot-metrics.html`);
  logBoth(`🔥 VULNERABLE VERSION - Refund system has security issues!`);
  logBoth(`🎯 Try: Add items to cart, checkout, then request refund with NEGATIVE amount`);
});