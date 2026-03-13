const express = require('express');
const router = express.Router();
const dbWrapper = require('../db');

const getDB = () => dbWrapper.getDB();

// GET /api/foods - Get all foods
router.get('/', (req, res) => {
  const sql = `
    SELECT f.*, u.username as created_by_username
    FROM foods f
    LEFT JOIN users u ON f.created_by_user_id = u.id
    ORDER BY f.name ASC
  `;

  getDB().all(sql, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// POST /api/foods - Create a new food (optional for now)
router.post('/', (req, res) => {
  const { name, calories_per_serving, serving_size, created_by_user_id } = req.body;

  if (!name || !calories_per_serving) {
    res.status(400).json({ error: 'Name and calories_per_serving are required' });
    return;
  }

  const sql = `
    INSERT INTO foods (name, calories_per_serving, serving_size, created_by_user_id)
    VALUES (?, ?, ?, ?)
  `;
  const params = [name, calories_per_serving, serving_size || null, created_by_user_id || null];

  getDB().run(sql, params, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json({
      id: this.lastID,
      name,
      calories_per_serving,
      serving_size: serving_size || null,
      created_by_user_id: created_by_user_id || null
    });
  });
});

module.exports = router;
