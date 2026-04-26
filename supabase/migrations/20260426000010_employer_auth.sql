-- Link jobs to the auth user who posted them
alter table jobs add column if not exists employer_id uuid references auth.users(id);

-- Enable RLS (was explicitly disabled in migration 003)
alter table jobs enable row level security;

-- Public can read all jobs (restores the previous open-access behaviour)
create policy "jobs_public_read" on jobs
  for select using (true);

-- Anyone (including anon scrapers and the old /post form) can insert
create policy "jobs_anon_insert" on jobs
  for insert with check (true);

-- Authenticated employers can update / delete only their own jobs
create policy "jobs_employer_update" on jobs
  for update to authenticated
  using (employer_id = auth.uid())
  with check (employer_id = auth.uid());

create policy "jobs_employer_delete" on jobs
  for delete to authenticated
  using (employer_id = auth.uid());
