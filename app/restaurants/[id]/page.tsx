'use client'

import { use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Bike, ChevronLeft, Clock, Info, MapPin, Phone, Star } from 'lucide-react'
import { getDeliveryEstimate, getRestaurant } from '@/lib/services'
import { useGeo } from '@/hooks/use-geo'
import { useRecent } from '@/store/recent'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { FavoriteButton } from '@/components/favorite-button'
import { formatDistance, formatMinutes, formatPrice } from '@/lib/format'
import { CartFAB } from '@/components/cart-fab'

export default function RestaurantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const restaurantId = Number(id)
  const router = useRouter()
  const { coords } = useGeo()

  const { data: restaurant, isLoading } = useQuery({
    queryKey: ['restaurant', restaurantId],
    queryFn: () => getRestaurant(restaurantId),
  })

  const addRecent = useRecent((s) => s.add)

  const { data: estimate } = useQuery({
    queryKey: ['estimate', restaurantId, coords.lat, coords.lng],
    queryFn: () => getDeliveryEstimate(restaurantId, coords.lat, coords.lng),
    enabled: !!restaurant,
    retry: false,
  })

  if (restaurant) {
    addRecent({ id: restaurant.id, name: restaurant.name, logo_url: restaurant.logo_url, category: restaurant.category })
  }

  if (isLoading || !restaurant) {
    return (
      <div>
        <Skeleton className="h-56 w-full rounded-none" />
        <div className="space-y-3 p-4">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    )
  }

  const banner = restaurant.banner_url || '/images/banner-maquis.png'

  return (
    <div className="pb-24">
      <div className="relative h-56 w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={banner || '/placeholder.svg'}
          alt={restaurant.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <button
          onClick={() => router.back()}
          aria-label="Retour"
          className="absolute left-4 top-4 flex size-10 items-center justify-center rounded-full bg-card/90 text-foreground shadow-sm backdrop-blur"
        >
          <ChevronLeft className="size-5" />
        </button>
        <FavoriteButton restaurantId={restaurantId} className="absolute right-4 top-4" />
      </div>

      <div className="relative -mt-8 rounded-t-3xl bg-card px-4 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-foreground text-balance">{restaurant.name}</h1>
            <p className="mt-1 text-sm capitalize text-muted-foreground">
              {restaurant.category.replace('_', ' ')}
            </p>
          </div>
          {restaurant.is_open ? (
            <Badge variant="success">Ouvert</Badge>
          ) : (
            <Badge variant="danger">Fermé</Badge>
          )}
        </div>

        {(restaurant.address || restaurant.city) && (
          <p className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-4" />
            {[restaurant.address, restaurant.city].filter(Boolean).join(', ')}
          </p>
        )}
        <a
          href={`tel:${restaurant.phone}`}
          className="mt-1.5 flex items-center gap-1.5 text-sm text-primary"
        >
          <Phone className="size-4" />
          {restaurant.phone}
        </a>

        {/* Quick stats */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-muted p-3 text-center">
            <Clock className="mx-auto size-5 text-primary" />
            <p className="mt-1 text-sm font-bold text-foreground">{restaurant.avg_prep_time} min</p>
            <p className="text-[11px] text-muted-foreground">Préparation</p>
          </div>
          <div className="rounded-2xl bg-muted p-3 text-center">
            <Bike className="mx-auto size-5 text-primary" />
            <p className="mt-1 text-sm font-bold text-foreground">
              {estimate
                ? formatPrice(estimate.delivery_fee)
                : restaurant.delivery_fee != null
                  ? formatPrice(restaurant.delivery_fee)
                  : restaurant.delivery_base_fee
                    ? formatPrice(Number(restaurant.delivery_base_fee))
                    : '—'}
            </p>
            <p className="text-[11px] text-muted-foreground">Livraison</p>
          </div>
          <div className="rounded-2xl bg-muted p-3 text-center">
            <Star className="mx-auto size-5 text-primary" />
            <p className="mt-1 text-sm font-bold text-foreground">
              {restaurant.distance_km != null ? formatDistance(restaurant.distance_km) : '—'}
            </p>
            <p className="text-[11px] text-muted-foreground">Distance</p>
          </div>
        </div>

        {/* Live delivery estimate */}
        {estimate?.deliverable && (
          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <Bike className="mt-0.5 size-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-semibold text-foreground">
                Livré en ~{formatMinutes(estimate.estimated_minutes)}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDistance(estimate.distance_km)} · frais {formatPrice(estimate.delivery_fee)}
                {estimate.is_peak_hour && ' · heure de pointe'}
              </p>
            </div>
          </div>
        )}

        {/* Closed notice */}
        {!restaurant.is_open && (
          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-border bg-muted p-4">
            <Info className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-sm font-semibold text-foreground">Actuellement fermé</p>
              <p className="text-xs text-muted-foreground">
                {typeof restaurant.opening_hours === 'string'
                  ? restaurant.opening_hours
                  : 'Réouverture prochainement'}
              </p>
            </div>
          </div>
        )}

        <div className="mt-5">
          {restaurant.is_open ? (
            <Link
              href={`/restaurants/${restaurant.id}/menu`}
              className="flex h-12 w-full items-center justify-center rounded-2xl bg-primary text-base font-semibold text-primary-foreground"
            >
              Voir le menu &amp; commander
            </Link>
          ) : (
            <Link
              href={`/restaurants/${restaurant.id}/menu`}
              className="flex h-12 w-full items-center justify-center rounded-2xl border border-border bg-muted text-base font-semibold text-muted-foreground"
            >
              Consulter le menu
            </Link>
          )}
        </div>
      </div>

      <CartFAB />
    </div>
  )
}
