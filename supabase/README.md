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

## Seeding data

After running migrations, trigger the scrapers:

```bash
# YoungCapital (Amsterdam jobs)
curl -X POST https://your-app.vercel.app/api/jobs

# Olympia (all of NL, first 5 pages)
curl https://your-app.vercel.app/api/scrape-olympia

# Olympia — scrape more pages (e.g. 20 pages = ~200 jobs)
curl https://your-app.vercel.app/api/scrape-olympia?pages=20
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
  description text,               -- full job description (Olympia only)
  source      text,               -- "youngcapital" | "olympia"
  scraped_at  timestamptz
)
```
