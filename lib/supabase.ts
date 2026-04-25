import { createClient } from '@supabase/supabase-js';

export interface JobRow {
  id: string;
  title: string;
  category: string;
  type: string;
  salary: string;
  location: string;
  url: string;
  lat: number;
  lng: number;
  scraped_at?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _client: ReturnType<typeof createClient<any>> | null = null;

export function getSupabase() {
  if (!_client) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _client = createClient<any>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return _client;
}
