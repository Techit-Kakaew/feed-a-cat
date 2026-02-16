import { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";

type GameState = {
  score: number;
  country: { code: string; name: string } | null;
  guestId: string | null;
  isRateLimited: boolean;
};

export function useGameLogic() {
  const [state, setState] = useState<GameState>({
    score: 0,
    country: null,
    guestId: null,
    isRateLimited: false,
  });

  // Initialize
  useEffect(() => {
    let guestId = localStorage.getItem("feedacat-guest-id");
    if (!guestId) {
      guestId = uuidv4();
      localStorage.setItem("feedacat-guest-id", guestId);
    }

    const storedCountry = localStorage.getItem("feedacat-country");
    const countryData = storedCountry ? JSON.parse(storedCountry) : null;

    if (countryData) {
      setTimeout(() => {
        setState((prev) => ({ ...prev, country: countryData, guestId }));
      }, 0);
    } else {
      fetch("https://ipapi.co/json/")
        .then((res) => res.json())
        .then((data) => {
          if (data.error) throw new Error(data.reason);
          const country = { code: data.country_code, name: data.country_name };
          localStorage.setItem("feedacat-country", JSON.stringify(country));
          setTimeout(() => {
            setState((prev) => ({ ...prev, country }));
          }, 0);
        })
        .catch((err) => {
          console.error("IPAPI Error:", err);
          const fallback = { code: "UN", name: "Unknown" };
          setTimeout(() => {
            setState((prev) => ({ ...prev, country: fallback }));
          }, 0);
        });
      setTimeout(() => {
        setState((prev) => ({ ...prev, guestId }));
      }, 0);
    }

    // Load score from local storage
    const savedScore = localStorage.getItem("feedacat-score");
    if (savedScore) {
      setTimeout(() => {
        setState((prev) => ({ ...prev, score: parseInt(savedScore, 10) }));
      }, 0);
    }
  }, []);

  const incrementScore = useCallback(() => {
    setState((prev) => {
      const newScore = prev.score + 1;
      localStorage.setItem("feedacat-score", newScore.toString());
      return { ...prev, score: newScore };
    });
  }, []);

  const addFoodAndScore = useCallback((amount: number = 1) => {
    // Increment score locally
    setState((prev) => {
      const newScore = prev.score + amount;
      localStorage.setItem("feedacat-score", newScore.toString());
      return { ...prev, score: newScore };
    });
  }, []);

  return {
    ...state,
    incrementScore,
    addFoodAndScore,
    setCountry: (c: { code: string; name: string }) => {
      localStorage.setItem("feedacat-country", JSON.stringify(c));
      setState((prev) => ({ ...prev, country: c }));
    },
  };
}
