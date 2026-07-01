'use client'

import { useEffect, useState } from 'react'
import { ABIDJAN } from '@/lib/format'

export interface Coords {
  lat: number
  lng: number
}

/**
 * Requests the browser's location. On refusal/error it silently falls back to
 * Abidjan centre (no error surfaced to the user).
 */
export function useGeo() {
  const [coords, setCoords] = useState<Coords>(ABIDJAN)
  const [granted, setGranted] = useState<boolean | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setReady(true)
      setGranted(false)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setGranted(true)
        setReady(true)
      },
      () => {
        setCoords(ABIDJAN)
        setGranted(false)
        setReady(true)
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 },
    )
  }, [])

  return { coords, granted, ready }
}
