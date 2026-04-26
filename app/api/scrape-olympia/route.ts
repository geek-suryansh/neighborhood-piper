import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { getSupabase } from '@/lib/supabase';

const BASE = 'https://www.olympia.nl';
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
  'Accept-Language': 'nl-NL,nl;q=0.9',
};

const CITY_COORDS: Record<string, [number, number]> = {
  'amsterdam':  [52.3702, 4.8952],
  'rotterdam':  [51.9244, 4.4777],
  'den haag':   [52.0705, 4.3007],
  'utrecht':    [52.0907, 5.1214],
  'eindhoven':  [51.4416, 5.4697],
  'groningen':  [53.2194, 6.5665],
  'tilburg':    [51.5555, 5.0913],
  'almere':     [52.3508, 5.2647],
  'breda':      [51.5719, 4.7683],
  'nijmegen':   [51.8426, 5.8546],
  'zaandam':    [52.4380, 4.8130],
  'amersfoort': [52.1561, 5.3878],
  'maastricht': [50.8514, 5.6910],
  'arnhem':     [51.9851, 5.8987],
  'haarlem':    [52.3874, 4.6462],
  'schiphol':   [52.3105, 4.7683],
  'luchthaven': [52.3105, 4.7683],
  'airport':    [52.3105, 4.7683],
};

function geocode(location: string): [number, number] {
  const loc = location.toLowerCase();
  for (const [city, coords] of Object.entries(CITY_COORDS)) {
    if (loc.includes(city)) return coords;
  }
  const jitter = () => (Math.random() - 0.5) * 0.1;
  return [52.3702 + jitter(), 4.8952 + jitter()];
}

function extractSalary(text: string): string {
  const m = text.match(/€[\s]?[\d.,]+(?:\s*[-–]\s*€[\s]?[\d.,]+)?(?:\s*(?:per\s+)?(?:uur|maand|week))?/i);
  return m ? m[0].replace(/\s+/g, ' ').trim() : 'Salary on request';
}

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.text();
}

async function scrapeListingPage(pageIndex: number) {
  const html = await fetchHtml(`${BASE}/vacatures/?pageIndex=${pageIndex}`);
  const $ = cheerio.load(html);
  const jobs: { id: string; title: string; slug: string; location: string; employment: string; category: string }[] = [];

  $('li.card').each((_, el) => {
    const $el = $(el);
    const link = $el.find('h3 a').attr('href') || '';
    const title = $el.find('h3 a').text().trim();

    const getMeta = (label: string) => {
      let val = '';
      $el.find('li').each((__, li) => {
        const strong = $(li).find('strong').text();
        if (strong.includes(label)) {
          val = $(li).text().replace(strong, '').trim();
        }
      });
      return val;
    };

    const idMatch = link.match(/\/vacatures\/(\d+)\//);
    if (!idMatch || !title) return;

    jobs.push({
      id: `olympia_${idMatch[1]}`,
      title,
      slug: link,
      location: getMeta('Locatie'),
      employment: getMeta('Dienstverband'),
      category: getMeta('Branche') || getMeta('Vakgebied'),
    });
  });

  return jobs;
}

async function scrapeDetail(slug: string): Promise<{ description: string; salary: string }> {
  try {
    const html = await fetchHtml(`${BASE}${slug}`);
    const $ = cheerio.load(html);
    $('script, style, nav, header, footer').remove();
    const text = $('main').text().replace(/\s+/g, ' ').trim();
    return { description: text.slice(0, 2000), salary: extractSalary(text) };
  } catch {
    return { description: '', salary: 'Salary on request' };
  }
}

function mapType(raw: string): string {
  const r = raw.toLowerCase();
  if (r.includes('fulltime') && r.includes('parttime')) return 'Full-time / Part-time';
  if (r.includes('fulltime')) return 'Full-time';
  if (r.includes('parttime')) return 'Part-time';
  return raw || 'Flexible';
}

// GET /api/scrape-olympia?pages=5  (default 5, max 50)
export async function GET(req: NextRequest) {
  const pages = Math.min(parseInt(req.nextUrl.searchParams.get('pages') || '5'), 50);
  const allJobs: object[] = [];

  for (let page = 1; page <= pages; page++) {
    try {
      const listings = await scrapeListingPage(page);

      // Fetch detail pages 3 at a time
      for (let i = 0; i < listings.length; i += 3) {
        const batch = listings.slice(i, i + 3);
        const detailed = await Promise.all(batch.map(async (job) => {
          const detail = await scrapeDetail(job.slug);
          const [lat, lng] = geocode(job.location);
          return {
            id: job.id,
            title: job.title,
            category: job.category,
            type: mapType(job.employment),
            salary: detail.salary,
            location: job.location,
            url: `${BASE}${job.slug}`,
            lat,
            lng,
            description: detail.description,
            source: 'olympia',
          };
        }));
        allJobs.push(...detailed);
        await new Promise(r => setTimeout(r, 150));
      }
    } catch (err) {
      console.error(`Page ${page} failed:`, err);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await getSupabase().from('jobs').upsert(allJobs as any[], { onConflict: 'id' });
  if (error) {
    return NextResponse.json({ error: 'Upsert failed', detail: JSON.stringify(error) }, { status: 500 });
  }

  return NextResponse.json({ message: 'Olympia scraped and stored', pages_scraped: pages, count: allJobs.length });
}
