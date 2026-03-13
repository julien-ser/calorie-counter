const request = require('supertest');
const sqlite3 = require('sqlite3').verbose();

// Set in-memory DB for testing
process.env.DB_PATH = ':memory:';

const { app, db } = require('../../index');

describe('Foods API', () => {
  const testUserId = 1;

  beforeAll(async () => {
    // Initialize database (create tables)
    await db.initialize();

    // Seed test user for created_by_user_id tests
    await new Promise((resolve, reject) => {
      db.getDB().run(
        `INSERT INTO users (id, username, email, password_hash) 
         VALUES (?, ?, ?, ?)`,
        [testUserId, 'testuser', 'test@example.com', 'hash123'],
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
    // Clear foods before each test to avoid interference
    await new Promise((resolve, reject) => {
      db.getDB().run('DELETE FROM foods', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });

  describe('GET /api/foods', () => {
    test('should return empty array when no foods exist', async () => {
      const response = await request(app).get('/api/foods');
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    test('should return all foods with created_by_username', async () => {
      // Insert test foods
      await new Promise((resolve) => {
        db.getDB().run(
          `INSERT INTO foods (id, name, calories_per_serving, serving_size, created_by_user_id) 
           VALUES (?, ?, ?, ?, ?)`,
          [1, 'Apple', 95, '1 medium', testUserId],
          resolve
        );
      });
      await new Promise((resolve) => {
        db.getDB().run(
          `INSERT INTO foods (id, name, calories_per_serving, serving_size, created_by_user_id) 
           VALUES (?, ?, ?, ?, ?)`,
          [2, 'Banana', 105, '1 medium', null],
          resolve
        );
      });

      const response = await request(app).get('/api/foods');
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);

      // Check that the food with user has created_by_username
      const foodWithUser = response.body.find(f => f.id === 1);
      expect(foodWithUser.created_by_username).toBe('testuser');

      // Check that the food without user has null created_by_username
      const foodWithoutUser = response.body.find(f => f.id === 2);
      expect(foodWithoutUser.created_by_username).toBeNull();
    });

    test('should order foods by name ascending', async () => {
      await new Promise((resolve) => {
        db.getDB().run(
          `INSERT INTO foods (name, calories_per_serving) 
           VALUES (?, ?)`,
          ['Zucchini', 20],
          resolve
        );
      });
      await new Promise((resolve) => {
        db.getDB().run(
          `INSERT INTO foods (name, calories_per_serving) 
           VALUES (?, ?)`,
          ['Apple', 95],
          resolve
        );
      });
      await new Promise((resolve) => {
        db.getDB().run(
          `INSERT INTO foods (name, calories_per_serving) 
           VALUES (?, ?)`,
          ['Banana', 105],
          resolve
        );
      });

      const response = await request(app).get('/api/foods');
      expect(response.status).toBe(200);
      expect(response.body[0].name).toBe('Apple');
      expect(response.body[1].name).toBe('Banana');
      expect(response.body[2].name).toBe('Zucchini');
    });
  });

  describe('POST /api/foods', () => {
    test('should create a food with all fields', async () => {
      const response = await request(app)
        .post('/api/foods')
        .send({
          name: 'Pizza',
          calories_per_serving: 285,
          serving_size: '1 slice',
          created_by_user_id: testUserId
        });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        name: 'Pizza',
        calories_per_serving: 285,
        serving_size: '1 slice',
        created_by_user_id: testUserId
      });
      expect(response.body.id).toBeDefined();
    });

    test('should create a food with minimal required fields', async () => {
      const response = await request(app)
        .post('/api/foods')
        .send({
          name: 'Coffee',
          calories_per_serving: 5
        });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('Coffee');
      expect(response.body.calories_per_serving).toBe(5);
      expect(response.body.serving_size).toBeNull();
      expect(response.body.created_by_user_id).toBeNull();
    });

    test('should reject missing name', async () => {
      const response = await request(app)
        .post('/api/foods')
        .send({
          calories_per_serving: 100
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Name and calories_per_serving are required');
    });

    test('should reject missing calories_per_serving', async () => {
      const response = await request(app)
        .post('/api/foods')
        .send({
          name: 'Test Food'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Name and calories_per_serving are required');
    });

    test('should reject both missing fields', async () => {
      const response = await request(app)
        .post('/api/foods')
        .send({
          serving_size: '1 cup'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Name and calories_per_serving are required');
    });

    test('should handle invalid created_by_user_id gracefully', async () => {
      const response = await request(app)
        .post('/api/foods')
        .send({
          name: 'Test Food',
          calories_per_serving: 100,
          created_by_user_id: 9999 // non-existent user
        });

      // SQLite foreign key constraint should fail if enforced, but since it's not enforced by default in SQLite3,
      // it will accept the value. This test documents current behavior.
      expect(response.status).toBe(201);
      expect(response.body.created_by_user_id).toBe(9999);
    });
  });
});
