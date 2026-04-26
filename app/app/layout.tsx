import type { Metadata, Viewport } from 'next'
import ServiceWorker from '../sw-register'
import InstallPrompt from '../install-prompt'

export const metadata: Metadata = {
  title: 'Junta — Find your first job in Amsterdam',
  description: 'Find your first job in Amsterdam. 5-minute quiz, anonymous, free.',
  manifest: '/api/stap/manifest',
  appleWebApp: {
    capable: true,
    title: 'Junta',
    statusBarStyle: 'default',
  },
  icons: {
    apple: '/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#E85520',
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
      <InstallPrompt />
    </>
  )
}
