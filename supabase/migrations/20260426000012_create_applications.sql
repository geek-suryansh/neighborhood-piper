create table if not exists applications (
  id          uuid primary key default gen_random_uuid(),
  job_id      text not null,
  candidate_name  text,
  candidate_email text not null,
  message     text,
  applied_at  timestamptz default now()
);

-- Keep it simple: no RLS, employer filters by job_id in their own jobs
alter table applications disable row level security;
