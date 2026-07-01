'use client'

import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useRef } from 'react'

// Suit les mises à jour de center depuis le parent (GPS tracking)
function CenterUpdater({ center, onExternalMove }: {
  center: { lat: number; lng: number }
  onExternalMove: () => void
}) {
  const map = useMap()
  const prev = useRef(center)

  useEffect(() => {
    const dist = Math.abs(prev.current.lat - center.lat) + Math.abs(prev.current.lng - center.lng)
    if (dist > 0.00001) {
      prev.current = center
      onExternalMove()
      map.setView([center.lat, center.lng], map.getZoom(), { animate: true, duration: 0.5 })
    }
  }, [center.lat, center.lng])

  return null
}

function EventHandler({ onMoveStart, onMoveEnd, isExternal }: {
  onMoveStart: () => void
  onMoveEnd: (lat: number, lng: number) => void
  isExternal: React.MutableRefObject<boolean>
}) {
  const map = useMapEvents({
    movestart() {
      if (!isExternal.current) onMoveStart()
    },
    moveend() {
      if (isExternal.current) {
        isExternal.current = false
        return
      }
      const c = map.getCenter()
      onMoveEnd(c.lat, c.lng)
    },
  })
  return null
}

interface LeafletGpsMapProps {
  center: { lat: number; lng: number }
  onMoveStart: () => void
  onMoveEnd: (lat: number, lng: number) => void
}

export default function LeafletGpsMap({ center, onMoveStart, onMoveEnd }: LeafletGpsMapProps) {
  const isExternal = useRef(false)

  function handleExternalMove() {
    isExternal.current = true
  }

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={17}
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap"
      />
      <CenterUpdater center={center} onExternalMove={handleExternalMove} />
      <EventHandler onMoveStart={onMoveStart} onMoveEnd={onMoveEnd} isExternal={isExternal} />
    </MapContainer>
  )
}
