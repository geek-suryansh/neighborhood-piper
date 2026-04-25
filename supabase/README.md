# Supabase Setup

## First-time setup

1. Create a free project at https://supabase.com
2. Go to **Settings → API** and copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - Anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Add both to `.env.local` (see `.env.local.example`)
4. Run migrations in order (see below)

## Running migrations

Go to **Supabase → SQL Editor** and run each file in order:

| File | What it does |
|------|-------------|
| `20260425000001_create_jobs.sql` | Creates the `jobs` table |
| `20260425000002_add_source_description.sql` | Adds `source` and `description` columns |
| `20260425000003_rls_policies.sql` | Disables RLS so the anon key can read/write |
| `20260425000004_add_embeddings.sql` | Enables pgvector, adds `embedding vector(1536)` to jobs, creates `profiles` table |
| `20260425000005_match_jobs_fn.sql` | Creates `match_jobs()` SQL function for cosine similarity search |

## Seeding data

After running migrations, trigger the scrapers (also embed jobs after scraping):

```bash
# YoungCapital (Amsterdam jobs)
curl -X POST https://your-app.vercel.app/api/jobs

# Olympia (all of NL, first 5 pages)
curl https://your-app.vercel.app/api/scrape-olympia

# Olympia — scrape more pages (e.g. 20 pages = ~200 jobs)
curl https://your-app.vercel.app/api/scrape-olympia?pages=20

# Embed all jobs for semantic matching (run repeatedly until remaining=0)
curl -X POST https://your-app.vercel.app/api/embed-jobs
curl -X POST "https://your-app.vercel.app/api/embed-jobs?limit=50"
```

## Schema

```sql
jobs (
  id          text primary key,   -- "olympia_123" or "6305770"
  title       text,
  category    text,
  type        text,               -- "Full-time", "Part-time", etc.
  salary      text,
  location    text,
  url         text,
  lat         float,
  lng         float,
  description text,               -- full job description
  source      text,               -- "youngcapital" | "olympia"
  scraped_at  timestamptz,
  embedding   vector(1536)        -- OpenAI text-embedding-3-small
)

profiles (
  id          uuid primary key,
  name        text,
  resume_text text,
  embedding   vector(1536),       -- embedded resume for matching
  created_at  timestamptz
)
```

## Environment variables

Add to `.env.local` and Vercel dashboard:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
OPENAI_API_KEY=sk-...           # needed for /api/embed-jobs and /api/match
```
