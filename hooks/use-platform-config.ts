'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

interface PlatformConfig {
  mapbox: {
    token: string
    style: string
  }
  app: {
    name: string
  }
}

const FALLBACK: PlatformConfig = {
  mapbox: { token: '', style: 'streets-v12' },
  app: { name: 'MenuPro' },
}

let _cached: PlatformConfig | null = null

export function usePlatformConfig() {
  const [config, setConfig] = useState<PlatformConfig>(_cached ?? FALLBACK)
  const [loading, setLoading] = useState(!_cached)

  useEffect(() => {
    if (_cached) return
    api
      .get('/config')
      .then((res) => {
        _cached = res.data
        setConfig(res.data)
      })
      .catch(() => setConfig(FALLBACK))
      .finally(() => setLoading(false))
  }, [])

  return { config, loading }
}
