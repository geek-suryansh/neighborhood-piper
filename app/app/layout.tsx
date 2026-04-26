import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
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
      {/* Capture beforeinstallprompt before React hydrates to avoid missing the event */}
      <Script id="bip-capture" strategy="beforeInteractive">{`
        window.__juntaBip = null;
        window.addEventListener('beforeinstallprompt', function(e) {
          e.preventDefault();
          window.__juntaBip = e;
        }, { once: true });
      `}</Script>
      <ServiceWorker />
      {children}
      <InstallPrompt />
    </>
  )
}
