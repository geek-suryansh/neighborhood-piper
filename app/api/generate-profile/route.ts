import { NextRequest, NextResponse } from 'next/server';
import type { AppData } from '@/lib/junta-data';
import { INTERESTS } from '@/lib/junta-data';

export async function POST(req: NextRequest) {
  const { data, picks }: { data: AppData; picks: string[] } = await req.json();

  const interestLabels = (data.interests || [])
    .map(id => INTERESTS.find(i => i.id === id)?.label)
    .filter(Boolean)
    .join(', ');

  const profileSummary = [
    data.age && `Leeftijd: ${data.age} jaar`,
    data.school && `School: ${data.school}`,
    data.eduLevel && `Opleiding: ${data.eduLevel}`,
    (data.languages || []).length > 0 && `Talen: ${data.languages.join(', ')}`,
    interestLabels && `Interesses: ${interestLabels}`,
    (data.skills || []).length > 0 && `Vaardigheden: ${data.skills.join(', ')}`,
    data.hours && `Beschikbaarheid: ${data.hours} per week`,
    data.dream && `Droom: ${data.dream}`,
    (data.experienceTypes || []).length > 0 && `Ervaring: ${data.experienceTypes!.join(', ')}`,
    data.experienceNote && `Toelichting ervaring: ${data.experienceNote}`,
    data.location && `Woonplaats: ${data.location.name}`,
    picks.length > 0 && `Voorkeursbanen (gekozen via "zou je liever"): ${picks.join(', ')}`,
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
          content: `Je schrijft een korte profieltekst voor een CV van een jonge werkzoekende in Nederland. Geef ALLEEN geldige JSON terug met twee sleutels: "nl" (Nederlandse profieltekst, max 60 woorden, eerste persoon "Ik ben...") en "en" (Engelse vertaling, max 60 woorden, eerste persoon "I am..."). Geen clichés als "gedreven" of "enthousiast". Verwerk de voorkeursbanen subtiel. Geen extra uitleg buiten de JSON.`,
        },
        {
          role: 'user',
          content: `Schrijf een profieltekst voor dit CV:\n\n${profileSummary}`,
        },
      ],
      max_tokens: 400,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to generate' }, { status: 500 });
  }

  const json = await res.json();
  const parsed = JSON.parse(json.choices?.[0]?.message?.content ?? '{}');

  return NextResponse.json({ nl: parsed.nl ?? '', en: parsed.en ?? '' });
}
