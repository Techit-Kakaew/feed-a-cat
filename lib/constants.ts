export type CountryScore = {
  id: string;
  country_code: string;
  country_name: string;
  score: number; // BigInt is returned as number/string from JS client usually, let's use number for simplicity in frontend if it fits safe integer
  updated_at: string;
};

export const RATE_LIMIT_WINDOW = 1000; // 1 second
export const RATE_LIMIT_MAX_REQUESTS = 10;
