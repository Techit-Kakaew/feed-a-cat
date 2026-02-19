import { useEffect, useState } from "react";
import {
  useQuery,
  UseQueryOptions,
  useQueryClient,
} from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { FOOD_CONFIG, calculateFoodDepletion } from "@/lib/food-config";
import type { GlobalFoodState } from "@/lib/types";

export function useFoodState(
  options?: Partial<UseQueryOptions<GlobalFoodState>>,
) {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Subscribe to real-time changes on the global_food_state table
    console.log("Initializing Supabase Realtime subscription...");

    const channel = supabase
      .channel("food_state_updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "global_food_state",
        },
        (payload) => {
          console.log("Realtime update received 📡:", payload);
          if (payload.new) {
            queryClient.setQueryData(["foodState"], payload.new);
          }
        },
      )
      .subscribe((status) => {
        console.log(`Supabase Subscription Status: ${status}`);
        if (status === "CHANNEL_ERROR") {
          console.error("Realtime channel error - checking connection/RLS");
        }
      });

    return () => {
      console.log("Cleaning up Supabase Realtime subscription");
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const query = useQuery<GlobalFoodState>({
    queryKey: ["foodState"],
    queryFn: async () => {
      const res = await fetch("/api/food/state");
      if (!res.ok) throw new Error("Failed to fetch food state");
      return res.json();
    },
    // No polling, relied on realtime and local interpolation
    refetchInterval: false,
    staleTime: 1000 * 60 * 5,
    ...options,
  });

  // Local interpolation state
  const [interpolatedAmount, setInterpolatedAmount] = useState<number>(0);

  // Sync with query data changes
  useEffect(() => {
    if (query.data) {
      // Calculate immediate depletion based on server timestamp
      const lastAt = new Date(query.data.last_consumed_at).getTime();
      const elapsed = Math.max(0, (Date.now() - lastAt) / 1000);
      const current = calculateFoodDepletion(query.data.food_amount, elapsed);
      // Use setTimeout to avoid synchronous setState warning in Effect
      const timer = setTimeout(() => setInterpolatedAmount(current), 0);
      return () => clearTimeout(timer);
    }
  }, [query.data]);

  // Smooth local simulation timer
  const hasFood = interpolatedAmount > 0;
  useEffect(() => {
    if (!hasFood) return;

    const tickRate = 100; // Update 10 times per second for smooth UI
    const amountPerTick = (FOOD_CONFIG.CONSUMPTION_RATE * tickRate) / 1000;

    const timer = setInterval(() => {
      setInterpolatedAmount((prev) => Math.max(0, prev - amountPerTick));
    }, tickRate);

    return () => clearInterval(timer);
  }, [hasFood]);

  return {
    ...query,
    data: query.data
      ? { ...query.data, food_amount: interpolatedAmount }
      : undefined,
  };
}
