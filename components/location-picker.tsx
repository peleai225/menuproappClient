'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { MapPin, Navigation, Search, X, Loader2 } from 'lucide-react'
import { useGeo } from '@/hooks/use-geo'
import { useReverseGeocode } from '@/hooks/use-reverse-geocode'
import { useAddressSearch, type AddressResult } from '@/hooks/use-address-search'

// Leaflet components — client-only
const MapContainer = dynamic(() => import('react-leaflet').then((m) => m.MapContainer), { ssr: false })
const TileLayer    = dynamic(() => import('react-leaflet').then((m) => m.TileLayer),    { ssr: false })
const Marker       = dynamic(() => import('react-leaflet').then((m) => m.Marker),       { ssr: false })

// MapClickHandler must be a separate client component that uses useMapEvents
// We wrap it in a dynamic component to avoid SSR issues with react-leaflet hooks
const MapClickHandler = dynamic(
  () =>
    import('react-leaflet').then((m) => {
      function ClickHandler({ onMove }: { onMove: (lat: number, lng: number) => void }) {
        m.useMapEvents({
          click(e: any) {
            onMove(e.latlng.lat, e.latlng.lng)
          },
        })
        return null
      }
      return ClickHandler
    }),
  { ssr: false }
)

interface LocationPickerProps {
  value?: { lat: number; lng: number; address: string }
  onChange: (location: { lat: number; lng: number; address: string; city: string }) => void
  placeholder?: string
}

export function LocationPicker({ value, onChange, placeholder = 'Où livrer ?' }: LocationPickerProps) {
  const { coords: position } = useGeo()
  const { search, results, loading: searching, clear } = useAddressSearch()
  const [query, setQuery] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [mapPos, setMapPos] = useState<{ lat: number; lng: number } | null>(
    value ? { lat: value.lat, lng: value.lng } : null
  )
  const [showMap, setShowMap] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Géocodage inversé quand le marqueur bouge sur la carte
  const { address: geoAddress, loading: geoLoading } = useReverseGeocode(
    mapPos?.lat ?? null,
    mapPos?.lng ?? null
  )

  // Quand l'adresse est résolue, notifier le parent
  useEffect(() => {
    if (geoAddress && mapPos) {
      onChange({
        lat: mapPos.lat,
        lng: mapPos.lng,
        address: geoAddress.address,
        city: geoAddress.city,
      })
      setQuery(geoAddress.address)
    }
  }, [geoAddress])

  // Utiliser la position GPS automatiquement si pas de valeur
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
    setMapPos({ lat: result.lat, lng: result.lng })
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
            ref={inputRef}
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
            <MapContainer
              center={[center.lat, center.lng]}
              zoom={15}
              style={{ height: '100%', width: '100%' }}
              zoomControl={false}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='© OpenStreetMap'
              />
              <MapClickHandler onMove={(lat, lng) => setMapPos({ lat, lng })} />
              {mapPos && (
                <Marker position={[mapPos.lat, mapPos.lng]} />
              )}
            </MapContainer>
          </div>

          {/* Indicateur de chargement géocodage */}
          {geoLoading && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-background/90 px-3 py-1.5 text-xs shadow">
              <Loader2 className="size-3 animate-spin" />
              Détection de l'adresse...
            </div>
          )}

          {/* Adresse détectée */}
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
