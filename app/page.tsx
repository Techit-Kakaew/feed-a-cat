"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import CatFeeder from "@/components/CatFeeder";
import FoodBowl from "@/components/FoodBowl";
import LeaderboardTop5 from "@/components/LeaderboardTop5";
import { useGameLogic } from "@/hooks/useGameLogic";
import { motion } from "framer-motion";
import { FOOD_CONFIG } from "@/lib/food-config";
import type { CatState } from "@/lib/types";
import { useFoodState } from "@/hooks/useFoodState";
import { useFeedMutation } from "@/hooks/useFeedMutation";

export default function Home() {
  const { score, country, addFoodAndScore, guestId } = useGameLogic();

  const { data: foodState } = useFoodState();
  const feedMutation = useFeedMutation();

  const globalFoodAmount = foodState?.food_amount ?? 0;
  const [catState, setCatState] = useState<CatState>("HUNGRY");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Break the synchronous render chain to satisfy ESLint
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const [isFeedingSession, setIsFeedingSession] = useState(false);
  const feedingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle cat state changes based on food amount
  useEffect(() => {
    // We update catState based on global food amount changes
    if (globalFoodAmount > 0) {
      setTimeout(() => {
        setCatState((prev) => {
          if (prev === "HUNGRY") {
            // Transition through REACTING phase
            setTimeout(() => {
              setCatState((inner) => (inner === "REACTING" ? "EATING" : inner));
            }, FOOD_CONFIG.REACTION_DURATION);
            return "REACTING";
          }
          return "EATING";
        });
      }, 0);
    } else if (!isFeedingSession) {
      setTimeout(() => setCatState("HUNGRY"), 0);
    }
  }, [globalFoodAmount, isFeedingSession]);

  // Click batching state
  const pendingClicks = useRef(0);
  const batchTimer = useRef<NodeJS.Timeout | null>(null);

  // Handle bowl click with batching and debouncing
  const sessionStartTime = useRef<number>(0);

  const handleBowlClick = useCallback(() => {
    if (!guestId || !country) return;

    // Start local feeding session for immediate cat reaction
    setIsFeedingSession(true);
    if (feedingTimeoutRef.current) clearTimeout(feedingTimeoutRef.current);
    feedingTimeoutRef.current = setTimeout(() => {
      setIsFeedingSession(false);
    }, 5000); // Keep eating for 5s after last click

    // If this is the start of a new session, set the start time
    if (pendingClicks.current === 0) {
      sessionStartTime.current = Date.now();
    }

    // Increment pending clicks
    pendingClicks.current += 1;

    // Update local score for immediate feedback
    addFoodAndScore(FOOD_CONFIG.FOOD_PER_CLICK);

    // Check if 10 seconds has passed since the start of this session
    const elapsed = Date.now() - sessionStartTime.current;
    if (elapsed >= 10000) {
      const clicksToSend = pendingClicks.current;
      pendingClicks.current = 0;
      sessionStartTime.current = Date.now(); // Reset session timer for next batch

      feedMutation.mutate({
        guestId,
        countryCode: country.code,
        countryName: country.name,
        count: clicksToSend,
      });
    }

    // Clear existing timer for idle check
    if (batchTimer.current) {
      clearTimeout(batchTimer.current);
    }

    // Set new timer to send batch after 2000ms of no clicks (Idle fallback)
    batchTimer.current = setTimeout(() => {
      const clicksToSend = pendingClicks.current;
      pendingClicks.current = 0;
      sessionStartTime.current = 0; // Reset session tracking

      if (clicksToSend > 0) {
        feedMutation.mutate({
          guestId,
          countryCode: country.code,
          countryName: country.name,
          count: clicksToSend,
        });
      }
    }, 2000); // Wait 2s after last click
  }, [guestId, country, addFoodAndScore, feedMutation]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (batchTimer.current) {
        clearTimeout(batchTimer.current);
      }
    };
  }, []);

  if (!mounted)
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        Loading...
      </div>
    );

  return (
    <main className="relative min-h-dvh w-full bg-linear-to-b from-[#0f172a] via-[#1e293b] to-[#0f172a] flex flex-col items-center p-4 md:p-8 overflow-x-hidden">
      {/* Dynamic Background Noise/Glow */}
      <div className="absolute inset-0 opacity-20 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-500 rounded-full blur-[120px]" />
      </div>

      {/* Header Section */}
      <header className="relative w-full max-w-lg z-10 flex flex-col items-center">
        <h1 className="text-2xl md:text-6xl font-black text-white drop-shadow-lg tracking-wider text-center pt-2 md:pt-4">
          FEED A <span className="text-yellow-400">CAT</span>
        </h1>

        <div className="mt-2 md:mt-6 flex flex-col items-center">
          <motion.div
            key={score}
            initial={{ scale: 1.2, color: "#fbbf24" }}
            animate={{ scale: 1, color: "#ffffff" }}
            className="text-4xl md:text-8xl font-black text-white drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)]"
          >
            {score.toLocaleString()}
          </motion.div>

          {country && (
            <div className="flex items-center gap-1.5 mt-2 md:mt-4 bg-white/10 px-2.5 py-1 md:px-4 md:py-2 rounded-full backdrop-blur-md border border-white/20">
              <Image
                src={`https://flagcdn.com/w40/${country?.code.toLowerCase()}.png`}
                alt={country?.name || "Country Flag"}
                width={20}
                height={15}
                className="w-4 h-auto md:w-6 object-cover rounded shadow-sm"
              />
              <span className="text-white font-bold text-[10px] md:text-base">
                {country.name}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Main Interaction Area */}
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center w-full z-10 py-8 md:py-20 gap-8 md:gap-24">
        {/* Cat Display (Non-interactive) */}
        <div className="scale-90 md:scale-110 flex items-center justify-center transition-transform">
          <CatFeeder catState={catState} />
        </div>

        {/* Food Bowl (Interactive) */}
        <div className="scale-95 md:scale-110 flex items-center justify-center transition-transform">
          <FoodBowl onAddFood={handleBowlClick} foodAmount={globalFoodAmount} />
        </div>
      </div>

      {/* Footer / Leaderboard */}
      <footer className="w-full flex justify-center pb-4 md:pb-12 z-10 mt-auto">
        <div className="w-full max-w-xs md:max-w-md">
          <LeaderboardTop5 />
        </div>
      </footer>
    </main>
  );
}
