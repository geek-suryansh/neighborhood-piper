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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildProfileText(profile: any): string {
  const parts: string[] = [];

  if (profile.identity?.displayName) parts.push(profile.identity.displayName);

  if (profile.skills?.length) {
    parts.push(`Skills: ${profile.skills.join(', ')}`);
  }

  if (profile.interests?.length) {
    parts.push(`Interests: ${profile.interests.map((i: { label: string }) => i.label).join(', ')}`);
  }

  if (profile.languages?.length) {
    parts.push(`Languages: ${profile.languages.map((l: { label: string }) => l.label).join(', ')}`);
  }

  if (profile.education?.levelLabel) {
    parts.push(`Education: ${profile.education.levelLabel}`);
  }

  if (profile.aspiration?.dreamText) {
    parts.push(`Aspiration: ${profile.aspiration.dreamText}`);
  }

  if (profile.availability) {
    const days = profile.availability.days?.map((d: { full: string }) => d.full).join(', ');
    const hours = profile.availability.hoursPerWeekLabel;
    if (days) parts.push(`Available: ${days}`);
    if (hours) parts.push(`Hours per week: ${hours}`);
  }

  if (profile.demographics?.city) {
    parts.push(`Location: ${profile.demographics.city}`);
  }

  return parts.join('. ');
}

// POST /api/match
// Body: { resumeText: string, name?: string } — free text resume
//    OR { profileId: string }                  — STAP structured profile
export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OPENAI_API_KEY not set' }, { status: 500 });
  }

  const body = await req.json();
  let resumeText: string;

  if (body.profileId) {
    const { data, error } = await getSupabase()
      .from('profiles')
      .select('profile')
      .eq('id', body.profileId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Profile not found', detail: error?.message }, { status: 404 });
    }
    resumeText = buildProfileText(data.profile);
  } else if (body.resumeText && typeof body.resumeText === 'string') {
    resumeText = body.resumeText.slice(0, 8000);
  } else {
    return NextResponse.json({ error: 'Provide resumeText or profileId' }, { status: 400 });
  }

  if (resumeText.trim().length < 5) {
    return NextResponse.json({ error: 'Profile has too little text to match' }, { status: 400 });
  }

  const embedding = await embedText(resumeText);
  const vectorLiteral = `[${embedding.join(',')}]`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: jobs, error } = await (getSupabase() as any).rpc('match_jobs', {
    query_embedding: vectorLiteral,
    match_count: 20,
  });

  if (error) {
    const { data: fallback } = await getSupabase()
      .from('jobs')
      .select('id, title, category, type, salary, location, url, lat, lng')
      .limit(20);
    return NextResponse.json({ jobs: fallback, warning: 'pgvector RPC not available', profileText: resumeText });
  }

  return NextResponse.json({ jobs, profileText: resumeText });
}
