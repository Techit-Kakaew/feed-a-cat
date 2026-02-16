import { useQuery } from "@tanstack/react-query";
import { CountryScore } from "@/lib/types";

interface UseLeaderboardOptions {
  limit?: number;
  all?: boolean;
  enabled?: boolean;
}

export function useLeaderboard(options: UseLeaderboardOptions = {}) {
  const { limit, all, enabled = true } = options;

  return useQuery<CountryScore[]>({
    queryKey: ["leaderboard", { limit, all }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (limit) params.append("limit", limit.toString());
      if (all) params.append("all", "true");

      const res = await fetch(`/api/leaderboard?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch leaderboard");
      return res.json();
    },
    refetchInterval: 10000, // 10 seconds polling
    staleTime: 5000,
    enabled,
  });
}
