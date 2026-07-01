'use client'

import { useCallback, useRef, useEffect } from 'react'
import Map, { NavigationControl } from 'react-map-gl/mapbox'
import type { MapRef } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'

interface MapboxGpsMapProps {
  token: string
  style: string
  center: { lat: number; lng: number }
  onMoveStart: () => void
  onMoveEnd: (lat: number, lng: number) => void
}

export default function MapboxGpsMap({ token, style, center, onMoveStart, onMoveEnd }: MapboxGpsMapProps) {
  const mapRef = useRef<MapRef>(null)
  const isExternalUpdate = useRef(false)

  // Quand le parent change center (GPS tracking), on centre la carte sans déclencher onMoveEnd
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const current = map.getCenter()
    const dist = Math.abs(current.lat - center.lat) + Math.abs(current.lng - center.lng)
    if (dist > 0.00001) {
      isExternalUpdate.current = true
      map.easeTo({ center: [center.lng, center.lat], duration: 500 })
    }
  }, [center.lat, center.lng])

  const handleMoveStart = useCallback(() => {
    if (!isExternalUpdate.current) {
      onMoveStart()
    }
  }, [onMoveStart])

  const handleMoveEnd = useCallback(() => {
    const map = mapRef.current
    if (!map) return
    if (isExternalUpdate.current) {
      isExternalUpdate.current = false
      return
    }
    const c = map.getCenter()
    onMoveEnd(c.lat, c.lng)
  }, [onMoveEnd])

  return (
    <Map
      ref={mapRef}
      mapboxAccessToken={token}
      initialViewState={{ longitude: center.lng, latitude: center.lat, zoom: 17 }}
      style={{ width: '100%', height: '100%' }}
      mapStyle={style}
      onMoveStart={handleMoveStart}
      onMoveEnd={handleMoveEnd}
      cursor="grab"
    >
      <NavigationControl position="top-right" showCompass={false} />
    </Map>
  )
}
