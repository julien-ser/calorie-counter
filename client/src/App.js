import React from 'react';
import MealForm from './components/MealForm';
import MealList from './components/MealList';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="app-header">
        <h1>🍽️ Calorie Counter</h1>
        <p>Track your daily calorie intake</p>
      </header>
      <main className="app-main">
        <div className="app-container">
          <MealForm />
          <MealList />
        </div>
      </main>
      <footer className="app-footer">
        <p>Calorie Counter - Stay healthy, eat mindfully</p>
      </footer>
    </div>
  );
}

export default App;
