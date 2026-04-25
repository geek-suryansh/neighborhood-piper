import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { getSupabase, type JobRow } from '@/lib/supabase';

const NEIGHBORHOOD_COORDS: Record<string, [number, number]> = {
  'centrum':       [52.3702, 4.8952],
  'jordaan':       [52.3748, 4.8806],
  'de pijp':       [52.3540, 4.8969],
  'pijp':          [52.3540, 4.8969],
  'noord':         [52.3953, 4.9088],
  'oost':          [52.3612, 4.9358],
  'west':          [52.3700, 4.8650],
  'nieuw-west':    [52.3598, 4.8268],
  'zuidoost':      [52.3121, 4.9474],
  'bijlmer':       [52.3121, 4.9474],
  'zuidas':        [52.3386, 4.8700],
  'sloterdijk':    [52.3886, 4.8363],
  'westpoort':     [52.4012, 4.8201],
  'oud-west':      [52.3641, 4.8742],
  'oud west':      [52.3641, 4.8742],
  'buitenveldert': [52.3350, 4.8750],
  'amstelveen':    [52.3100, 4.8600],
  'zaandam':       [52.4380, 4.8130],
  'haarlem':       [52.3874, 4.6462],
  'diemen':        [52.3397, 4.9603],
};

function geocode(title: string, location: string): [number, number] {
  const text = (title + ' ' + location).toLowerCase();
  for (const [name, coords] of Object.entries(NEIGHBORHOOD_COORDS)) {
    if (text.includes(name)) return coords;
  }
  const jitter = () => (Math.random() - 0.5) * 0.06;
  return [52.3702 + jitter(), 4.8952 + jitter()];
}

function formatSalary(min: string, max: string): string {
  const lo = parseFloat(min);
  const hi = parseFloat(max);
  if (!lo) return 'Salary on request';
  const fmt = (n: number) => n >= 100 ? `€${Math.round(n).toLocaleString('nl')}` : `€${n.toFixed(2)}`;
  const unit = lo >= 100 ? '/mo' : '/hr';
  if (!hi || lo === hi) return `${fmt(lo)}${unit}`;
  return `${fmt(lo)}–${fmt(hi)}${unit}`;
}

function mapEmployment(raw: string): string {
  const r = raw.toLowerCase();
  if (r.includes('fulltime')) return 'Full-time';
  if (r.includes('parttime')) return 'Part-time';
  if (r.includes('weekend')) return 'Weekend';
  if (r.includes('avond')) return 'Evening';
  if (r.includes('trainee')) return 'Traineeship';
  if (r.includes('tijdelijk') || r.includes('vakantie')) return 'Temporary';
  return 'Flexible';
}

async function scrapeYoungCapital(): Promise<JobRow[]> {
  const res = await fetch('https://www.youngcapital.nl/vacatures-in/amsterdam', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'nl-NL,nl;q=0.9',
    },
  });
  if (!res.ok) throw new Error(`YoungCapital returned ${res.status}`);

  const $ = cheerio.load(await res.text());
  const jobs: JobRow[] = [];

  $('a.job-opening__item').each((_, el) => {
    const $el = $(el);
    const id = $el.attr('data-job-opening-id');
    const title = $el.attr('data-job-opening-title') || $el.find('h3').text().trim();
    const category = $el.attr('data-job-opening-item-category') || '';
    const employment = $el.attr('data-job-opening-employment') || '';
    const salaryMin = $el.attr('data-job-opening-salary-min') || '';
    const salaryMax = $el.attr('data-job-opening-salary-max') || '';
    const href = $el.attr('href') || '';
    const locationText = $el.find('.nyc-icon-location').parent().find('span:last-child').text().trim() || 'Amsterdam';
    if (!id || !title) return;
    const [lat, lng] = geocode(title, locationText);
    jobs.push({ id, title, category, type: mapEmployment(employment.split(',')[0]), salary: formatSalary(salaryMin, salaryMax), location: locationText, url: `https://www.youngcapital.nl${href}`, lat, lng });
  });

  return jobs;
}

// GET /api/jobs — return stored jobs, scrape+store if table is empty
export async function GET() {
  const { data, error } = await getSupabase()
    .from('jobs')
    .select('*')
    .order('scraped_at', { ascending: false });

  if (!error && data && data.length > 0) {
    return NextResponse.json({ jobs: data, source: 'supabase', count: data.length });
  }

  // Table empty or error — scrape and seed
  try {
    const jobs = await scrapeYoungCapital();
    await getSupabase().from('jobs').upsert(jobs, { onConflict: 'id' });
    return NextResponse.json({ jobs, source: 'scraped', count: jobs.length });
  } catch (err) {
    console.error('Scrape failed:', err);
    return NextResponse.json({ error: 'Failed to fetch jobs', jobs: [] }, { status: 500 });
  }
}

// POST /api/jobs — force re-scrape and upsert (called by cron or manually)
export async function POST() {
  try {
    const jobs = await scrapeYoungCapital();
    const { error } = await getSupabase().from('jobs').upsert(jobs, { onConflict: 'id' });
    if (error) throw error;
    return NextResponse.json({ message: 'Jobs refreshed', count: jobs.length });
  } catch (err) {
    console.error('Refresh failed:', err);
    return NextResponse.json({ error: 'Refresh failed' }, { status: 500 });
  }
}
