/**
 * Global Food Configuration
 *
 * These constants define the behavior of the global food system.
 * Food is stored as absolute units (not percentages) and depletes over time.
 */

export const FOOD_CONFIG = {
  /**
   * Visual capacity for the bowl UI (units)
   * The progress bar shows: min(food_amount / BOWL_CAPACITY * 100, 100)
   * Food can exceed this amount, but the bar caps at 100%
   */
  BOWL_CAPACITY: 100,

  /**
   * Rate at which the cat consumes food (units per second)
   * Higher values = cat eats faster = food depletes quicker
   */
  CONSUMPTION_RATE: 5,

  /**
   * Amount of food added per click (units)
   */
  FOOD_PER_CLICK: 1,

  /**
   * How often the client polls the server for food state (milliseconds)
   */
  POLL_INTERVAL: 2000,

  /**
   * Duration of the cat's "reaction" animation when transitioning from HUNGRY to EATING (milliseconds)
   */
  REACTION_DURATION: 500,
} as const;

/**
 * Calculate the visual fill percentage for the bowl
 * @param foodAmount Current food amount (absolute units)
 * @returns Percentage (0-100) for UI display
 */
export function calculateBowlPercentage(foodAmount: number): number {
  if (FOOD_CONFIG.BOWL_CAPACITY <= 0) return 0;
  return Math.min((foodAmount / FOOD_CONFIG.BOWL_CAPACITY) * 100, 100);
}

/**
 * Calculate food depletion based on elapsed time
 * @param foodAmount Current food amount
 * @param elapsedSeconds Time elapsed since last consumption
 * @param consumptionRate Units consumed per second
 * @returns New food amount after depletion
 */
export function calculateFoodDepletion(
  foodAmount: number,
  elapsedSeconds: number,
  consumptionRate: number = FOOD_CONFIG.CONSUMPTION_RATE,
): number {
  const depleted = elapsedSeconds * consumptionRate;
  return Math.max(0, foodAmount - depleted);
}
