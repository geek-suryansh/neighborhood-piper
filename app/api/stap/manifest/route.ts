export const dynamic = 'force-static'

export function GET() {
  const manifest = {
    name: 'STAP — Jouw eerste baan',
    short_name: 'STAP',
    description: 'Maak een gratis CV en vind bijbaantjes bij jou in de buurt.',
    start_url: '/app',
    scope: '/app',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0a0a0f',
    theme_color: '#00e5a0',
    categories: ['education', 'productivity'],
    icons: [
      {
        src: '/api/icon/192',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/api/icon/512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
  }

  return Response.json(manifest, {
    headers: {
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
