const express = require('express');
const router = express.Router();
const db = require('../db').getDB();

// GET /api/meals - Get all meals, optionally filtered by date
router.get('/', (req, res) => {
  const { date } = req.query;
  let sql = `
    SELECT m.*, f.name as food_name, f.calories_per_serving
    FROM meals m
    JOIN foods f ON m.food_id = f.id
  `;
  const params = [];

  if (date) {
    sql += ' WHERE m.date = ?';
    params.push(date);
  }

  sql += ' ORDER BY m.date DESC, m.created_at DESC';

  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// POST /api/meals - Create a new meal
router.post('/', (req, res) => {
  const { user_id, food_id, date, meal_type, servings } = req.body;

  if (!user_id || !food_id || !date || !meal_type) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  // First get the food's calories per serving
  db.get('SELECT calories_per_serving FROM foods WHERE id = ?', [food_id], (err, food) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!food) {
      res.status(404).json({ error: 'Food not found' });
      return;
    }

    const total_calories = Math.round(food.calories_per_serving * (servings || 1));

    const sql = `
      INSERT INTO meals (user_id, food_id, date, meal_type, servings, total_calories)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const params = [user_id, food_id, date, meal_type, servings || 1, total_calories];

    db.run(sql, params, function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.status(201).json({
        id: this.lastID,
        user_id,
        food_id,
        date,
        meal_type,
        servings: servings || 1,
        total_calories
      });
    });
  });
});

// DELETE /api/meals/:id - Delete a meal
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM meals WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Meal not found' });
      return;
    }
    res.json({ message: 'Meal deleted successfully' });
  });
});

// GET /api/meals/summary - Get calorie summary by date range
router.get('/summary/user/:userId', (req, res) => {
  const { userId } = req.params;
  const { start_date, end_date } = req.query;

  let sql = `
    SELECT 
      date,
      SUM(total_calories) as total_calories,
      COUNT(*) as meal_count
    FROM meals
    WHERE user_id = ?
  `;
  const params = [userId];

  if (start_date && end_date) {
    sql += ' AND date BETWEEN ? AND ?';
    params.push(start_date, end_date);
  }

  sql += ' GROUP BY date ORDER BY date DESC';

  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

module.exports = router;
