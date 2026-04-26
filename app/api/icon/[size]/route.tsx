import { ImageResponse } from 'next/og'

export const dynamic = 'force-static'
export const contentType = 'image/png'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ size: string }> }
) {
  const { size: sizeParam } = await params
  const size = Math.min(Math.max(parseInt(sizeParam) || 192, 32), 512)
  const radius = Math.round(size * 0.22)
  const fontSize = Math.round(size * 0.44)

  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          background: '#0a0a0f',
          borderRadius: radius,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontSize,
            fontWeight: 700,
            color: '#00e5a0',
            fontFamily: 'system-ui, sans-serif',
            letterSpacing: '-1px',
            lineHeight: 1,
          }}
        >
          S
        </span>
      </div>
    ),
    { width: size, height: size }
  )
}
