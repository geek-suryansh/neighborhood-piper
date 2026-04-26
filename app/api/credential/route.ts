import { NextResponse } from 'next/server';

const API_URL = process.env.CREDENTIAL_API_URL ?? 'http://localhost:8000';

export async function POST(req: Request) {
  let body: { text?: string; input_lang?: string | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  try {
    const upstream = await fetch(`${API_URL}/credential`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: body.text, input_lang: body.input_lang ?? null, top_k: 3 }),
      signal: AbortSignal.timeout(15_000),
    });
    const data = await upstream.json();
    return NextResponse.json(data, { status: upstream.status });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Credential service unavailable' },
      { status: 503 },
    );
  }
}
