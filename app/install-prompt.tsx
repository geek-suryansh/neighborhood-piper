'use client'

import { useState, useEffect } from 'react'

export default function InstallPrompt() {
  const [show, setShow] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<Event & { prompt(): Promise<void>; userChoice: Promise<{ outcome: string }> } | null>(null)

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches
    if (standalone) return

    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(ios)

    if (ios) {
      if (!sessionStorage.getItem('stap-install-dismissed')) setShow(true)
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as typeof deferredPrompt)
      if (!sessionStorage.getItem('stap-install-dismissed')) setShow(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  function dismiss() {
    sessionStorage.setItem('stap-install-dismissed', '1')
    setShow(false)
  }

  async function install() {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setShow(false)
    setDeferredPrompt(null)
  }

  if (!show) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      left: 16,
      right: 16,
      background: '#12121a',
      border: '1px solid #00e5a044',
      borderRadius: 16,
      padding: '16px 20px',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12,
      boxShadow: '0 8px 32px rgba(0,229,160,0.12)',
    }}>
      <div style={{ fontSize: 28, lineHeight: 1 }}>📲</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, color: '#e8e8f0', marginBottom: 4, fontSize: 15, fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
          Zet Junta op je startscherm
        </div>
        {isIOS ? (
          <div style={{ color: '#8888a0', fontSize: 13, lineHeight: 1.5, fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
            Tik op <strong style={{ color: '#00e5a0' }}>Delen ⎋</strong> en kies{' '}
            <strong style={{ color: '#00e5a0' }}>Zet op beginscherm ➕</strong>
          </div>
        ) : (
          <>
            <div style={{ color: '#8888a0', fontSize: 13, fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
              Installeer de app voor snelle toegang
            </div>
            {deferredPrompt && (
              <button onClick={install} style={{
                marginTop: 10,
                background: '#00e5a0',
                color: '#0a0a0f',
                border: 'none',
                borderRadius: 8,
                padding: '8px 18px',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: "'Segoe UI', system-ui, sans-serif",
              }}>
                Installeren
              </button>
            )}
          </>
        )}
      </div>
      <button onClick={dismiss} aria-label="Sluiten" style={{
        background: 'none',
        border: 'none',
        color: '#8888a0',
        fontSize: 20,
        cursor: 'pointer',
        padding: '0 4px',
        lineHeight: 1,
        alignSelf: 'flex-start',
      }}>
        ×
      </button>
    </div>
  )
}
