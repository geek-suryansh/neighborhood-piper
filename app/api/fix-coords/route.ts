import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

async function nominatim(location: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&countrycodes=nl&format=json&limit=1`,
      { headers: { 'User-Agent': 'neighborhood-piper/1.0 (hackathon)' } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data[0]) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch {
    return null;
  }
}

// GET /api/fix-coords
// Re-geocodes every non-Amsterdam job whose location doesn't contain "amsterdam" via Nominatim.
// Safe to run multiple times — skips jobs that already have correct-looking coords.
export async function GET() {
  const { data: jobs, error } = await getSupabase()
    .from('jobs')
    .select('id, location, lat, lng')
    .not('location', 'ilike', '%amsterdam%');

  if (error || !jobs) {
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }

  let fixed = 0;
  let failed = 0;
  const failures: string[] = [];

  for (const job of jobs) {
    const coords = await nominatim(job.location);

    if (!coords) {
      failed++;
      failures.push(job.location);
      continue;
    }

    const { error: updateError } = await getSupabase()
      .from('jobs')
      .update({ lat: coords.lat, lng: coords.lng })
      .eq('id', job.id);

    if (updateError) {
      failed++;
      failures.push(job.location);
    } else {
      fixed++;
    }

    // Nominatim rate limit: 1 req/sec
    await new Promise(r => setTimeout(r, 1100));
  }

  return NextResponse.json({ fixed, failed, failures });
}
