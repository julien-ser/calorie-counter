const { calculateCalories } = require('../calories');

describe('calculateCalories', () => {
  test('calculates total calories correctly with integer servings', () => {
    expect(calculateCalories(100, 2)).toBe(200);
    expect(calculateCalories(250, 1)).toBe(250);
    expect(calculateCalories(50, 3)).toBe(150);
  });

  test('calculates total calories correctly with fractional servings', () => {
    expect(calculateCalories(100, 1.5)).toBe(150);
    expect(calculateCalories(200, 0.5)).toBe(100);
    expect(calculateCalories(75, 2.33)).toBeCloseTo(175, 0); // Rounds to nearest integer
  });

  test('throws error for non-positive servings', () => {
    expect(() => calculateCalories(100, 0)).toThrow('Servings must be a positive number');
    expect(() => calculateCalories(100, -1)).toThrow('Servings must be a positive number');
    expect(() => calculateCalories(100, -0.5)).toThrow('Servings must be a positive number');
  });

  test('throws error for NaN servings', () => {
    expect(() => calculateCalories(100, NaN)).toThrow('Servings must be a positive number');
  });

  test('throws error for invalid input types', () => {
    expect(() => calculateCalories('100', 2)).toThrow('Calories per serving and servings must be numbers');
    expect(() => calculateCalories(100, '2')).toThrow('Calories per serving and servings must be numbers');
    expect(() => calculateCalories(null, 2)).toThrow('Calories per serving and servings must be numbers');
  });

  test('handles large numbers', () => {
    expect(calculateCalories(1000, 10)).toBe(10000);
    expect(calculateCalories(999, 3)).toBe(2997);
  });
});
