'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

interface GeoAddress {
  address: string
  road: string
  neighbourhood: string
  city: string
  display_name: string
}

export function useReverseGeocode(lat: number | null, lng: number | null) {
  const [address, setAddress] = useState<GeoAddress | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!lat || !lng) return
    setLoading(true)
    api
      .get('/geocoding/reverse', { params: { lat, lng } })
      .then((res) => setAddress(res.data))
      .catch(() => setAddress(null))
      .finally(() => setLoading(false))
  }, [lat, lng])

  return { address, loading }
}
