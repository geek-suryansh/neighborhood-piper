import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { getSupabase } from '@/lib/supabase';

const BASE = 'https://www.olympia.nl';
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
  'Accept-Language': 'nl-NL,nl;q=0.9',
};

const CITY_COORDS: Record<string, [number, number]> = {
  // Amsterdam & surroundings
  'amsterdam':       [52.3702, 4.8952],
  'schiphol':        [52.3105, 4.7683],
  'luchthaven':      [52.3105, 4.7683],
  'airport':         [52.3105, 4.7683],
  'hoofddorp':       [52.3058, 4.6972],
  'amstelveen':      [52.3100, 4.8600],
  'diemen':          [52.3397, 4.9603],
  'zaandam':         [52.4380, 4.8130],
  'zaanstad':        [52.4380, 4.8130],
  'haarlem':         [52.3874, 4.6462],
  'almere':          [52.3508, 5.2647],
  'purmerend':       [52.5026, 4.9600],
  'hilversum':       [52.2292, 5.1669],
  'bussum':          [52.2749, 5.1610],
  // Major NL cities
  'rotterdam':       [51.9244, 4.4777],
  'den haag':        [52.0705, 4.3007],
  'the hague':       [52.0705, 4.3007],
  'utrecht':         [52.0907, 5.1214],
  'eindhoven':       [51.4416, 5.4697],
  'groningen':       [53.2194, 6.5665],
  'tilburg':         [51.5555, 5.0913],
  'breda':           [51.5719, 4.7683],
  'nijmegen':        [51.8426, 5.8546],
  'amersfoort':      [52.1561, 5.3878],
  'maastricht':      [50.8514, 5.6910],
  'arnhem':          [51.9851, 5.8987],
  'enschede':        [52.2215, 6.8937],
  'apeldoorn':       [52.2112, 5.9699],
  'zwolle':          [52.5168, 6.0830],
  'deventer':        [52.2512, 6.1583],
  'leeuwarden':      [53.2012, 5.7999],
  'dordrecht':       [51.8133, 4.6901],
  'leiden':          [52.1601, 4.4970],
  'delft':           [52.0116, 4.3571],
  'alkmaar':         [52.6324, 4.7534],
  'venlo':           [51.3704, 6.1724],
  'sittard':         [51.0000, 5.8667],
  'heerlen':         [50.8880, 5.9797],
  'roermond':        [51.1936, 5.9875],
  'weert':           [51.2494, 5.7060],
  'helmond':         [51.4817, 5.6611],
  'den bosch':       [51.6978, 5.3037],
  "'s-hertogenbosch":[51.6978, 5.3037],
  'hertogenbosch':   [51.6978, 5.3037],
  'roosendaal':      [51.5308, 4.4628],
  'bergen op zoom':  [51.4975, 4.2886],
  'terneuzen':       [51.3358, 3.8295],
  'goes':            [51.5047, 3.8897],
  'middelburg':      [51.4988, 3.6136],
  'vlissingen':      [51.4543, 3.5756],
  'drachten':        [53.1118, 6.0968],
  'emmen':           [52.7797, 6.8990],
  'assen':           [52.9925, 6.5642],
  'meppel':          [52.6966, 6.1922],
  'hoogeveen':       [52.7239, 6.4733],
  'veendam':         [53.1083, 6.8750],
  'stadskanaal':     [52.9862, 6.9500],
  'sneek':           [53.0328, 5.6606],
  'kampen':          [52.5544, 5.9122],
  'hardenberg':      [52.5750, 6.6175],
  'oldenzaal':       [52.3119, 6.9275],
  'hengelo':         [52.2660, 6.7937],
  'almelo':          [52.3566, 6.6609],
  // Zuid-Holland
  'gouda':           [52.0116, 4.7107],
  'zoetermeer':      [52.0572, 4.4940],
  'alphen':          [52.1280, 4.6568],
  'alphen aan den rijn': [52.1280, 4.6568],
  'westland':        [52.0172, 4.2000],
  'ridderkerk':      [51.8653, 4.6028],
  'barendrecht':     [51.8560, 4.5358],
  'capelle':         [51.9306, 4.5733],
  'spijkenisse':     [51.8419, 4.3289],
  // North Brabant extras
  'waalwijk':        [51.6834, 5.0696],
  'oss':             [51.7650, 5.5167],
  'veghel':          [51.6167, 5.5500],
  'best':            [51.5060, 5.3918],
  'veldhoven':       [51.4167, 5.4000],
  'oosterhout':      [51.6417, 4.8611],
  'klundert':        [51.6667, 4.5167],
  'drunen':          [51.6833, 5.1333],
  'waalre':          [51.3833, 5.4500],
  'born':            [51.0333, 5.8333],
  // Regio labels
  'regio amersfoort': [52.1561, 5.3878],
  'regio amsterdam':  [52.3702, 4.8952],
  'regio rotterdam':  [51.9244, 4.4777],
};

const geocodeCache: Record<string, [number, number] | null> = {};

export async function geocodeLocation(location: string): Promise<[number, number] | null> {
  const key = location.toLowerCase().trim();
  if (key in geocodeCache) return geocodeCache[key];

  // Fast-path for Amsterdam — avoid a Nominatim round-trip for the most common location
  if (key.includes('amsterdam')) {
    geocodeCache[key] = [52.3702, 4.8952];
    return geocodeCache[key];
  }

  try {
    const q = encodeURIComponent(location);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${q}&countrycodes=nl&format=json&limit=1`,
      { headers: { 'User-Agent': 'neighborhood-piper/1.0 (hackathon project)' } }
    );
    if (res.ok) {
      const data = await res.json();
      if (data[0]) {
        const coords: [number, number] = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        geocodeCache[key] = coords;
        return coords;
      }
    }
  } catch { /* ignore */ }

  geocodeCache[key] = null;
  return null;
}

// Keep local table for the YoungCapital scraper (Amsterdam-only, no Nominatim needed)
function geocodeLocal(location: string): [number, number] {
  const loc = location.toLowerCase().trim();
  for (const [city, coords] of Object.entries(CITY_COORDS)) {
    if (loc.includes(city)) return coords;
  }
  return [52.3702, 4.8952]; // default Amsterdam
}

async function geocode(location: string): Promise<[number, number] | null> {
  return geocodeLocation(location);
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
          const [detail, coords] = await Promise.all([
            scrapeDetail(job.slug),
            geocode(job.location),
          ]);
          return {
            id: job.id,
            title: job.title,
            category: job.category,
            type: mapType(job.employment),
            salary: detail.salary,
            location: job.location,
            url: `${BASE}${job.slug}`,
            lat: coords ? coords[0] : null,
            lng: coords ? coords[1] : null,
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
