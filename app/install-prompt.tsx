'use client'

import { useState, useEffect } from 'react'

type BIP = Event & { prompt(): Promise<void>; userChoice: Promise<{ outcome: string }> }

let earlyPrompt: BIP | null = null
export function captureInstallPrompt(e: Event) {
  e.preventDefault()
  earlyPrompt = e as BIP
}

type Platform = 'ios-safari' | 'ios-chrome' | 'android-chrome' | 'desktop-chrome' | 'other'

function getPlatform(): Platform {
  const ua = navigator.userAgent
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  if (isIOS && /CriOS/.test(ua)) return 'ios-chrome'
  if (isIOS) return 'ios-safari'
  if (/Android/.test(ua)) return 'android-chrome'
  if (/Chrome|Chromium/.test(ua)) return 'desktop-chrome'
  return 'other'
}

const STEPS: Record<Platform, { icon: string; label: React.ReactNode }[]> = {
  'ios-safari': [
    { icon: '📤', label: <>Tap the <strong>Share</strong> button at the bottom of Safari</> },
    { icon: '➕', label: <>Scroll and tap <strong>Add to Home Screen</strong></> },
    { icon: '✅', label: <>Tap <strong>Add</strong> in the top-right corner</> },
  ],
  'ios-chrome': [
    { icon: '🌐', label: <>Copy the URL and open it in <strong>Safari</strong> — Chrome on iPhone can&apos;t install apps directly</> },
    { icon: '📤', label: <>In Safari, tap the <strong>Share</strong> button at the bottom</> },
    { icon: '➕', label: <>Tap <strong>Add to Home Screen</strong>, then <strong>Add</strong></> },
  ],
  'android-chrome': [
    { icon: '⋮', label: <>Tap the <strong>menu icon</strong> in Chrome&apos;s top-right corner</> },
    { icon: '📱', label: <>Tap <strong>Add to Home screen</strong></> },
    { icon: '✅', label: <>Tap <strong>Add</strong> to confirm</> },
  ],
  'desktop-chrome': [
    { icon: '⊕', label: <>Look for the <strong>install icon</strong> at the right end of Chrome&apos;s address bar</> },
    { icon: '✅', label: <>Click it and select <strong>Install</strong> in the popup</> },
  ],
  'other': [
    { icon: '⊕', label: <>Look for an <strong>install</strong> or <strong>Add to Home Screen</strong> option in your browser menu</> },
    { icon: '✅', label: <>Follow your browser&apos;s prompts to install</> },
  ],
}

const PLATFORM_LABEL: Record<Platform, string> = {
  'ios-safari':    'Safari on iPhone / iPad',
  'ios-chrome':    'Chrome on iPhone / iPad',
  'android-chrome':'Chrome on Android',
  'desktop-chrome':'Chrome on desktop',
  'other':         'Your browser',
}

function InstructionsModal({ onClose }: { onClose: () => void }) {
  const platform = getPlatform()
  const steps = STEPS[platform]

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
        zIndex: 10000, display: 'flex', alignItems: 'flex-end',
        justifyContent: 'center', padding: '0 16px 32px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#F2EDE4', borderRadius: 20, padding: '28px 24px',
          width: '100%', maxWidth: 440,
          fontFamily: "'Segoe UI', system-ui, sans-serif",
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <img src="/junta-logo.png" alt="Junta" style={{ height: 46, borderRadius: 10 }} />
          <div>
            <div style={{ fontWeight: 800, fontSize: 17, color: '#1D3B6B' }}>Add to Home Screen</div>
            <div style={{ fontSize: 12, color: '#E85520', fontWeight: 600, marginTop: 2 }}>
              {PLATFORM_LABEL[platform]}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, margin: '22px 0 26px' }}>
          {steps.map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                background: '#E85520', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 800,
              }}>
                {i + 1}
              </div>
              <div style={{ fontSize: 14, color: '#1D3B6B', lineHeight: 1.45 }}>
                <span style={{ fontSize: 17, marginRight: 6 }}>{step.icon}</span>
                {step.label}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          style={{
            width: '100%', padding: '14px', borderRadius: 12,
            background: '#1D3B6B', color: '#fff', border: 'none',
            fontSize: 15, fontWeight: 700, cursor: 'pointer',
            fontFamily: "'Segoe UI', system-ui, sans-serif",
          }}
        >
          Got it
        </button>
      </div>
    </div>
  )
}

export default function InstallPrompt() {
  const [show, setShow] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BIP | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) return
    if (sessionStorage.getItem('junta-install-dismissed')) return

    // Grab prompt captured before React mounted
    const cached: BIP | null = earlyPrompt
      ?? ((window as Window & { __juntaBip?: BIP }).__juntaBip ?? null)
    if (cached) setDeferredPrompt(cached)

    // Show banner for everyone who hasn't installed yet
    setShow(true)

    // Still listen in case the event fires after mount
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BIP)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  function dismiss() {
    sessionStorage.setItem('junta-install-dismissed', '1')
    setShow(false)
  }

  async function handleInstall() {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        if (outcome === 'accepted') {
          earlyPrompt = null
          setShow(false)
        }
      } catch { /* ignore */ }
      setDeferredPrompt(null)
    } else {
      setShowModal(true)
    }
  }

  if (!show) return null

  return (
    <>
      <div style={{
        position: 'fixed', bottom: 24, left: 16, right: 16,
        background: '#1D3B6B', borderRadius: 16,
        border: '1.5px solid rgba(232,85,32,0.35)',
        padding: '14px 16px', zIndex: 9999,
        display: 'flex', alignItems: 'center', gap: 12,
        boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}>
        <img src="/junta-logo.png" alt="" style={{ width: 38, height: 38, borderRadius: 8, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, color: '#fff', fontSize: 14, lineHeight: 1.2 }}>Add to home screen</div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 2 }}>Open Junta like an app</div>
        </div>
        <button
          onClick={handleInstall}
          style={{
            background: '#E85520', color: '#fff', border: 'none',
            borderRadius: 8, padding: '9px 16px', fontSize: 13,
            fontWeight: 700, cursor: 'pointer', flexShrink: 0,
            fontFamily: "'Segoe UI', system-ui, sans-serif",
          }}
        >
          Install
        </button>
        <button
          onClick={dismiss}
          style={{
            background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)',
            fontSize: 20, cursor: 'pointer', padding: '0 2px', lineHeight: 1,
          }}
        >×</button>
      </div>

      {showModal && <InstructionsModal onClose={() => setShowModal(false)} />}
    </>
  )
}
