# calorie-counter
**Mission:** Keep track of calories consumed

## Phase 1: Planning & Setup
- [x] Define project scope and user stories for calorie tracking features
- [x] Choose technology stack: React frontend, Node.js/Express backend, SQLite database
- [x] Initialize git repository with proper .gitignore and branching strategy
- [x] Create project structure: `client/` and `server/` directories with package.json files

## Phase 2: Backend Development
- [x] Set up Express server with middleware (CORS, body-parser, helmet)
- [x] Design and implement SQLite database schema for users, foods, and meals tables
- [x] Create REST API endpoints: GET/POST/DELETE `/api/meals`, GET `/api/foods`
- [x] Implement calorie calculation logic and date-based filtering

## Phase 3: Frontend Development
- [ ] Create React app with functional components and hooks
- [ ] Build MealForm component with food name, calories, date, and meal type inputs
- [ ] Build MealList component to display meals grouped by date with total calorie summary
- [ ] Implement state management with React Context for meals data and API integration

## Phase 4: Testing & Polish
- [ ] Write unit tests for backend API endpoints using Jest and Supertest
- [ ] Write component tests for MealForm and MealList using React Testing Library
- [ ] Add responsive CSS styling and clean UI design
- [ ] Create README.md with setup instructions, API documentation, and features list
