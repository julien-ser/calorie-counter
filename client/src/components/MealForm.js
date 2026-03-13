import React, { useState } from 'react';
import { useMeals } from '../context/MealsContext';

const MealForm = () => {
  const { addMeal, loading, error } = useMeals();
  const [formData, setFormData] = useState({
    food_name: '',
    calories: '',
    date: new Date().toISOString().split('T')[0],
    meal_type: 'breakfast'
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addMeal({
        ...formData,
        calories: parseInt(formData.calories, 10)
      });
      setFormData({
        food_name: '',
        calories: '',
        date: new Date().toISOString().split('T')[0],
        meal_type: 'breakfast'
      });
    } catch (err) {
      console.error('Failed to add meal:', err);
    }
  };

  return (
    <div className="meal-form">
      <h2>Add Meal</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="food_name">Food Name</label>
          <input
            type="text"
            id="food_name"
            name="food_name"
            value={formData.food_name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="calories">Calories</label>
          <input
            type="number"
            id="calories"
            name="calories"
            value={formData.calories}
            onChange={handleChange}
            required
            min="0"
          />
        </div>
        <div className="form-group">
          <label htmlFor="date">Date</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="meal_type">Meal Type</label>
          <select
            id="meal_type"
            name="meal_type"
            value={formData.meal_type}
            onChange={handleChange}
            required
          >
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snack">Snack</option>
          </select>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add Meal'}
        </button>
      </form>
    </div>
  );
};

export default MealForm;
