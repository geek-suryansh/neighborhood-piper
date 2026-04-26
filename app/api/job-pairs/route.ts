import { NextRequest, NextResponse } from 'next/server';
import type { AppData } from '@/lib/junta-data';
import { INTERESTS } from '@/lib/junta-data';

export async function POST(req: NextRequest) {
  const data: AppData = await req.json();

  const interestLabels = (data.interests || [])
    .map(id => INTERESTS.find(i => i.id === id)?.label)
    .filter(Boolean)
    .join(', ');

  const context = [
    data.age && `Leeftijd: ${data.age} jaar`,
    interestLabels && `Interesses: ${interestLabels}`,
    (data.skills || []).length > 0 && `Vaardigheden: ${data.skills.join(', ')}`,
    data.dream && `Droom: ${data.dream}`,
    (data.experienceTypes || []).length > 0 && `Ervaring: ${data.experienceTypes!.join(', ')}`,
    data.experienceNote && `Toelichting ervaring: ${data.experienceNote}`,
  ].filter(Boolean).join('\n');

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
          content: `Je helpt jongeren in Nederland (14–23 jaar) ontdekken welke bijbaan bij hen past. Geef altijd geldige JSON terug, niets anders.`,
        },
        {
          role: 'user',
          content: `Maak 3 "zou je liever"-keuzes voor deze jongere. Elke keuze bevat twee heel verschillende bijbanen die realistisch zijn voor deze leeftijd in Nederland. De keuzes moeten samen een breed beeld geven van wat iemand leuk vindt (buiten/binnen, mensen/objecten, creatief/praktisch, etc.). Gebaseerd op het profiel hieronder.

Profiel:
${context}

Geef terug als JSON met voor elke baan ook een Engelse vertaling:
{"pairs":[{"a":"...","b":"...","aEn":"...","bEn":"..."},{"a":"...","b":"...","aEn":"...","bEn":"..."},{"a":"...","b":"...","aEn":"...","bEn":"..."}]}`,
        },
      ],
      max_tokens: 600,
      temperature: 0.9,
      response_format: { type: 'json_object' },
    }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to generate pairs' }, { status: 500 });
  }

  const json = await res.json();
  try {
    const parsed = JSON.parse(json.choices?.[0]?.message?.content ?? '{}');
    return NextResponse.json({ pairs: parsed.pairs ?? [] });
  } catch {
    return NextResponse.json({ error: 'Failed to parse pairs' }, { status: 500 });
  }
}
