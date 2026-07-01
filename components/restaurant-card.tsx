import Link from 'next/link'
import { Bike, Clock, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { FavoriteButton } from '@/components/favorite-button'
import { formatDistance, formatPrice } from '@/lib/format'
import type { Restaurant } from '@/lib/types'

export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  const banner = restaurant.banner_url || restaurant.logo_url || '/images/banner-maquis.png'
  return (
    <Link
      href={`/restaurants/${restaurant.id}`}
      className="block overflow-hidden rounded-2xl bg-card shadow-sm transition-transform active:scale-[0.99]"
    >
      <div className="relative h-36 w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={banner || '/placeholder.svg'}
          alt={restaurant.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute left-3 top-3">
          {restaurant.is_open ? (
            <Badge variant="solid" className="bg-success text-white">Ouvert</Badge>
          ) : (
            <Badge variant="neutral" className="bg-foreground/70 text-white">Fermé</Badge>
          )}
        </div>
        <div className="absolute right-3 top-3 flex items-center gap-2">
          {restaurant.distance_km != null && (
            <Badge className="bg-card/90 text-foreground backdrop-blur">
              <MapPin className="size-3" />
              {formatDistance(restaurant.distance_km)}
            </Badge>
          )}
          <FavoriteButton restaurantId={restaurant.id} />
        </div>
      </div>
      <div className="relative p-3.5">
        {/* Logo bulle */}
        {restaurant.logo_url && (
          <div className="absolute -top-6 right-3 size-12 overflow-hidden rounded-full border-2 border-card bg-white shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={restaurant.logo_url}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-foreground text-pretty">{restaurant.name}</h3>
        </div>
        <p className="mt-0.5 text-xs capitalize text-muted-foreground">
          {restaurant.category.replace('_', ' ')}{restaurant.city ? ` · ${restaurant.city}` : ''}
        </p>
        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="size-3.5" />
            {restaurant.avg_prep_time} min
          </span>
          <span className="flex items-center gap-1">
            <Bike className="size-3.5" />
            {restaurant.delivery_fee != null ? formatPrice(restaurant.delivery_fee) : 'Livraison'}
          </span>
        </div>
      </div>
    </Link>
  )
}

export function RestaurantCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-card shadow-sm">
      <Skeleton className="h-36 w-full rounded-none" />
      <div className="space-y-2 p-3.5">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-3/4" />
      </div>
    </div>
  )
}
