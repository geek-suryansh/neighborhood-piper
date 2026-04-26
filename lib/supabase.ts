import { createClient } from '@supabase/supabase-js';
import type { CandidateProfile } from './profile';

export interface ProfileRow {
  id: string;
  email: string | null;
  display_name: string | null;
  age_range: string | null;
  profile: CandidateProfile;
  created_at?: string;
}

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
  contact_email?: string | null;
  description?: string;
  source?: string;
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _adminClient: ReturnType<typeof createClient<any>> | null = null;

/** Server-side only — bypasses RLS. Never expose to the browser. */
export function getSupabaseAdmin() {
  if (!_adminClient) {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _adminClient = createClient<any>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceKey,
      { auth: { persistSession: false } }
    );
  }
  return _adminClient;
}
