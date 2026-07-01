'use client'

import { useState, useCallback, useRef } from 'react'
import { api } from '@/lib/api'

export interface AddressResult {
  display_name: string
  lat: number
  lng: number
  address: string
  city: string
}

export function useAddressSearch() {
  const [results, setResults] = useState<AddressResult[]>([])
  const [loading, setLoading] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = useCallback((query: string, city = 'Abidjan') => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (query.trim().length < 3) {
      setResults([])
      return
    }

    timerRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const { data } = await api.get('/geocoding/search', {
          params: { q: query, city },
        })
        setResults(data.data ?? [])
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 400) // debounce 400ms
  }, [])

  const clear = useCallback(() => setResults([]), [])

  return { results, loading, search, clear }
}
