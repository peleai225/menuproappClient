'use client'

import { use, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useQuery } from '@tanstack/react-query'
import { Phone, Star } from 'lucide-react'
import { trackOrder } from '@/lib/services'
import { getEcho } from '@/lib/echo'
import { formatMinutes } from '@/lib/format'
import { Skeleton } from '@/components/ui/skeleton'
import { ShareTracking } from '@/components/share-tracking'
import { cn } from '@/lib/utils'
import type { Driver, TrackingResponse } from '@/lib/types'

const TrackingMap = dynamic(() => import('@/components/tracking-map'), { ssr: false })

const STEPS = [
  { key: 'ordered_at', label: 'Commandé' },
  { key: 'confirmed_at', label: 'Confirmé' },
  { key: 'preparing_at', label: 'En préparation' },
  { key: 'driver_assigned_at', label: 'Livreur assigné' },
  { key: 'picked_up_at', label: 'Récupéré' },
  { key: 'completed_at', label: 'Livré' },
] as const

export default function TrackingPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const [driverPos, setDriverPos] = useState<{ lat: number; lng: number } | null>(null)
  const [realtimeDriver, setRealtimeDriver] = useState<Driver | null>(null)
  const [realtimeStatus, setRealtimeStatus] = useState<string | null>(null)
  const [realtimeMinutes, setRealtimeMinutes] = useState<number | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['tracking', token],
    queryFn: () => trackOrder(token),
    refetchInterval: false,
  })

  useEffect(() => {
    const echo = getEcho()
    if (!echo) return

    const channel = echo.channel(`order.${token}`)

    channel.listen('.driver.assigned', (e: { driver: Driver }) => {
      setRealtimeDriver(e.driver)
      if (e.driver.latitude && e.driver.longitude) {
        setDriverPos({ lat: e.driver.latitude, lng: e.driver.longitude })
      }
    })

    channel.listen('.delivery.status_changed', (e: { new_status: string; estimated_minutes: number }) => {
      setRealtimeStatus(e.new_status)
      setRealtimeMinutes(e.estimated_minutes)
    })

    channel.listen('.driver.location', (e: { lat: number; lng: number }) => {
      setDriverPos({ lat: e.lat, lng: e.lng })
    })

    return () => {
      echo.leave(`order.${token}`)
    }
  }, [token])

  if (isLoading || !data) {
    return (
      <div>
        <Skeleton className="h-[60vh] w-full" />
        <div className="space-y-3 p-4">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    )
  }

  const driver = realtimeDriver ?? data.delivery.driver
  const estimatedMinutes = realtimeMinutes ?? data.estimated_minutes
  const deliveryLat = data.delivery_lat ?? 5.3542
  const deliveryLng = data.delivery_lng ?? -3.9827

  const initialDriverPos = driver
    ? { lat: driver.latitude, lng: driver.longitude }
    : null

  return (
    <div className="min-h-dvh">
      {/* Map */}
      <div className="h-[60vh] w-full">
        <TrackingMap
          deliveryLat={deliveryLat}
          deliveryLng={deliveryLng}
          driverPos={driverPos ?? initialDriverPos}
        />
      </div>

      {/* Info panel */}
      <div className="relative -mt-6 rounded-t-3xl bg-card px-4 pt-5 pb-8">
        {/* ETA + Share */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-foreground">
              {estimatedMinutes > 0 ? formatMinutes(estimatedMinutes) : 'Livré !'}
            </p>
            <p className="text-sm text-muted-foreground">Temps estimé restant</p>
          </div>
          <ShareTracking token={token} />
        </div>

        {/* Driver info */}
        {driver && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-border bg-muted p-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
              {driver.name[0]}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">{driver.name}</p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="size-3 fill-primary text-primary" />
                {driver.rating}
              </p>
            </div>
            <a
              href={`tel:${driver.phone}`}
              className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground"
            >
              <Phone className="size-5" />
            </a>
          </div>
        )}

        {/* Timeline */}
        <div className="space-y-0">
          {STEPS.map((step, i) => {
            const done = !!(data.timeline as Record<string, string | null>)[step.key]
            const isCurrent =
              !done &&
              (i === 0 || !!(data.timeline as Record<string, string | null>)[STEPS[i - 1].key])
            return (
              <div key={step.key} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'flex size-6 items-center justify-center rounded-full text-xs font-bold',
                      done
                        ? 'bg-primary text-primary-foreground'
                        : isCurrent
                          ? 'animate-pulse border-2 border-primary bg-primary/20 text-primary'
                          : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {done ? '✓' : i + 1}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={cn('h-6 w-0.5', done ? 'bg-primary' : 'bg-border')} />
                  )}
                </div>
                <p
                  className={cn(
                    'pt-0.5 text-sm',
                    done ? 'font-semibold text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {step.label}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
