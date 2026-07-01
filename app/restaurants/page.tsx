'use client'

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { SearchX, SlidersHorizontal } from 'lucide-react'
import { getRestaurants } from '@/lib/services'
import { useGeo } from '@/hooks/use-geo'
import { CATEGORIES, CI_CITIES } from '@/lib/format'
import { PageHeader } from '@/components/page-header'
import { RestaurantCard, RestaurantCardSkeleton } from '@/components/restaurant-card'
import { EmptyState } from '@/components/empty-state'
import { CartFAB } from '@/components/cart-fab'
import { cn } from '@/lib/utils'

export default function ExplorePage() {
  const { granted } = useGeo()
  const [city, setCity] = useState<string>('')
  const [category, setCategory] = useState('all')
  const [openNow, setOpenNow] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['restaurants', 'explore'],
    queryFn: () => getRestaurants(),
  })

  const restaurants = useMemo(() => {
    let list = data ?? []
    if (city) list = list.filter((r) => r.city === city)
    if (category !== 'all') list = list.filter((r) => r.category === category)
    if (openNow) list = list.filter((r) => r.is_open)
    if (granted) {
      list = [...list].sort((a, b) => (a.distance_km ?? 99) - (b.distance_km ?? 99))
    }
    return list
  }, [data, city, category, openNow, granted])

  return (
    <div>
      <PageHeader title="Explorer" subtitle="Tous les restaurants" back={false} />

      <div className="space-y-3 border-b border-border bg-card px-4 py-4">
        {/* City */}
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
          <button
            onClick={() => setCity('')}
            className={cn(
              'shrink-0 rounded-full border px-4 py-2 text-sm font-medium',
              city === '' ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground',
            )}
          >
            Toutes les villes
          </button>
          {CI_CITIES.map((c) => (
            <button
              key={c}
              onClick={() => setCity(c)}
              className={cn(
                'shrink-0 rounded-full border px-4 py-2 text-sm font-medium',
                city === c ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground',
              )}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Category */}
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setCategory(cat.key)}
              className={cn(
                'shrink-0 rounded-full border px-4 py-2 text-sm font-medium',
                category === cat.key ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground',
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Open now toggle */}
        <button
          onClick={() => setOpenNow((v) => !v)}
          className={cn(
            'flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium',
            openNow ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground',
          )}
        >
          <SlidersHorizontal className="size-4" />
          Ouvert maintenant
        </button>
      </div>

      <section className="space-y-4 px-4 py-4 pb-24">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <RestaurantCardSkeleton key={i} />)
        ) : restaurants.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="Aucun restaurant"
            description="Aucun restaurant ne correspond à vos filtres."
          />
        ) : (
          restaurants.map((r) => <RestaurantCard key={r.id} restaurant={r} />)
        )}
      </section>

      <CartFAB />
    </div>
  )
}
