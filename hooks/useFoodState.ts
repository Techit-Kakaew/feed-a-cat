import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { FOOD_CONFIG } from "@/lib/food-config";
import type { GlobalFoodState } from "@/lib/types";

export function useFoodState(
  options?: Partial<UseQueryOptions<GlobalFoodState>>,
) {
  return useQuery<GlobalFoodState>({
    queryKey: ["foodState"],
    queryFn: async () => {
      const res = await fetch("/api/food/state");
      if (!res.ok) throw new Error("Failed to fetch food state");
      return res.json();
    },
    refetchInterval: FOOD_CONFIG.POLL_INTERVAL, // 2000ms
    staleTime: 1000,
    ...options,
  });
}
