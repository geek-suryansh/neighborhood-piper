-- pgvector similarity search function called by /api/match
create or replace function match_jobs(
  query_embedding vector(1536),
  match_count     int default 20
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
  similarity float
)
language sql stable
as $$
  select
    id, title, category, type, salary, location, url, lat, lng,
    1 - (embedding <=> query_embedding) as similarity
  from jobs
  where embedding is not null
  order by embedding <=> query_embedding
  limit match_count;
$$;
