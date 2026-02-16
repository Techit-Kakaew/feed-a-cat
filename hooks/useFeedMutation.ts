import { useMutation, useQueryClient } from "@tanstack/react-query";

interface FeedParams {
  guestId: string;
  countryCode: string;
  countryName: string;
  count: number;
}

interface FeedResponse {
  success: boolean;
  food_amount: number;
  score: number;
}

export function useFeedMutation() {
  const queryClient = useQueryClient();

  return useMutation<FeedResponse, Error, FeedParams>({
    mutationFn: async (params: FeedParams) => {
      const res = await fetch("/api/feed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      if (!res.ok) throw new Error("Failed to feed");
      return res.json();
    },
    onSuccess: () => {
      // Invalidate and refetch food state
      queryClient.invalidateQueries({ queryKey: ["foodState"] });
    },
  });
}
