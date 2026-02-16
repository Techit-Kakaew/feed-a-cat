import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { calculateFoodDepletion } from "@/lib/food-config";

export const revalidate = 0; // Disable caching

/**
 * GET /api/food/state
 *
 * Returns the current global food state.
 * This is a READ-ONLY endpoint that calculates current food based on time elapsed.
 * Does NOT update the database to avoid write conflicts with /api/feed.
 */
export async function GET() {
  try {
    // Fetch the global food state
    const { data, error } = await supabase
      .from("global_food_state")
      .select("*")
      .eq("id", 1)
      .single();

    if (error) throw error;

    if (!data) {
      return NextResponse.json(
        { error: "Global food state not initialized" },
        { status: 500 },
      );
    }

    // Calculate elapsed time since last consumption
    const now = new Date();
    const lastConsumed = new Date(data.last_consumed_at);
    const elapsedMs = now.getTime() - lastConsumed.getTime();
    const elapsedSeconds = elapsedMs / 1000;

    // Calculate current food amount (with depletion)
    const currentFood = calculateFoodDepletion(
      Number(data.food_amount),
      elapsedSeconds,
      Number(data.consumption_rate),
    );

    return NextResponse.json({
      food_amount: currentFood,
      last_consumed_at: data.last_consumed_at,
      consumption_rate: Number(data.consumption_rate),
      elapsed_seconds: elapsedSeconds,
    });
  } catch (error) {
    console.error("Error in /api/food/state:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
