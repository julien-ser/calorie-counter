const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/meals', require('./routes/meals'));
app.use('/api/foods', require('./routes/foods'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Basic route placeholder
app.get('/', (req, res) => {
  res.json({ message: 'Calorie Counter API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server only if this is the main module (not when required by tests)
if (require.main === module) {
  db.initialize().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  }).catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
}

module.exports = { app, db };
