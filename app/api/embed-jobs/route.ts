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

// POST /api/embed-jobs — embed all jobs that don't have an embedding yet
// ?limit=N to cap how many to process in one call (default 50, Vercel timeout ~30s)
export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OPENAI_API_KEY not set' }, { status: 500 });
  }

  const limit = Math.min(parseInt(req.nextUrl.searchParams.get('limit') || '50'), 200);

  const { data: jobs, error } = await getSupabase()
    .from('jobs')
    .select('id, title, category, description')
    .is('embedding', null)
    .limit(limit);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!jobs || jobs.length === 0) {
    return NextResponse.json({ message: 'All jobs already embedded', processed: 0 });
  }

  let processed = 0;
  let failed = 0;
  let lastError = '';

  for (const job of jobs) {
    try {
      const text = [job.title, job.category, job.description].filter(Boolean).join(' — ');
      const embedding = await embedText(text);
      const vectorLiteral = `[${embedding.join(',')}]`;
      const { error: updateError } = await getSupabase().from('jobs').update({ embedding: vectorLiteral }).eq('id', job.id);
      if (updateError) throw new Error(`Supabase: ${updateError.message}`);
      processed++;
    } catch (err) {
      failed++;
      lastError = err instanceof Error ? err.message : String(err);
    }
    await new Promise(r => setTimeout(r, 20));
  }

  const { count } = await getSupabase()
    .from('jobs')
    .select('*', { count: 'exact', head: true })
    .is('embedding', null);

  return NextResponse.json({ processed, failed, remaining: count ?? 0, lastError: lastError || undefined });
}
