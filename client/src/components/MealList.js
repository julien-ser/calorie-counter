import React from 'react';
import { useMeals } from '../context/MealsContext';

const MealList = () => {
  const { meals, loading, error, deleteMeal } = useMeals();

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this meal?')) {
      try {
        await deleteMeal(id);
      } catch (err) {
        console.error('Failed to delete meal:', err);
      }
    }
  };

  const groupMealsByDate = () => {
    const groups = {};
    meals.forEach(meal => {
      const date = meal.date;
      if (!groups[date]) {
        groups[date] = {
          date,
          meals: [],
          totalCalories: 0
        };
      }
      groups[date].meals.push(meal);
      groups[date].totalCalories += meal.calories;
    });
    return Object.values(groups).sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const groupedMeals = groupMealsByDate();

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getMealTypeIcon = (type) => {
    const icons = {
      breakfast: '🌅',
      lunch: '☀️',
      dinner: '🌙',
      snack: '🍎'
    };
    return icons[type] || '🍽️';
  };

  if (loading) return <div className="loading">Loading meals...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="meal-list">
      <h2>Meal History</h2>
      {groupedMeals.length === 0 ? (
        <p>No meals logged yet. Add your first meal above!</p>
      ) : (
        groupedMeals.map(group => (
          <div key={group.date} className="date-group">
            <div className="date-header">
              <h3>{formatDate(group.date)}</h3>
              <div className="daily-total">
                <strong>Total: {group.totalCalories} cal</strong>
              </div>
            </div>
            <div className="meals-container">
              {group.meals.map(meal => (
                <div key={meal.id} className="meal-item">
                  <div className="meal-info">
                    <span className="meal-icon">{getMealTypeIcon(meal.meal_type)}</span>
                    <div className="meal-details">
                      <strong>{meal.food_name}</strong>
                      <span className="meal-type">{meal.meal_type}</span>
                      <span className="meal-calories">{meal.calories} cal</span>
                    </div>
                  </div>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(meal.id)}
                    aria-label={`Delete ${meal.food_name}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MealList;
