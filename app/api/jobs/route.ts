import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { getSupabase, type JobRow } from '@/lib/supabase';

const YC_BASE = 'https://www.youngcapital.nl';
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
  'Accept-Language': 'nl-NL,nl;q=0.9',
};

const NEIGHBORHOOD_COORDS: Record<string, [number, number]> = {
  // Amsterdam neighbourhoods
  'centrum':        [52.3702, 4.8952],
  'jordaan':        [52.3748, 4.8806],
  'de pijp':        [52.3540, 4.8969],
  'pijp':           [52.3540, 4.8969],
  'noord':          [52.3953, 4.9088],
  'oost':           [52.3612, 4.9358],
  'west':           [52.3700, 4.8650],
  'nieuw-west':     [52.3598, 4.8268],
  'zuidoost':       [52.3121, 4.9474],
  'bijlmer':        [52.3121, 4.9474],
  'zuidas':         [52.3386, 4.8700],
  'sloterdijk':     [52.3886, 4.8363],
  'westpoort':      [52.4012, 4.8201],
  'oud-west':       [52.3641, 4.8742],
  'buitenveldert':  [52.3350, 4.8750],
  // Amsterdam metro
  'amstelveen':     [52.3100, 4.8600],
  'zaandam':        [52.4380, 4.8130],
  'haarlem':        [52.3874, 4.6462],
  'diemen':         [52.3397, 4.9603],
  'schiphol':       [52.3105, 4.7683],
  'almere':         [52.3702, 5.2158],
  // Major Dutch cities
  'amsterdam':      [52.3702, 4.8952],
  'rotterdam':      [51.9225, 4.4792],
  'den haag':       [52.0705, 4.3007],
  'the hague':      [52.0705, 4.3007],
  'utrecht':        [52.0907, 5.1214],
  'eindhoven':      [51.4416, 5.4697],
  'groningen':      [53.2194, 6.5665],
  'tilburg':        [51.5555, 5.0913],
  'almelo':         [52.3567, 6.6603],
  'breda':          [51.5719, 4.7683],
  'nijmegen':       [51.8426, 5.8546],
  'enschede':       [52.2215, 6.8937],
  'apeldoorn':      [52.2112, 5.9699],
  'arnhem':         [51.9851, 5.8987],
  'maastricht':     [50.8514, 5.6910],
  'leiden':         [52.1601, 4.4970],
  'dordrecht':      [51.8133, 4.6901],
  'zoetermeer':     [52.0574, 4.4940],
  'zwolle':         [52.5168, 6.0830],
  'deventer':       [52.2550, 6.1551],
  'delft':          [52.0116, 4.3571],
  'alkmaar':        [52.6324, 4.7534],
  'venlo':          [51.3704, 6.1724],
  'amersfoort':     [52.1561, 5.3878],
  'leeuwarden':     [53.2012, 5.7999],
  'middelburg':     [51.4988, 3.6136],
  'den bosch':      [51.6978, 5.3037],
  's-hertogenbosch':[51.6978, 5.3037],
};

function geocode(title: string, location: string): [number, number] {
  const text = (title + ' ' + location).toLowerCase();
  for (const [name, coords] of Object.entries(NEIGHBORHOOD_COORDS)) {
    if (text.includes(name)) return coords;
  }
  // Default to geographic centre of the Netherlands
  const jitter = () => (Math.random() - 0.5) * 0.4;
  return [52.1326 + jitter(), 5.2913 + jitter()];
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

async function fetchDescription(href: string): Promise<string> {
  try {
    const res = await fetch(`${YC_BASE}${href}`, { headers: HEADERS });
    if (!res.ok) return '';
    const $ = cheerio.load(await res.text());
    $('script, style, nav, header, footer').remove();
    const text = $('main, .job-opening-detail, article').first().text().replace(/\s+/g, ' ').trim();
    return text.slice(0, 2000);
  } catch {
    return '';
  }
}

async function scrapeListingPage(page: number): Promise<{ listing: Omit<JobRow, 'description'>; href: string }[]> {
  const url = page === 1
    ? `${YC_BASE}/vacatures`
    : `${YC_BASE}/vacatures?page=${page}`;

  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`YoungCapital page ${page} returned ${res.status}`);

  const $ = cheerio.load(await res.text());
  const results: { listing: Omit<JobRow, 'description'>; href: string }[] = [];

  $('a.job-opening__item').each((_, el) => {
    const $el = $(el);
    const id = $el.attr('data-job-opening-id');
    const title = $el.attr('data-job-opening-title') || $el.find('h3').text().trim();
    const category = $el.attr('data-job-opening-item-category') || '';
    const employment = $el.attr('data-job-opening-employment') || '';
    const salaryMin = $el.attr('data-job-opening-salary-min') || '';
    const salaryMax = $el.attr('data-job-opening-salary-max') || '';
    const href = $el.attr('href') || '';
    const locationText = $el.find('.nyc-icon-location').parent().find('span:last-child').text().trim() || 'Nederland';
    if (!id || !title) return;
    const [lat, lng] = geocode(title, locationText);
    results.push({
      href,
      listing: {
        id,
        title,
        category,
        type: mapEmployment(employment.split(',')[0]),
        salary: formatSalary(salaryMin, salaryMax),
        location: locationText,
        url: `${YC_BASE}${href}`,
        lat,
        lng,
        source: 'youngcapital',
      },
    });
  });

  return results;
}

async function scrapeYoungCapital(maxPages = 27): Promise<JobRow[]> {
  const allJobs: JobRow[] = [];

  for (let page = 1; page <= maxPages; page++) {
    try {
      const listings = await scrapeListingPage(page);
      if (listings.length === 0) break;

      // Fetch descriptions 3 at a time
      for (let i = 0; i < listings.length; i += 3) {
        const batch = listings.slice(i, i + 3);
        const withDesc = await Promise.all(batch.map(async ({ href, listing }) => ({
          ...listing,
          description: await fetchDescription(href),
        })));
        allJobs.push(...withDesc);
        await new Promise(r => setTimeout(r, 150));
      }
    } catch (err) {
      console.error(`YC page ${page} failed:`, err);
      break;
    }
  }

  return allJobs;
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

  try {
    const jobs = await scrapeYoungCapital();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await getSupabase().from('jobs').upsert(jobs as any[], { onConflict: 'id' });
    return NextResponse.json({ jobs, source: 'scraped', count: jobs.length });
  } catch (err) {
    console.error('Scrape failed:', err);
    return NextResponse.json({ error: 'Failed to fetch jobs', jobs: [] }, { status: 500 });
  }
}

// POST /api/jobs?pages=N — force re-scrape all pages with descriptions
export async function POST(req: NextRequest) {
  try {
    const maxPages = Math.min(parseInt(req.nextUrl.searchParams.get('pages') || '27'), 27);
    const jobs = await scrapeYoungCapital(maxPages);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await getSupabase().from('jobs').upsert(jobs as any[], { onConflict: 'id' });
    if (error) throw error;
    return NextResponse.json({ message: 'YoungCapital jobs refreshed', pages_scraped: maxPages, count: jobs.length });
  } catch (err) {
    console.error('Refresh failed:', err);
    return NextResponse.json({ error: 'Refresh failed', detail: err instanceof Error ? err.message : JSON.stringify(err) }, { status: 500 });
  }
}
