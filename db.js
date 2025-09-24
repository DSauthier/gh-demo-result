// filepath: db.js
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

// For demo purposes, always start with a clean database
const dbFile = 'shop-demo.db';
if (fs.existsSync(dbFile)) {
  fs.unlinkSync(dbFile);
  console.log('🗑️ Previous database cleared for clean demo');
}

// Create fresh file-based database for the shopping cart demo
const db = new sqlite3.Database(dbFile);

// Initialize database with products, cart, and orders
db.serialize(() => {
  // Products table
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    stock INTEGER DEFAULT 100
  )`);

  // Cart table (session-based for demo simplicity)
  db.run(`CREATE TABLE IF NOT EXISTS cart (
    id INTEGER PRIMARY KEY,
    product_id INTEGER,
    quantity INTEGER,
    session_id TEXT DEFAULT 'demo-session',
    FOREIGN KEY (product_id) REFERENCES products (id)
  )`);

  // Orders table
  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY,
    total_amount DECIMAL(10,2),
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Order items table
  db.run(`CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY,
    order_id INTEGER,
    product_id INTEGER,
    quantity INTEGER,
    price DECIMAL(10,2),
    FOREIGN KEY (order_id) REFERENCES orders (id),
    FOREIGN KEY (product_id) REFERENCES products (id)
  )`);

  // Always seed with fresh sample products for demo
  const products = [
    ['Wireless Headphones', 79.99, 'High-quality wireless headphones with noise cancellation'],
    ['Smartphone Case', 24.99, 'Protective case for latest smartphone models'],
    ['USB Cable', 12.99, 'Fast charging USB-C cable'],
    ['Bluetooth Speaker', 49.99, 'Portable Bluetooth speaker with great sound quality'],
    ['Laptop Stand', 34.99, 'Adjustable aluminum laptop stand']
  ];
  const stmt = db.prepare("INSERT INTO products (name, price, description) VALUES (?, ?, ?)");
  products.forEach(product => {
    stmt.run(product);
  });
  stmt.finalize();

  console.log('✅ Fresh database initialized with sample products for demo');
});

module.exports = db;