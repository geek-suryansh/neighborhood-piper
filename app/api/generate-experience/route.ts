import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { experienceTypes, experienceNote }: {
    experienceTypes?: string[];
    experienceNote?: string;
  } = await req.json();

  const input = [
    (experienceTypes || []).length > 0 && `Geselecteerde ervaringen: ${experienceTypes!.join(', ')}`,
    experienceNote && `Toelichting: ${experienceNote}`,
  ].filter(Boolean).join('\n');

  if (!input.trim()) {
    return NextResponse.json({ items: [] });
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Je vertaalt ruwe ervaringsgegevens van een jonge werkzoekende naar nette CV-regels. Elke regel heeft een korte Nederlandse titel (max 4 woorden), een beknopte Nederlandse beschrijving (max 12 woorden), een korte Engelse titel en een beknopte Engelse beschrijving. Laat ervaringen weg die te vaag zijn. Geef alleen geldige JSON terug.`,
        },
        {
          role: 'user',
          content: `Maak CV-regels van deze ervaringen. Geef terug als JSON:
{"items":[{"title":"...","description":"...","titleEn":"...","descriptionEn":"..."}]}

Ervaringen:
${input}`,
        },
      ],
      max_tokens: 500,
      temperature: 0.4,
      response_format: { type: 'json_object' },
    }),
  });

  if (!res.ok) {
    return NextResponse.json({ items: [] });
  }

  const json = await res.json();
  const parsed = JSON.parse(json.choices?.[0]?.message?.content ?? '{}');

  return NextResponse.json({ items: parsed.items ?? [] });
}
