import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

function getEmail(req: NextRequest) {
  return req.headers.get('x-employer-email') ?? null;
}

export async function GET(req: NextRequest) {
  const email = getEmail(req);
  if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await getSupabaseAdmin()
    .from('jobs')
    .select('id, title, type, salary, location, scraped_at')
    .eq('contact_email', email)
    .order('scraped_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const email = getEmail(req);
  if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { error } = await getSupabaseAdmin().from('jobs').insert({
    id: crypto.randomUUID(),
    title: body.title,
    category: body.category || null,
    type: body.type,
    salary: body.salary || null,
    location: body.location,
    lat: body.lat,
    lng: body.lng,
    url: body.url || null,
    contact_email: email,
    description: body.description || null,
    source: 'posted',
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  fetch(`${req.nextUrl.origin}/api/embed-jobs`, { method: 'POST' }).catch(() => {});
  return NextResponse.json({ ok: true });
}
