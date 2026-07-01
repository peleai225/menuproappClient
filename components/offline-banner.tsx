'use client'

import { useEffect, useState } from 'react'
import { WifiOff } from 'lucide-react'

export function OfflineBanner() {
  const [offline, setOffline] = useState(false)

  useEffect(() => {
    const goOffline = () => setOffline(true)
    const goOnline = () => setOffline(false)
    window.addEventListener('offline', goOffline)
    window.addEventListener('online', goOnline)
    setOffline(!navigator.onLine)
    return () => {
      window.removeEventListener('offline', goOffline)
      window.removeEventListener('online', goOnline)
    }
  }, [])

  if (!offline) return null

  return (
    <div className="fixed left-1/2 top-0 z-[70] w-full max-w-[480px] -translate-x-1/2 bg-destructive px-4 py-2 text-center text-xs font-medium text-white">
      <WifiOff className="mb-0.5 mr-1 inline size-3" />
      Vous êtes hors ligne — les données affichées peuvent ne pas être à jour
    </div>
  )
}
