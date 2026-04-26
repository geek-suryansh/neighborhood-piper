import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

async function embedText(text: string): Promise<number[] | null> {
  if (!process.env.OPENAI_API_KEY) return null;
  try {
    const res = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model: 'text-embedding-3-small', input: text }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data[0].embedding as number[];
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { title, category, type, salary, description, url, location, lat, lng } = body as {
    title: string; category?: string; type?: string; salary?: string;
    description?: string; url?: string; location?: string; lat?: number; lng?: number;
  };

  if (!title?.trim()) {
    return NextResponse.json({ error: 'title is required' }, { status: 400 });
  }

  const id = crypto.randomUUID();
  const job = {
    id,
    title: title.trim(),
    category: (category as string | undefined)?.trim() || null,
    type: type || 'Flexible',
    salary: (salary as string | undefined)?.trim() || null,
    location: (location as string | undefined) || 'Amsterdam',
    lat: lat ?? 52.3702,
    lng: lng ?? 4.8952,
    url: (url as string | undefined)?.trim() || null,
    description: (description as string | undefined)?.trim() || null,
    source: 'posted',
  };

  const { error: insertError } = await getSupabase().from('jobs').insert(job);
  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // Generate and save embedding immediately so the job is matchable right away
  const embeddingText = [job.title, job.category, job.description].filter(Boolean).join(' — ');
  const embedding = await embedText(embeddingText);

  if (embedding) {
    const vectorLiteral = `[${embedding.join(',')}]`;
    await getSupabase().from('jobs').update({ embedding: vectorLiteral }).eq('id', id);
  }

  return NextResponse.json({ id, embedded: !!embedding });
}
