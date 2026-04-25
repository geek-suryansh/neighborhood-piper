import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

async function embedText(text: string): Promise<number[]> {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: 'text-embedding-3-small', input: text }),
  });
  if (!res.ok) throw new Error(`OpenAI embeddings error: ${res.status}`);
  const json = await res.json();
  return json.data[0].embedding as number[];
}

// POST /api/match
// Body: { resumeText: string, name?: string, save?: boolean }
// Returns top 20 matching jobs ranked by semantic similarity
export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OPENAI_API_KEY not set' }, { status: 500 });
  }

  const { resumeText, name, save } = await req.json();
  if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length < 10) {
    return NextResponse.json({ error: 'resumeText is required (min 10 chars)' }, { status: 400 });
  }

  const embedding = await embedText(resumeText.slice(0, 8000));
  const vectorLiteral = `[${embedding.join(',')}]`;

  // Save profile if requested
  if (save) {
    await getSupabase().from('profiles').insert({
      name: name || 'Anonymous',
      resume_text: resumeText,
      embedding: vectorLiteral,
    });
  }

  // Find top 20 jobs by cosine similarity using pgvector
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: jobs, error } = await (getSupabase() as any).rpc('match_jobs', {
    query_embedding: vectorLiteral,
    match_count: 20,
  });

  if (error) {
    // Fallback: if RPC not set up, do a plain select and note embeddings may be null
    const { data: fallback } = await getSupabase()
      .from('jobs')
      .select('id, title, category, type, salary, location, url, lat, lng')
      .limit(20);
    return NextResponse.json({ jobs: fallback, warning: 'pgvector RPC not set up — returning unranked jobs', error: error.message });
  }

  return NextResponse.json({ jobs });
}
