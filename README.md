# Calorie Counter

A full-stack web application for tracking daily calorie intake with a React frontend and Node.js/Express backend.

## Current Status

**Phase 1 (Planning & Setup)**: ✅ Complete  
**Phase 2 (Backend)**: ✅ Complete - Express server with middleware, SQLite database, REST API endpoints with calorie calculation and date-based filtering fully implemented.

## Project Scope

Build a calorie tracking system that allows users to:
- Log meals with food name, calorie count, date, and meal type
- View meals grouped by date with daily calorie totals
- Query a food database for calorie information
- Filter meals by date range

## User Stories

1. **As a user**, I want to add a meal entry with food name, calories, date, and meal type (breakfast/lunch/dinner/snack) so that I can track what I eat.

2. **As a user**, I want to view all my meals grouped by date so that I can see my consumption patterns.

3. **As a user**, I want to see daily calorie totals so that I can monitor my intake against goals.

4. **As a user**, I want to delete incorrect meal entries so that my log stays accurate.

5. **As a user**, I want to filter meals by date range so that I can focus on specific periods.

6. **As a user**, I want quick access to common food calorie values so that I can log meals efficiently.

## Tech Stack

- **Frontend**: React with functional components, hooks, and Context API for state management
- **Backend**: Node.js/Express with middleware (CORS, body-parser, helmet)
- **Database**: SQLite with tables for users, foods, and meals
- **API**: RESTful endpoints for CRUD operations on meals and food lookup
- **Testing**: Jest/Supertest for backend, React Testing Library for frontend

## Features

- Meal creation with calorie tracking
- Date-based grouping and filtering
- Daily calorie summaries
- Food database integration
- Responsive UI design

## Setup Instructions

1. **Clone and install dependencies**:
   ```bash
   cd client && npm install
   cd ../server && npm install
   ```

2. **Start the backend server**:
   ```bash
   cd server && npm start
   ```
   Server runs on http://localhost:3001

3. **Start the frontend development server**:
   ```bash
   cd client && npm start
   ```
   App runs on http://localhost:3000

4. **Run tests**:
   ```bash
   cd server && npm test
   cd ../client && npm test
   ```

## API Endpoints

- `GET /api/meals` - Retrieve all meals (with optional date filtering)
- `POST /api/meals` - Create a new meal entry
- `DELETE /api/meals/:id` - Delete a meal
- `GET /api/foods` - Search food database for calorie information

## Project Structure

```
calorie-counter/
├── client/           # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   └── App.js
│   └── package.json
├── server/           # Express backend
│   ├── src/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── database/
│   └── package.json
├── TASKS.md          # Development progress
└── README.md         # This file
```
