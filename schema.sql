-- Create the table for country scores
create table public.country_scores (
  id uuid primary key default gen_random_uuid(),
  country_code text unique not null,
  country_name text not null,
  score bigint default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table public.country_scores enable row level security;

-- Create policy to allow public read access
create policy "Allow public read access"
  on public.country_scores
  for select
  to public
  using (true);

-- Create policy to allow service role updates (API only)
-- Note: Service role bypasses RLS, but it's good practice to have explicit policies or rely on service role.
-- If we want to be strict, we can add a policy that allows update only if specific condition met, 
-- but since we use service_role backend client, it bypasses RLS by default.
-- So no specific policy needed for UPDATE if we only write from backend with admin key.
-- However, we must ensure ANON cannot update.
-- By default, if no policy for UPDATE exists, it is denied for public.

-- Optional: Create an index on score for faster leaderboard sorting
create index country_scores_score_idx on public.country_scores (score desc);

-- Seed some initial data (optional)
-- insert into public.country_scores (country_code, country_name) values ('TH', 'Thailand');

-- ============================================================================
-- Global Food State Table
-- ============================================================================
-- This table maintains a single global food state shared by all users.
-- The cat eats from this global pool, and food depletes over time.

create table public.global_food_state (
  id integer primary key default 1 check (id = 1), -- Enforce single row
  food_amount bigint not null default 0,
  last_consumed_at timestamp with time zone not null default now(),
  consumption_rate numeric not null default 5.0, -- units per second
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- Enable RLS
alter table public.global_food_state enable row level security;

-- Allow public read access (users need to see current food state)
create policy "Allow public read access to food state"
  on public.global_food_state
  for select
  to public
  using (true);

-- Initialize with single row
insert into public.global_food_state (id, food_amount, last_consumed_at)
values (1, 0, now())
on conflict (id) do nothing;

-- Index for fast updates
create index idx_global_food_last_consumed on public.global_food_state(last_consumed_at);
