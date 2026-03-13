import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const MealsContext = createContext();

export const useMeals = () => {
  return useContext(MealsContext);
};

export const MealsProvider = ({ children }) => {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMeals = async (date = null) => {
    setLoading(true);
    setError(null);
    try {
      let url = 'http://localhost:3001/api/meals';
      if (date) {
        url += `?date=${date}`;
      }
      const response = await axios.get(url);
      setMeals(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addMeal = async (mealData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('http://localhost:3001/api/meals', mealData);
      await fetchMeals();
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteMeal = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`http://localhost:3001/api/meals/${id}`);
      await fetchMeals();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeals();
  }, []);

  return (
    <MealsContext.Provider value={{
      meals,
      loading,
      error,
      fetchMeals,
      addMeal,
      deleteMeal
    }}>
      {children}
    </MealsContext.Provider>
  );
};
