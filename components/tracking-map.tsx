'use client'

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'

const deliveryIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="%23f97316" stroke="white" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
})

const driverIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="%231e293b" stroke="white" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><text x="12" y="16" text-anchor="middle" fill="white" font-size="10">🛵</text></svg>`),
  iconSize: [36, 36],
  iconAnchor: [18, 18],
})

function FitBounds({ deliveryLat, deliveryLng, driverPos }: {
  deliveryLat: number
  deliveryLng: number
  driverPos: { lat: number; lng: number } | null
}) {
  const map = useMap()
  const fitted = useRef(false)

  useEffect(() => {
    if (fitted.current) return
    const bounds = L.latLngBounds([[deliveryLat, deliveryLng]])
    if (driverPos) bounds.extend([driverPos.lat, driverPos.lng])
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 })
    fitted.current = true
  }, [map, deliveryLat, deliveryLng, driverPos])

  return null
}

export default function TrackingMap({
  deliveryLat,
  deliveryLng,
  driverPos,
}: {
  deliveryLat: number
  deliveryLng: number
  driverPos: { lat: number; lng: number } | null
}) {
  return (
    <MapContainer
      center={[deliveryLat, deliveryLng]}
      zoom={14}
      scrollWheelZoom={false}
      className="h-full w-full"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[deliveryLat, deliveryLng]} icon={deliveryIcon} />
      {driverPos && (
        <Marker position={[driverPos.lat, driverPos.lng]} icon={driverIcon} />
      )}
      <FitBounds deliveryLat={deliveryLat} deliveryLng={deliveryLng} driverPos={driverPos} />
    </MapContainer>
  )
}
