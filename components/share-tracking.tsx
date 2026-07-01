'use client'

import { Share2 } from 'lucide-react'
import { toast } from 'sonner'

export function ShareTracking({ token }: { token: string }) {
  const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/orders/track/${token}`
  const message = `Suivez ma commande MenuPro en temps réel : ${url}`

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Suivi commande MenuPro', text: message, url })
      } catch {
        /* cancelled */
      }
    } else {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
      window.open(whatsappUrl, '_blank')
    }
    toast.success('Lien de suivi copié !')
  }

  return (
    <button
      onClick={share}
      className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm"
    >
      <Share2 className="size-4" />
      Partager
    </button>
  )
}
