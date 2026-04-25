-- Migration: create candidate profiles table
create table if not exists profiles (
  id           uuid primary key,
  email        text,
  display_name text,
  age_range    text,
  profile      jsonb not null,
  created_at   timestamptz default now()
);

-- Index email for lookup (nullable, multiple NULLs allowed)
create index if not exists profiles_email_idx on profiles(email) where email is not null;

-- Anon users may insert their own profile; no read access (profiles are private)
alter table profiles enable row level security;
create policy "anon insert" on profiles for insert with check (true);
