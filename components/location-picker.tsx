'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { MapPin, Navigation, Search, X, Loader2 } from 'lucide-react'
import { useGeo } from '@/hooks/use-geo'
import { useReverseGeocode } from '@/hooks/use-reverse-geocode'
import { useAddressSearch, type AddressResult } from '@/hooks/use-address-search'
import { usePlatformConfig } from '@/hooks/use-platform-config'

// Mapbox map — client only
const MapboxMap = dynamic(() => import('@/components/mapbox-map'), { ssr: false })

// Leaflet fallback — client only
const LeafletMap = dynamic(() => import('@/components/leaflet-map'), { ssr: false })

export interface LocationValue {
  lat: number
  lng: number
  address: string
  city: string
}

interface LocationPickerProps {
  value?: LocationValue
  onChange: (location: LocationValue) => void
  placeholder?: string
}

export function LocationPicker({ value, onChange, placeholder = 'Où livrer ?' }: LocationPickerProps) {
  const { coords: position } = useGeo()
  const { config } = usePlatformConfig()
  const { search, results, loading: searching, clear } = useAddressSearch()

  const [query, setQuery] = useState(value?.address ?? '')
  const [showResults, setShowResults] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [mapPos, setMapPos] = useState<{ lat: number; lng: number } | null>(
    value ? { lat: value.lat, lng: value.lng } : null
  )

  const hasMapbox = !!config.mapbox.token

  const { address: geoAddress, loading: geoLoading } = useReverseGeocode(
    mapPos?.lat ?? null,
    mapPos?.lng ?? null
  )

  useEffect(() => {
    if (geoAddress && mapPos) {
      onChange({ lat: mapPos.lat, lng: mapPos.lng, address: geoAddress.address, city: geoAddress.city })
      setQuery(geoAddress.address)
    }
  }, [geoAddress])

  useEffect(() => {
    if (!value && position && !mapPos) {
      setMapPos({ lat: position.lat, lng: position.lng })
    }
  }, [position])

  function handleSearchInput(val: string) {
    setQuery(val)
    search(val)
    setShowResults(true)
  }

  function selectResult(result: AddressResult) {
    const pos = { lat: result.lat, lng: result.lng }
    setMapPos(pos)
    setQuery(result.address || result.display_name)
    setShowResults(false)
    clear()
    onChange({ lat: result.lat, lng: result.lng, address: result.address || result.display_name, city: result.city })
  }

  function useMyPosition() {
    if (position) {
      setMapPos({ lat: position.lat, lng: position.lng })
      setShowMap(true)
    }
  }

  const center = mapPos ?? position ?? { lat: 5.3542, lng: -3.9827 }

  return (
    <div className="space-y-2">
      {/* Barre de recherche */}
      <div className="relative">
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-2.5">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearchInput(e.target.value)}
            onFocus={() => query.length >= 3 && setShowResults(true)}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {query ? (
            <button onClick={() => { setQuery(''); clear(); setShowResults(false) }}>
              <X className="size-4 text-muted-foreground" />
            </button>
          ) : (
            <button onClick={useMyPosition} title="Utiliser ma position">
              <Navigation className="size-4 text-primary" />
            </button>
          )}
        </div>

        {/* Résultats autocomplete */}
        {showResults && results.length > 0 && (
          <div className="absolute z-50 mt-1 w-full rounded-2xl border border-border bg-background shadow-lg">
            {results.map((r, i) => (
              <button
                key={i}
                onClick={() => selectResult(r)}
                className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-muted first:rounded-t-2xl last:rounded-b-2xl"
              >
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-medium leading-tight">{r.address || r.display_name}</p>
                  <p className="text-xs text-muted-foreground">{r.city}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Boutons d'action */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={useMyPosition}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/5 py-2 text-xs font-medium text-primary"
        >
          <Navigation className="size-3.5" />
          Ma position
        </button>
        <button
          type="button"
          onClick={() => setShowMap(!showMap)}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-muted py-2 text-xs font-medium text-foreground"
        >
          <MapPin className="size-3.5" />
          {showMap ? 'Masquer la carte' : 'Choisir sur la carte'}
        </button>
      </div>

      {/* Carte interactive */}
      {showMap && (
        <div className="relative overflow-hidden rounded-2xl border border-border">
          <div className="h-56 w-full">
            {hasMapbox ? (
              <MapboxMap
                token={config.mapbox.token}
                style={`mapbox://styles/mapbox/${config.mapbox.style}`}
                center={center}
                marker={mapPos}
                onMove={(lat, lng) => setMapPos({ lat, lng })}
              />
            ) : (
              <LeafletMap
                center={center}
                marker={mapPos}
                onMove={(lat, lng) => setMapPos({ lat, lng })}
              />
            )}
          </div>

          {geoLoading && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-background/90 px-3 py-1.5 text-xs shadow">
              <Loader2 className="size-3 animate-spin" />
              Détection de l'adresse...
            </div>
          )}

          {geoAddress && !geoLoading && (
            <div className="absolute bottom-2 left-2 right-2 rounded-xl bg-background/95 px-3 py-2 text-xs shadow">
              <p className="font-medium text-foreground">{geoAddress.address}</p>
              <p className="text-muted-foreground">{geoAddress.city}</p>
            </div>
          )}

          <p className="absolute top-2 left-1/2 -translate-x-1/2 rounded-full bg-background/90 px-3 py-1 text-xs text-muted-foreground shadow">
            Appuyez sur la carte pour choisir
          </p>
        </div>
      )}
    </div>
  )
}
