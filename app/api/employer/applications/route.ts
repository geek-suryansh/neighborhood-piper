import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const email = req.headers.get('x-employer-email');
  if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: jobs } = await getSupabaseAdmin()
    .from('jobs')
    .select('id')
    .eq('contact_email', email);

  const jobIds = (jobs ?? []).map((j: { id: string }) => j.id);
  if (jobIds.length === 0) return NextResponse.json([]);

  const { data, error } = await getSupabaseAdmin()
    .from('applications')
    .select('id, job_id, candidate_name, candidate_email, message, applied_at')
    .in('job_id', jobIds)
    .order('applied_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
