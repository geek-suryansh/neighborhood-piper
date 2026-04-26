import type { Metadata, Viewport } from 'next'
import ServiceWorker from '../sw-register'


export const metadata: Metadata = {
  title: 'Junta — Find your first job in Amsterdam',
  description: 'Find your first job in Amsterdam. 5-minute quiz, anonymous, free.',
  manifest: '/api/junta/manifest',
  appleWebApp: {
    capable: true,
    title: 'Junta',
    statusBarStyle: 'default',
  },
  icons: {
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
}

export const viewport: Viewport = {
  themeColor: '#FFFFFF',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ServiceWorker />
      {children}
      {/* <InstallPrompt /> */}
    </>
  )
}
