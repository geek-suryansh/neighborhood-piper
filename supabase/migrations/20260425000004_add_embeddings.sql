-- Enable pgvector extension
create extension if not exists vector;

-- Add embedding column to jobs (1536 dims = OpenAI text-embedding-3-small)
alter table jobs add column if not exists embedding vector(1536);

-- Create profiles table for refugee resumes
create table if not exists profiles (
  id          uuid primary key default gen_random_uuid(),
  name        text,
  resume_text text not null,
  embedding   vector(1536),
  created_at  timestamptz default now()
);

-- Index for fast cosine similarity search on jobs
create index if not exists jobs_embedding_idx
  on jobs using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- Index for profiles too
create index if not exists profiles_embedding_idx
  on profiles using ivfflat (embedding vector_cosine_ops)
  with (lists = 10);

-- Disable RLS on profiles (same as jobs)
alter table profiles disable row level security;
