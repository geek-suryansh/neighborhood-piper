import { NextRequest, NextResponse } from 'next/server';
import type { AppData } from '@/lib/stap-data';
import { INTERESTS } from '@/lib/stap-data';

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
          content: `Je schrijft een korte profieltekst voor een CV van een jonge werkzoekende in Nederland. Schrijf in het Nederlands. Maximaal 60 woorden. Geen clichés als "gedreven" of "enthousiast". Verwerk de gekozen voorkeursbanen subtiel — noem ze niet letterlijk maar gebruik ze om het type werk te omschrijven. Geef alleen de profieltekst terug, geen labels of extra uitleg.`,
        },
        {
          role: 'user',
          content: `Schrijf één profieltekst in de eerste persoon ("Ik ben...") voor dit CV:

${profileSummary}`,
        },
      ],
      max_tokens: 200,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to generate' }, { status: 500 });
  }

  const json = await res.json();
  const description = (json.choices?.[0]?.message?.content ?? '').trim();

  return NextResponse.json({ description });
}
