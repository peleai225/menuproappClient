'use client'

import { useCallback, useRef } from 'react'
import Map, { Marker, NavigationControl } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import { MapPin } from 'lucide-react'

interface MapboxMapProps {
  token: string
  style: string
  center: { lat: number; lng: number }
  marker: { lat: number; lng: number } | null
  onMove: (lat: number, lng: number) => void
}

export default function MapboxMap({ token, style, center, marker, onMove }: MapboxMapProps) {
  const handleClick = useCallback(
    (e: mapboxgl.MapMouseEvent) => {
      onMove(e.lngLat.lat, e.lngLat.lng)
    },
    [onMove]
  )

  return (
    <Map
      mapboxAccessToken={token}
      initialViewState={{ longitude: center.lng, latitude: center.lat, zoom: 15 }}
      style={{ width: '100%', height: '100%' }}
      mapStyle={style}
      onClick={handleClick}
      cursor="crosshair"
    >
      <NavigationControl position="top-right" showCompass={false} />
      {marker && (
        <Marker longitude={marker.lng} latitude={marker.lat} anchor="bottom">
          <div className="flex flex-col items-center">
            <div className="rounded-full bg-primary p-1 shadow-lg shadow-primary/40">
              <MapPin className="size-5 text-white" />
            </div>
            <div className="h-2 w-0.5 bg-primary" />
          </div>
        </Marker>
      )}
    </Map>
  )
}
