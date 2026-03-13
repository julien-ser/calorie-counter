const request = require('supertest');
const sqlite3 = require('sqlite3').verbose();

// Set in-memory DB for testing
process.env.DB_PATH = ':memory:';

const { app, db } = require('../../index');

describe('Meals API', () => {
  const testFoodId = 1;
  const testUserId = 1;

  beforeAll(async () => {
    // Initialize database (create tables)
    await db.initialize();

    // Seed test food data
    await new Promise((resolve, reject) => {
      db.getDB().run(
        `INSERT INTO foods (id, name, calories_per_serving, serving_size) 
         VALUES (?, ?, ?, ?)`,
        [testFoodId, 'Test Food', 100, '1 serving'],
        function (err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  });

  afterAll(async () => {
    await db.close();
  });

  beforeEach(async () => {
    // Clear meals before each test to avoid interference
    await new Promise((resolve, reject) => {
      db.getDB().run('DELETE FROM meals', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });

  describe('GET /api/meals', () => {
    test('should return empty array when no meals exist', async () => {
      const response = await request(app).get('/api/meals');
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    test('should filter meals by single date', async () => {
      // Insert test meals
      await new Promise((resolve) => {
        db.getDB().run(
          `INSERT INTO meals (user_id, food_id, date, meal_type, servings, total_calories) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [testUserId, testFoodId, '2024-01-15', 'breakfast', 1, 100],
          resolve
        );
      });
      await new Promise((resolve) => {
        db.getDB().run(
          `INSERT INTO meals (user_id, food_id, date, meal_type, servings, total_calories) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [testUserId, testFoodId, '2024-01-16', 'lunch', 2, 200],
          resolve
        );
      });

      const response = await request(app).get('/api/meals?date=2024-01-15');
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].date).toBe('2024-01-15');
      expect(response.body[0].total_calories).toBe(100);
    });

    test('should filter meals by date range', async () => {
      // Insert test meals
      await new Promise((resolve) => {
        db.getDB().run(
          `INSERT INTO meals (user_id, food_id, date, meal_type, servings, total_calories) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [testUserId, testFoodId, '2024-01-15', 'breakfast', 1, 100],
          resolve
        );
      });
      await new Promise((resolve) => {
        db.getDB().run(
          `INSERT INTO meals (user_id, food_id, date, meal_type, servings, total_calories) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [testUserId, testFoodId, '2024-01-16', 'lunch', 1, 100],
          resolve
        );
      });

      const response = await request(app).get('/api/meals?start_date=2024-01-15&end_date=2024-01-16');
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });

    test('should return all meals when no date filter applied', async () => {
      // Insert test meals
      await new Promise((resolve) => {
        db.getDB().run(
          `INSERT INTO meals (user_id, food_id, date, meal_type, servings, total_calories) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [testUserId, testFoodId, '2024-01-15', 'breakfast', 1, 100],
          resolve
        );
      });
      await new Promise((resolve) => {
        db.getDB().run(
          `INSERT INTO meals (user_id, food_id, date, meal_type, servings, total_calories) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [testUserId, testFoodId, '2024-01-16', 'lunch', 2, 200],
          resolve
        );
      });

      const response = await request(app).get('/api/meals');
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });

    test('should combine date and date range filters with AND logic', async () => {
      // Insert meals on different dates
      await new Promise((resolve) => {
        db.getDB().run(
          `INSERT INTO meals (user_id, food_id, date, meal_type, servings, total_calories) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [testUserId, testFoodId, '2024-01-14', 'dinner', 1.5, 150],
          resolve
        );
      });
      await new Promise((resolve) => {
        db.getDB().run(
          `INSERT INTO meals (user_id, food_id, date, meal_type, servings, total_calories) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [testUserId, testFoodId, '2024-01-15', 'breakfast', 1, 100],
          resolve
        );
      });
      await new Promise((resolve) => {
        db.getDB().run(
          `INSERT INTO meals (user_id, food_id, date, meal_type, servings, total_calories) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [testUserId, testFoodId, '2024-01-16', 'lunch', 1, 100],
          resolve
        );
      });

      const response = await request(app).get('/api/meals?date=2024-01-15&start_date=2024-01-14&end_date=2024-01-16');
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].date).toBe('2024-01-15');
    });
  });

  describe('POST /api/meals', () => {
    test('should create a meal with correct total calories', async () => {
      const response = await request(app)
        .post('/api/meals')
        .send({
          user_id: testUserId,
          food_id: testFoodId,
          date: '2024-01-20',
          meal_type: 'lunch',
          servings: 2
        });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        user_id: testUserId,
        food_id: testFoodId,
        date: '2024-01-20',
        meal_type: 'lunch',
        servings: 2,
        total_calories: 200
      });
    });

    test('should calculate calories with fractional servings', async () => {
      const response = await request(app)
        .post('/api/meals')
        .send({
          user_id: testUserId,
          food_id: testFoodId,
          date: '2024-01-21',
          meal_type: 'breakfast',
          servings: 1.5
        });

      expect(response.status).toBe(201);
      expect(response.body.total_calories).toBe(150); // 100 * 1.5 = 150
    });

    test('should default servings to 1 if not provided', async () => {
      const response = await request(app)
        .post('/api/meals')
        .send({
          user_id: testUserId,
          food_id: testFoodId,
          date: '2024-01-22',
          meal_type: 'snack'
        });

      expect(response.status).toBe(201);
      expect(response.body.servings).toBe(1);
      expect(response.body.total_calories).toBe(100);
    });

    test('should reject missing required fields', async () => {
      const response = await request(app)
        .post('/api/meals')
        .send({
          user_id: testUserId,
          food_id: testFoodId
          // missing date and meal_type
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Missing required fields');
    });

    test('should reject non-positive servings', async () => {
      const response = await request(app)
        .post('/api/meals')
        .send({
          user_id: testUserId,
          food_id: testFoodId,
          date: '2024-01-23',
          meal_type: 'dinner',
          servings: 0
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Servings must be a positive number');
    });

    test('should reject negative servings', async () => {
      const response = await request(app)
        .post('/api/meals')
        .send({
          user_id: testUserId,
          food_id: testFoodId,
          date: '2024-01-24',
          meal_type: 'lunch',
          servings: -1
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Servings must be a positive number');
    });

    test('should reject invalid food_id', async () => {
      const response = await request(app)
        .post('/api/meals')
        .send({
          user_id: testUserId,
          food_id: 999,
          date: '2024-01-25',
          meal_type: 'breakfast'
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Food not found');
    });
  });

  describe('DELETE /api/meals/:id', () => {
    test('should delete a meal', async () => {
      // First create a meal
      const postResponse = await request(app)
        .post('/api/meals')
        .send({
          user_id: testUserId,
          food_id: testFoodId,
          date: '2024-01-26',
          meal_type: 'dinner',
          servings: 1
        });

      const mealId = postResponse.body.id;

      const deleteResponse = await request(app).delete(`/api/meals/${mealId}`);
      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.message).toBe('Meal deleted successfully');

      // Verify it's gone
      const getResponse = await request(app).get(`/api/meals/${mealId}`);
      // Since there's no GET by ID, we verify by checking the list
      const allMeals = await request(app).get('/api/meals');
      const deletedMeal = allMeals.body.find(m => m.id === mealId);
      expect(deletedMeal).toBeUndefined();
    });

    test('should return 404 for non-existent meal', async () => {
      const response = await request(app).delete('/api/meals/9999');
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Meal not found');
    });
  });
});
