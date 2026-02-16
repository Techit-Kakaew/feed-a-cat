import { createClient } from "@supabase/supabase-js";

// Admin client for server-side usage (API routes) to bypass RLS for writes
// Ensure this is only used in server contexts (API routes, Server Components)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);
