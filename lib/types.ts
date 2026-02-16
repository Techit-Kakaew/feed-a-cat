/**
 * Shared type definitions for the Feed the Cat game
 */

/**
 * Cat behavioral states
 * - EATING: Cat is actively eating (food > 0)
 * - HUNGRY: Cat is waiting for food (food === 0)
 * - REACTING: Transition state when food appears (brief animation)
 */
export type CatState = "EATING" | "HUNGRY" | "REACTING";

/**
 * Global food state from the server
 */
export interface GlobalFoodState {
  food_amount: number;
  last_consumed_at: string;
  consumption_rate: number;
  elapsed_seconds?: number;
}

/**
 * Country leaderboard entry
 */
export interface CountryScore {
  id: string;
  country_code: string;
  country_name: string;
  score: number;
  updated_at: string;
}
