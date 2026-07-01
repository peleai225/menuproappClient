'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { MapPin, Navigation, Search, X, Loader2, Crosshair } from 'lucide-react'
import { useAddressSearch, type AddressResult } from '@/hooks/use-address-search'
import { useReverseGeocode } from '@/hooks/use-reverse-geocode'
import { usePlatformConfig } from '@/hooks/use-platform-config'

const MapboxGpsMap = dynamic(() => import('@/components/mapbox-gps-map'), { ssr: false })
const LeafletGpsMap = dynamic(() => import('@/components/leaflet-gps-map'), { ssr: false })

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

const ABIDJAN = { lat: 5.3542, lng: -3.9827 }

export function LocationPicker({ value, onChange, placeholder = 'Où livrer ?' }: LocationPickerProps) {
  const { config } = usePlatformConfig()
  const { search, results, loading: searching, clear } = useAddressSearch()

  const [query, setQuery] = useState(value?.address ?? '')
  const [showResults, setShowResults] = useState(false)
  const [showMap, setShowMap] = useState(false)

  // Centre de la carte — la carte bouge sous le pin fixe
  const [center, setCenter] = useState<{ lat: number; lng: number }>(
    value ? { lat: value.lat, lng: value.lng } : ABIDJAN
  )
  const [mapIdle, setMapIdle] = useState(false)
  const [watching, setWatching] = useState(false)
  const watchIdRef = useRef<number | null>(null)

  const hasMapbox = !!config.mapbox.token

  // Reverse geocode quand la carte s'arrête de bouger
  const { address: geoAddress, loading: geoLoading } = useReverseGeocode(
    mapIdle ? center.lat : null,
    mapIdle ? center.lng : null
  )

  // Appliquer le résultat du reverse geocoding
  useEffect(() => {
    if (geoAddress && mapIdle) {
      onChange({ lat: center.lat, lng: center.lng, address: geoAddress.address, city: geoAddress.city })
      setQuery(geoAddress.address)
    }
  }, [geoAddress, mapIdle])

  // Nettoyage watchPosition
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [])

  function handleSearchInput(val: string) {
    setQuery(val)
    search(val)
    setShowResults(true)
  }

  function selectResult(result: AddressResult) {
    const pos = { lat: result.lat, lng: result.lng }
    setCenter(pos)
    setQuery(result.address || result.display_name)
    setShowResults(false)
    clear()
    setMapIdle(true)
    onChange({ lat: result.lat, lng: result.lng, address: result.address || result.display_name, city: result.city })
  }

  // Démarrer le suivi GPS temps réel — la carte suit la position
  function startGpsTracking() {
    if (!navigator.geolocation) return
    setShowMap(true)
    setWatching(true)

    // Position initiale immédiate
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setMapIdle(false)
      },
      () => {},
      { enableHighAccuracy: true, timeout: 8000 }
    )

    // Suivi continu
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
    }
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setMapIdle(false)
      },
      () => { setWatching(false) },
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
    )
  }

  function stopGpsTracking() {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    setWatching(false)
    // Déclencher reverse geocode sur la position actuelle
    setMapIdle(true)
  }

  // Callback quand la carte finit de bouger (drag end)
  const handleMapMoveEnd = useCallback((lat: number, lng: number) => {
    // Si on drague manuellement, arrêter le suivi GPS
    if (watching) {
      stopGpsTracking()
    }
    setCenter({ lat, lng })
    setMapIdle(true)
  }, [watching])

  const handleMapMoveStart = useCallback(() => {
    setMapIdle(false)
  }, [])

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
            <button onClick={startGpsTracking} title="Me localiser">
              <Navigation className="size-4 text-primary" />
            </button>
          )}
        </div>

        {/* Autocomplete */}
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
          onClick={startGpsTracking}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-2 text-xs font-medium transition-colors ${
            watching
              ? 'border-primary bg-primary text-white'
              : 'border-primary/30 bg-primary/5 text-primary'
          }`}
        >
          {watching ? (
            <>
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-white" />
              </span>
              GPS actif
            </>
          ) : (
            <>
              <Navigation className="size-3.5" />
              Ma position
            </>
          )}
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

      {/* Carte GPS style Yango */}
      {showMap && (
        <div className="relative overflow-hidden rounded-2xl border border-border">
          <div className="h-64 w-full">
            {hasMapbox ? (
              <MapboxGpsMap
                token={config.mapbox.token}
                style={`mapbox://styles/mapbox/${config.mapbox.style || 'streets-v12'}`}
                center={center}
                onMoveStart={handleMapMoveStart}
                onMoveEnd={handleMapMoveEnd}
              />
            ) : (
              <LeafletGpsMap
                center={center}
                onMoveStart={handleMapMoveStart}
                onMoveEnd={handleMapMoveEnd}
              />
            )}
          </div>

          {/* Pin fixe au centre — style Yango/Glovo */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center" style={{ marginBottom: '24px' }}>
              <div className={`rounded-full p-1.5 shadow-xl transition-transform duration-150 ${
                geoLoading || !mapIdle ? 'scale-110 bg-primary/90' : 'scale-100 bg-primary'
              }`}>
                <MapPin className="size-6 text-white" />
              </div>
              {/* Ombre au sol */}
              <div className={`mt-0.5 rounded-full bg-black/20 transition-all duration-150 ${
                geoLoading || !mapIdle ? 'h-1.5 w-4' : 'h-2 w-5'
              }`} />
            </div>
          </div>

          {/* Indicateur de chargement adresse */}
          {(geoLoading || !mapIdle) && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-background/90 px-3 py-1.5 text-xs shadow">
              <Loader2 className="size-3 animate-spin text-primary" />
              {watching ? 'Localisation GPS en cours...' : 'Détection de l\'adresse...'}
            </div>
          )}

          {/* Adresse détectée */}
          {geoAddress && mapIdle && !geoLoading && (
            <div className="absolute bottom-2 left-2 right-2 rounded-xl bg-background/95 px-3 py-2 text-xs shadow">
              <p className="font-medium text-foreground">{geoAddress.address}</p>
              <p className="text-muted-foreground">{geoAddress.city}</p>
            </div>
          )}

          {/* Instruction si pas encore de géoloc */}
          {mapIdle && !geoAddress && !geoLoading && (
            <p className="absolute top-2 left-1/2 -translate-x-1/2 rounded-full bg-background/90 px-3 py-1 text-xs text-muted-foreground shadow">
              Déplacez la carte pour choisir
            </p>
          )}

          {/* Bouton stop GPS tracking */}
          {watching && (
            <button
              onClick={stopGpsTracking}
              className="absolute top-2 right-2 flex items-center gap-1.5 rounded-xl bg-background/95 px-3 py-1.5 text-xs font-medium text-foreground shadow"
            >
              <Crosshair className="size-3 text-primary" />
              Confirmer ici
            </button>
          )}
        </div>
      )}
    </div>
  )
}
