import type { Metadata, Viewport } from 'next'
import ServiceWorker from '../sw-register'
import InstallPrompt from '../install-prompt'

export const metadata: Metadata = {
  title: 'STAP — Jouw eerste baan',
  description: 'Maak een gratis CV en vind bijbaantjes bij jou in de buurt.',
  manifest: '/api/stap/manifest',
  appleWebApp: {
    capable: true,
    title: 'STAP',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    apple: '/api/icon/180',
  },
}

export const viewport: Viewport = {
  themeColor: '#00e5a0',
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
