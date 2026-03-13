const express = require('express');
const router = express.Router();
const dbWrapper = require('../db');
const { calculateCalories } = require('../utils/calories');

// Helper to get database connection (ensures it's initialized)
const getDB = () => dbWrapper.getDB();

// GET /api/meals - Get all meals, optionally filtered by date or date range
router.get('/', (req, res) => {
  const { date, start_date, end_date } = req.query;
  let sql = `
    SELECT m.*, f.name as food_name, f.calories_per_serving
    FROM meals m
    JOIN foods f ON m.food_id = f.id
  `;
  const params = [];
  const conditions = [];

  if (date) {
    conditions.push('m.date = ?');
    params.push(date);
  }

  if (start_date && end_date) {
    conditions.push('m.date BETWEEN ? AND ?');
    params.push(start_date, end_date);
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  sql += ' ORDER BY m.date DESC, m.created_at DESC';

  getDB().all(sql, params, (err, rows) => {
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

  const numServings = servings !== undefined ? Number(servings) : 1;
  if (numServings <= 0 || isNaN(numServings)) {
    res.status(400).json({ error: 'Servings must be a positive number' });
    return;
  }

  // First get the food's calories per serving
  getDB().get('SELECT calories_per_serving FROM foods WHERE id = ?', [food_id], (err, food) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!food) {
      res.status(404).json({ error: 'Food not found' });
      return;
    }

    let total_calories;
    try {
      total_calories = calculateCalories(food.calories_per_serving, numServings);
    } catch (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    const sql = `
      INSERT INTO meals (user_id, food_id, date, meal_type, servings, total_calories)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const params = [user_id, food_id, date, meal_type, servings || 1, total_calories];

    getDB().run(sql, params, function(err) {
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

  getDB().run('DELETE FROM meals WHERE id = ?', [id], function(err) {
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

  getDB().all(sql, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

module.exports = router;
