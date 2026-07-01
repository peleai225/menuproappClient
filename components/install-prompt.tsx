'use client'

import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches)
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent))

    const stored = localStorage.getItem('pwa-install-dismissed')
    if (stored) {
      const dismissedAt = Number(stored)
      if (Date.now() - dismissedAt < 7 * 24 * 60 * 60 * 1000) {
        setDismissed(true)
      }
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (isStandalone || dismissed) return null

  async function handleInstall() {
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setDeferredPrompt(null)
        setDismissed(true)
      }
    }
  }

  function handleDismiss() {
    setDismissed(true)
    localStorage.setItem('pwa-install-dismissed', String(Date.now()))
  }

  if (!deferredPrompt && !isIOS) return null

  return (
    <div className="fixed bottom-20 left-1/2 z-[60] w-[calc(100%-2rem)] max-w-[448px] -translate-x-1/2 animate-in slide-in-from-bottom-4">
      <div className="rounded-2xl border border-border bg-card p-4 shadow-lg">
        <button
          onClick={handleDismiss}
          className="absolute right-3 top-3 rounded-full p-1 text-muted-foreground hover:bg-muted"
          aria-label="Fermer"
        >
          <X className="size-4" />
        </button>

        <div className="flex items-start gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon-192.png" alt="MenuPro" className="size-12 rounded-xl" />
          <div className="flex-1">
            <h3 className="text-sm font-bold text-foreground">Installer MenuPro</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {isIOS
                ? 'Appuyez sur le bouton Partager puis "Sur l\'ecran d\'accueil"'
                : 'Accedez plus rapidement a vos commandes depuis votre ecran d\'accueil'}
            </p>
          </div>
        </div>

        {deferredPrompt && (
          <button
            onClick={handleInstall}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground"
          >
            <Download className="size-4" />
            Installer l&apos;application
          </button>
        )}

        {isIOS && (
          <div className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-muted py-2.5 text-xs font-medium text-muted-foreground">
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" />
            </svg>
            Partager → Sur l&apos;ecran d&apos;accueil
          </div>
        )}
      </div>
    </div>
  )
}
