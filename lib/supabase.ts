import { createClient } from "@supabase/supabase-js";

// Public client for client-side usage (Read only mostly)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

// Admin client for server-side usage (API routes) to bypass RLS for writes
