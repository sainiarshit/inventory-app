// routes/products.js
const express = require('express');
const router = express.Router();
const db = require('../../db');

// Get all products
router.get('/', (req, res) => {
  db.query('SELECT * FROM products', (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// Add new product
router.post('/', (req, res) => {
  const { name, category, price, stock, minStock, supplier, barcode } = req.body;
  const sql = `INSERT INTO products (name, category, price, stock, minStock, supplier, barcode) 
               VALUES (?, ?, ?, ?, ?, ?, ?)`;
  db.query(sql, [name, category, price, stock, minStock, supplier, barcode], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ id: result.insertId, message: 'Product added' });
  });
});

// Update product
router.put('/:id', (req, res) => {
  const { name, category, price, stock, minStock, supplier, barcode } = req.body;
  const { id } = req.params;
  const sql = `UPDATE products SET name=?, category=?, price=?, stock=?, minStock=?, supplier=?, barcode=? WHERE id=?`;
  db.query(sql, [name, category, price, stock, minStock, supplier, barcode, id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Product updated' });
  });
});

// Delete product
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM products WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Product deleted' });
  });
});

module.exports = router;
