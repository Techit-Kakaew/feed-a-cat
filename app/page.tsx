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

  const [isSessionActive, setIsSessionActive] = useState(false);

  const { data: foodState } = useFoodState({
    enabled: true,
    refetchInterval: isSessionActive ? false : FOOD_CONFIG.POLL_INTERVAL,
  });
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

    // Indicate active session to pause polling
    setIsSessionActive(true);

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
      setIsSessionActive(false);

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
    <main className="min-h-screen bg-linear-to-b from-gray-900 to-gray-800 flex flex-col items-center justify-between p-4 relative overflow-hidden">
      {/* Header / Score */}
      <header className="w-full flex flex-col items-center pt-4 md:pt-8 z-10">
        <h1 className="text-3xl md:text-6xl font-black text-white drop-shadow-lg tracking-wider text-center">
          FEED A <span className="text-yellow-400">CAT</span>
        </h1>

        <div className="mt-4 md:mt-6 flex flex-col items-center">
          <motion.div
            key={score}
            initial={{ scale: 1.2, color: "#fbbf24" }}
            animate={{ scale: 1, color: "#ffffff" }}
            className="text-5xl md:text-8xl font-black text-white drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)]"
          >
            {score.toLocaleString()}
          </motion.div>
          <p className="text-white/80 mt-1 text-sm md:text-lg">Feeder Score</p>

          {country && (
            <div className="flex items-center gap-2 mt-3 md:mt-4 bg-white/10 px-3 py-1.5 md:px-4 md:py-2 rounded-full backdrop-blur-md border border-white/20">
              <Image
                src={`https://flagcdn.com/w40/${country?.code.toLowerCase()}.png`}
                alt={country?.name || "Country Flag"}
                width={24}
                height={18}
                className="w-5 h-auto md:w-6 object-cover rounded shadow-sm"
              />
              <span className="text-white font-bold text-sm md:text-base">
                {country.name}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Main Interaction Area */}
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center w-full z-10 py-6 md:py-10 gap-8 md:gap-12">
        {/* Cat Display (Non-interactive) */}
        <div className="scale-75 md:scale-100">
          <CatFeeder catState={catState} />
        </div>

        {/* Food Bowl (Interactive) */}
        <div className="scale-90 md:scale-100">
          <FoodBowl onAddFood={handleBowlClick} foodAmount={globalFoodAmount} />
        </div>
      </div>

      {/* Footer / Leaderboard */}
      <footer className="w-full flex justify-center pb-4 md:pb-8 z-10">
        <div className="w-full max-w-sm md:max-w-md">
          <LeaderboardTop5 />
        </div>
      </footer>
    </main>
  );
}
