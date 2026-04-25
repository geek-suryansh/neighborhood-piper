-- Hybrid job matching: semantic + location + hours + language
create or replace function match_jobs(
  query_embedding  vector(1536),
  match_count      int     default 20,
  user_lat         float   default null,
  user_lng         float   default null,
  hours_max        int     default null,
  user_languages   text[]  default null   -- array of ISO codes e.g. ['nl','ar','en']
)
returns table (
  id         text,
  title      text,
  category   text,
  type       text,
  salary     text,
  location   text,
  url        text,
  lat        float,
  lng        float,
  similarity float,
  score      float
)
language sql stable
as $$
  with scored as (
    select
      id, title, category, type, salary, location, url, lat, lng,

      -- Raw cosine similarity (for display)
      1 - (embedding <=> query_embedding) as similarity,

      -- ── Semantic base: 60% weight ──────────────────────────────────────
      (1 - (embedding <=> query_embedding)) * 0.60

      -- ── Location bonus: up to +0.20 ────────────────────────────────────
      -- Full bonus within 2km, scales to 0 at 15km, 0 beyond
      + case
          when user_lat is not null and lat is not null
          then greatest(0.0,
            0.20 * (1.0 - least(1.0,
              sqrt(
                pow((jobs.lat - user_lat) * 111.0, 2) +
                pow((jobs.lng - user_lng) * 68.0,  2)
              ) / 15.0
            ))
          )
          else 0.0
        end

      -- ── Hours compatibility bonus: up to +0.12 ─────────────────────────
      -- Match job type to user's available hours per week
      + case
          when hours_max is null then 0.06  -- unknown: neutral
          when hours_max <= 20 then
            case
              when type ilike '%part%'    then 0.12
              when type ilike '%flex%'    then 0.10
              when type ilike '%weekend%' then 0.08
              when type ilike '%full%'    then 0.00  -- penalise fulltime for low-hours users
              else 0.06
            end
          when hours_max >= 32 then
            case
              when type ilike '%full%'    then 0.12
              when type ilike '%flex%'    then 0.08
              when type ilike '%part%'    then 0.04
              else 0.06
            end
          else 0.06  -- 20-32 hrs: neutral
        end

      -- ── Language bonus: up to +0.08 ────────────────────────────────────
      -- Dutch speakers get bonus on all jobs (all jobs are in NL)
      -- English speakers get bonus on English-titled jobs
      + case
          when user_languages is null then 0.0
          when 'nl' = any(user_languages) then 0.08
          when 'en' = any(user_languages)
               and (title ~* '\y(the|and|for|with|join|become|word|get|start)\y'
                    or title ~* '[A-Z][a-z]+ [A-Z][a-z]+') then 0.05
          else 0.02  -- no shared language signal
        end

      as score

    from jobs
    where embedding is not null
  )
  select id, title, category, type, salary, location, url, lat, lng, similarity, score
  from scored
  order by score desc
  limit match_count;
$$;
