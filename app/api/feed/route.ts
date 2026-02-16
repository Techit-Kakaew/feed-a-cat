import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW } from "@/lib/constants";
import { calculateFoodDepletion } from "@/lib/food-config";

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { guestId, countryCode, count = 1 } = body; // Default to 1 if not provided

    if (!guestId || !countryCode) {
      return NextResponse.json(
        { error: "Missing guestId or countryCode" },
        { status: 400 },
      );
    }

    // Rate Limiting Logic
    const now = Date.now();
    const guestLimit = rateLimitMap.get(guestId) || {
      count: 0,
      lastReset: now,
    };

    if (now - guestLimit.lastReset > RATE_LIMIT_WINDOW) {
      // Reset window
      guestLimit.count = 1; // Count reset to 1 (this request)
      guestLimit.lastReset = now;
    } else {
      guestLimit.count++;
    }

    rateLimitMap.set(guestId, guestLimit);

    if (guestLimit.count > RATE_LIMIT_MAX_REQUESTS) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 },
      );
    }

    // ========================================================================
    // GLOBAL FOOD STATE UPDATE
    // ========================================================================
    // Fetch current global food state
    const { data: foodState, error: foodFetchError } = await supabaseAdmin
      .from("global_food_state")
      .select("*")
      .eq("id", 1)
      .single();

    if (foodFetchError) throw foodFetchError;

    if (!foodState) {
      return NextResponse.json(
        { error: "Global food state not initialized" },
        { status: 500 },
      );
    }

    // Calculate time-based depletion
    const nowDate = new Date();
    const lastConsumed = new Date(foodState.last_consumed_at);
    const elapsedMs = nowDate.getTime() - lastConsumed.getTime();
    const elapsedSeconds = elapsedMs / 1000;

    const currentFood = calculateFoodDepletion(
      Number(foodState.food_amount),
      elapsedSeconds,
      Number(foodState.consumption_rate),
    );

    // Add user's food contribution
    const newFoodAmount = currentFood + count;

    // Update global food state
    const { error: foodUpdateError } = await supabaseAdmin
      .from("global_food_state")
      .update({
        food_amount: newFoodAmount,
        last_consumed_at: nowDate.toISOString(),
        updated_at: nowDate.toISOString(),
      })
      .eq("id", 1);

    if (foodUpdateError) throw foodUpdateError;

    // ========================================================================
    // COUNTRY SCORE UPDATE (existing logic)
    // ========================================================================
    const { data: existingCountry } = await supabaseAdmin
      .from("country_scores")
      .select("score")
      .eq("country_code", countryCode)
      .single();

    let newScore = count;
    if (existingCountry) {
      newScore = Number(existingCountry.score) + count;

      const { error: updateError } = await supabaseAdmin
        .from("country_scores")
        .update({ score: newScore, updated_at: new Date().toISOString() })
        .eq("country_code", countryCode);

      if (updateError) throw updateError;
    } else {
      // Create new country
      const { countryName } = body;
      const { error: insertError } = await supabaseAdmin
        .from("country_scores")
        .insert({
          country_code: countryCode,
          country_name: countryName || countryCode,
          score: count,
        });

      if (insertError) {
        // ignore or log
      }
    }

    return NextResponse.json({
      success: true,
      food_amount: newFoodAmount,
      country_score: newScore,
    });
  } catch (error) {
    console.error("Error in /api/feed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
