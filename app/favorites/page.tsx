'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Heart } from 'lucide-react'
import { useFavorites } from '@/store/favorites'
import { getRestaurants } from '@/lib/services'
import { PageHeader } from '@/components/page-header'
import { RestaurantCard, RestaurantCardSkeleton } from '@/components/restaurant-card'
import { EmptyState } from '@/components/empty-state'
import { CartFAB } from '@/components/cart-fab'

export default function FavoritesPage() {
  const favoriteIds = useFavorites((s) => s.ids)

  const { data, isLoading } = useQuery({
    queryKey: ['restaurants', 'all'],
    queryFn: () => getRestaurants(),
    staleTime: 5 * 60 * 1000,
  })

  const favorites = useMemo(() => {
    if (!data) return []
    return data.filter((r) => favoriteIds.includes(r.id))
  }, [data, favoriteIds])

  return (
    <div className="pb-24">
      <PageHeader title="Mes favoris" />

      <section className="space-y-4 px-4 pt-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <RestaurantCardSkeleton key={i} />)
        ) : favorites.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="Aucun favori"
            description="Ajoutez des restaurants à vos favoris en appuyant sur le coeur."
          />
        ) : (
          favorites.map((r) => <RestaurantCard key={r.id} restaurant={r} />)
        )}
      </section>

      <CartFAB />
    </div>
  )
}
