'use client'

import { useState, useEffect } from 'react'

type BIP = Event & { prompt(): Promise<void>; userChoice: Promise<{ outcome: string }> }

// Module-level ref so it survives re-renders and can be set before React mounts
let earlyPrompt: BIP | null = null

export function captureInstallPrompt(e: Event) {
  e.preventDefault()
  earlyPrompt = e as BIP
}

export default function InstallPrompt() {
  const [show, setShow] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BIP | null>(null)

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) return
    if (sessionStorage.getItem('junta-install-dismissed')) return

    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(ios)

    if (ios) {
      setShow(true)
      return
    }

    // Event may have already fired before React mounted — check module-level
    // cache first, then the window global set by the beforeInteractive script
    const cached: BIP | null = earlyPrompt
      ?? ((window as Window & { __juntaBip?: BIP }).__juntaBip ?? null)
    if (cached) {
      setDeferredPrompt(cached)
      setShow(true)
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BIP)
      setShow(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  function dismiss() {
    sessionStorage.setItem('junta-install-dismissed', '1')
    setShow(false)
  }

  async function install() {
    if (!deferredPrompt) return
    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        earlyPrompt = null
        setShow(false)
      }
    } catch {
      // prompt() can throw if called outside a user gesture or already consumed
    }
    setDeferredPrompt(null)
  }

  if (!show) return null

  return (
    <div style={{
      position: 'fixed', bottom: 24, left: 16, right: 16,
      background: '#1D3B6B', border: '1.5px solid rgba(232,85,32,0.4)',
      borderRadius: 16, padding: '16px 20px', zIndex: 9999,
      display: 'flex', alignItems: 'flex-start', gap: 12,
      boxShadow: '0 8px 32px rgba(29,59,107,0.3)',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>
      <img src="/junta-logo.png" alt="Junta" style={{ width: 40, height: 40, borderRadius: 8, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, color: '#fff', marginBottom: 4, fontSize: 15 }}>
          Zet Junta op je startscherm
        </div>
        {isIOS ? (
          <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, lineHeight: 1.5 }}>
            Tik op <strong style={{ color: '#E85520' }}>Delen ⎋</strong> en kies{' '}
            <strong style={{ color: '#E85520' }}>Zet op beginscherm ➕</strong>
          </div>
        ) : (
          <>
            <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, marginBottom: deferredPrompt ? 10 : 0 }}>
              Installeer de app voor snelle toegang
            </div>
            {deferredPrompt ? (
              <button onClick={install} style={{
                background: '#E85520', color: '#fff', border: 'none',
                borderRadius: 8, padding: '8px 18px', fontSize: 13,
                fontWeight: 700, cursor: 'pointer',
                fontFamily: "'Segoe UI', system-ui, sans-serif",
              }}>
                Installeren
              </button>
            ) : (
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 4 }}>
                Gebruik de installatieknop in de adresbalk ↑
              </div>
            )}
          </>
        )}
      </div>
      <button onClick={dismiss} aria-label="Sluiten" style={{
        background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
        fontSize: 20, cursor: 'pointer', padding: '0 4px', lineHeight: 1,
      }}>×</button>
    </div>
  )
}
