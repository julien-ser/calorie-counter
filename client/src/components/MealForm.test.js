import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MealsProvider } from '../context/MealsContext';
import MealForm from '../components/MealForm';

// Mock the entire MealsContext without loading the real module
jest.mock('../context/MealsContext', () => ({
  useMeals: () => ({
    addMeal: jest.fn(),
    loading: false,
    error: null,
    fetchMeals: jest.fn(),
    deleteMeal: jest.fn()
  }),
  MealsProvider: ({ children }) => children
}));

describe('MealForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders all form fields', () => {
    render(<MealForm />);

    expect(screen.getByLabelText(/food name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/calories/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/meal type/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add meal/i })).toBeInTheDocument();
  });

  test('renders with default date (today)', () => {
    render(<MealForm />);

    const dateInput = screen.getByLabelText(/date/i);
    const today = new Date().toISOString().split('T')[0];
    expect(dateInput.value).toBe(today);
  });

  test('renders breakfast as default meal type', () => {
    render(<MealForm />);

    const mealTypeSelect = screen.getByLabelText(/meal type/i);
    expect(mealTypeSelect.value).toBe('breakfast');
  });

  test('allows user to fill out the form', async () => {
    render(<MealForm />);

    const foodInput = screen.getByLabelText(/food name/i);
    const caloriesInput = screen.getByLabelText(/calories/i);
    const dateInput = screen.getByLabelText(/date/i);
    const mealTypeSelect = screen.getByLabelText(/meal type/i);

    fireEvent.change(foodInput, { target: { value: 'Pizza' } });
    fireEvent.change(caloriesInput, { target: { value: '285' } });
    fireEvent.change(dateInput, { target: { value: '2024-01-20' } });
    fireEvent.change(mealTypeSelect, { target: { value: 'lunch' } });

    expect(foodInput).toHaveValue('Pizza');
    expect(caloriesInput).toHaveValue(285);
    expect(dateInput).toHaveValue('2024-01-20');
    expect(mealTypeSelect).toHaveValue('lunch');
  });

  test('submits form with correct data', async () => {
    const mockAddMeal = jest.fn().mockResolvedValue({});

    jest.spyOn(require('../context/MealsContext'), 'useMeals').mockReturnValue({
      addMeal: mockAddMeal,
      loading: false,
      error: null,
      fetchMeals: jest.fn(),
      deleteMeal: jest.fn()
    });

    render(<MealForm />);

    fireEvent.change(screen.getByLabelText(/food name/i), { target: { value: 'Pizza' } });
    fireEvent.change(screen.getByLabelText(/calories/i), { target: { value: '285' } });
    fireEvent.change(screen.getByLabelText(/date/i), { target: { value: '2024-01-20' } });
    fireEvent.change(screen.getByLabelText(/meal type/i), { target: { value: 'lunch' } });
    fireEvent.click(screen.getByRole('button', { name: /add meal/i }));

    expect(mockAddMeal).toHaveBeenCalledWith({
      food_name: 'Pizza',
      calories: 285,
      date: '2024-01-20',
      meal_type: 'lunch'
    });
  });

  test('resets form after successful submission', async () => {
    const mockAddMeal = jest.fn().mockResolvedValue({});

    jest.spyOn(require('../context/MealsContext'), 'useMeals').mockReturnValue({
      addMeal: mockAddMeal,
      loading: false,
      error: null,
      fetchMeals: jest.fn(),
      deleteMeal: jest.fn()
    });

    render(<MealForm />);

    const foodInput = screen.getByLabelText(/food name/i);
    const caloriesInput = screen.getByLabelText(/calories/i);

    fireEvent.change(foodInput, { target: { value: 'Pizza' } });
    fireEvent.change(caloriesInput, { target: { value: '285' } });
    fireEvent.click(screen.getByRole('button', { name: /add meal/i }));

    await waitFor(() => {
      expect(foodInput).toHaveValue('');
      expect(caloriesInput).toHaveValue(null);
    });
  });

  test('disables submit button while loading', () => {
    jest.spyOn(require('../context/MealsContext'), 'useMeals').mockReturnValue({
      addMeal: jest.fn(),
      loading: true,
      error: null,
      fetchMeals: jest.fn(),
      deleteMeal: jest.fn()
    });

    render(<MealForm />);

    const submitButton = screen.getByRole('button', { name: /adding.../i });
    expect(submitButton).toBeDisabled();
  });



  test('displays error message when addMeal fails', async () => {
    const mockAddMeal = jest.fn().mockRejectedValue(new Error('Network error'));

    jest.spyOn(require('../context/MealsContext'), 'useMeals').mockReturnValue({
      addMeal: mockAddMeal,
      loading: false,
      error: 'Network error',
      fetchMeals: jest.fn(),
      deleteMeal: jest.fn()
    });

    render(<MealForm />);

    fireEvent.change(screen.getByLabelText(/food name/i), { target: { value: 'Pizza' } });
    fireEvent.change(screen.getByLabelText(/calories/i), { target: { value: '285' } });
    fireEvent.click(screen.getByRole('button', { name: /add meal/i }));

    expect(screen.getByText(/network error/i)).toBeInTheDocument();
  });

  test('disables submit button while loading', () => {
    jest.spyOn(require('../context/MealsContext'), 'useMeals').mockReturnValue({
      addMeal: jest.fn(),
      loading: true,
      error: null,
      fetchMeals: jest.fn(),
      deleteMeal: jest.fn()
    });

    render(<MealForm />);

    const submitButton = screen.getByRole('button', { name: /adding.../i });
    expect(submitButton).toBeDisabled();
  });
});
