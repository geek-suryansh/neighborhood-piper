-- Enable RLS on applications
alter table applications enable row level security;

-- Candidates can submit applications
create policy "applications_anon_insert" on applications
  for insert with check (true);

-- Employers can read applications only for their own jobs
create policy "applications_employer_read" on applications
  for select using (
    job_id in (select id from jobs where employer_id = auth.uid())
  );
