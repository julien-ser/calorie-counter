import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MealsProvider } from '../context/MealsContext';
import MealList from '../components/MealList';

// Mock the entire MealsContext without loading the real module
jest.mock('../context/MealsContext', () => ({
  useMeals: () => ({
    meals: [],
    loading: false,
    error: null,
    fetchMeals: jest.fn(),
    deleteMeal: jest.fn()
  }),
  MealsProvider: ({ children }) => children
}));

describe('MealList Component', () => {
  const mockMeals = [
    {
      id: 1,
      food_name: 'Pizza',
      calories: 285,
      date: '2024-01-20',
      meal_type: 'lunch',
      user_id: 1,
      food_id: 1
    },
    {
      id: 2,
      food_name: 'Apple',
      calories: 95,
      date: '2024-01-20',
      meal_type: 'snack',
      user_id: 1,
      food_id: 2
    },
    {
      id: 3,
      food_name: 'Chicken',
      calories: 335,
      date: '2024-01-19',
      meal_type: 'dinner',
      user_id: 1,
      food_id: 3
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  test('renders empty state when no meals', () => {
    jest.spyOn(require('../context/MealsContext'), 'useMeals').mockReturnValue({
      meals: [],
      loading: false,
      error: null,
      fetchMeals: jest.fn(),
      deleteMeal: jest.fn()
    });

    render(<MealList />);

    expect(screen.getByText(/no meals logged yet/i)).toBeInTheDocument();
  });

  test('renders loading state', () => {
    jest.spyOn(require('../context/MealsContext'), 'useMeals').mockReturnValue({
      meals: [],
      loading: true,
      error: null,
      fetchMeals: jest.fn(),
      deleteMeal: jest.fn()
    });

    render(<MealList />);

    expect(screen.getByText(/loading meals/i)).toBeInTheDocument();
  });

  test('renders error state', () => {
    jest.spyOn(require('../context/MealsContext'), 'useMeals').mockReturnValue({
      meals: [],
      loading: false,
      error: 'Failed to fetch meals',
      fetchMeals: jest.fn(),
      deleteMeal: jest.fn()
    });

    render(<MealList />);

    expect(screen.getByText(/error: failed to fetch meals/i)).toBeInTheDocument();
  });

  test('groups meals by date and shows daily totals', () => {
    jest.spyOn(require('../context/MealsContext'), 'useMeals').mockReturnValue({
      meals: mockMeals,
      loading: false,
      error: null,
      fetchMeals: jest.fn(),
      deleteMeal: jest.fn()
    });

    render(<MealList />);

    // Should have two date groups (2024-01-20 and 2024-01-19)
    const dateHeaders = screen.getAllByRole('heading', { level: 3 });
    expect(dateHeaders).toHaveLength(2);

    // Check totals for 2024-01-20 (285 + 95 = 380)
    expect(screen.getByText(/total: 380 cal/i)).toBeInTheDocument();
    // Check totals for 2024-01-19 (335)
    expect(screen.getByText(/total: 335 cal/i)).toBeInTheDocument();
  });

  test('displays meals with correct information', () => {
    jest.spyOn(require('../context/MealsContext'), 'useMeals').mockReturnValue({
      meals: mockMeals,
      loading: false,
      error: null,
      fetchMeals: jest.fn(),
      deleteMeal: jest.fn()
    });

    render(<MealList />);

    expect(screen.getByText('Pizza')).toBeInTheDocument();
    expect(screen.getByText('285 cal')).toBeInTheDocument();
    expect(screen.getByText('lunch')).toBeInTheDocument();

    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('95 cal')).toBeInTheDocument();
    expect(screen.getByText('snack')).toBeInTheDocument();
  });

  test('shows delete buttons for each meal', () => {
    jest.spyOn(require('../context/MealsContext'), 'useMeals').mockReturnValue({
      meals: mockMeals,
      loading: false,
      error: null,
      fetchMeals: jest.fn(),
      deleteMeal: jest.fn()
    });

    render(<MealList />);

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    expect(deleteButtons).toHaveLength(3);
  });

  test('calls deleteMeal when delete button is clicked and confirmed', async () => {
    const mockDeleteMeal = jest.fn().mockResolvedValue({});
    window.confirm = jest.fn(() => true);

    jest.spyOn(require('../context/MealsContext'), 'useMeals').mockReturnValue({
      meals: mockMeals,
      loading: false,
      error: null,
      fetchMeals: jest.fn(),
      deleteMeal: mockDeleteMeal
    });

    render(<MealList />);

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    await fireEvent.click(deleteButtons[0]);

    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this meal?');
    expect(mockDeleteMeal).toHaveBeenCalledWith(1);
  });

  test('does not call deleteMeal when delete is cancelled', async () => {
    const mockDeleteMeal = jest.fn();
    window.confirm = jest.fn(() => false);

    jest.spyOn(require('../context/MealsContext'), 'useMeals').mockReturnValue({
      meals: mockMeals,
      loading: false,
      error: null,
      fetchMeals: jest.fn(),
      deleteMeal: mockDeleteMeal
    });

    render(<MealList />);

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    await fireEvent.click(deleteButtons[0]);

    expect(mockDeleteMeal).not.toHaveBeenCalled();
  });

  test('renders meal type icons', () => {
    jest.spyOn(require('../context/MealsContext'), 'useMeals').mockReturnValue({
      meals: mockMeals,
      loading: false,
      error: null,
      fetchMeals: jest.fn(),
      deleteMeal: jest.fn()
    });

    render(<MealList />);

    // Check for icons (they are rendered as text/emoji)
    expect(screen.getByText('☀️')).toBeInTheDocument(); // lunch
    expect(screen.getByText('🍎')).toBeInTheDocument(); // snack
    expect(screen.getByText('🌙')).toBeInTheDocument(); // dinner
  });

  test('sorts dates in descending order', () => {
    const unorderedMeals = [
      {
        id: 1,
        food_name: 'Breakfast',
        calories: 200,
        date: '2024-01-18',
        meal_type: 'breakfast',
        user_id: 1,
        food_id: 1
      },
      {
        id: 2,
        food_name: 'Lunch',
        calories: 300,
        date: '2024-01-20',
        meal_type: 'lunch',
        user_id: 1,
        food_id: 2
      },
      {
        id: 3,
        food_name: 'Dinner',
        calories: 400,
        date: '2024-01-19',
        meal_type: 'dinner',
        user_id: 1,
        food_id: 3
      }
    ];

    jest.spyOn(require('../context/MealsContext'), 'useMeals').mockReturnValue({
      meals: unorderedMeals,
      loading: false,
      error: null,
      fetchMeals: jest.fn(),
      deleteMeal: jest.fn()
    });

    render(<MealList />);

    const dateHeaders = screen.getAllByRole('heading', { level: 3 });
    expect(dateHeaders).toHaveLength(3);

    // Check order: most recent first (2024-01-20, then 2024-01-19, then 2024-01-18)
    // The dates include full formatting like "Thursday, January 18, 2024"
    expect(dateHeaders[0]).toHaveTextContent('January 20');
    expect(dateHeaders[1]).toHaveTextContent('January 19');
    expect(dateHeaders[2]).toHaveTextContent('January 18');
  });
});
