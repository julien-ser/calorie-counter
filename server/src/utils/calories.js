/**
 * Calculates total calories based on calories per serving and number of servings
 * @param {number} caloriesPerServing - Calories per single serving
 * @param {number} servings - Number of servings (must be positive)
 * @returns {number} Total calories (rounded to nearest integer)
 */
function calculateCalories(caloriesPerServing, servings) {
  if (typeof caloriesPerServing !== 'number' || typeof servings !== 'number') {
    throw new Error('Calories per serving and servings must be numbers');
  }
  if (servings <= 0 || !Number.isFinite(servings)) {
    throw new Error('Servings must be a positive number');
  }
  return Math.round(caloriesPerServing * servings);
}

module.exports = { calculateCalories };
