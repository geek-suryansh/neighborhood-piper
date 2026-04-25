-- Migration: disable RLS for public job data
-- (jobs are public read/write for the scraper using the anon key)
alter table jobs disable row level security;

-- Alternatively, use policies instead of disabling RLS:
-- alter table jobs enable row level security;
-- create policy "public read"   on jobs for select using (true);
-- create policy "public insert" on jobs for insert with check (true);
-- create policy "public update" on jobs for update using (true);
