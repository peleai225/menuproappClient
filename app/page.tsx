'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Heart, MapPin, Search, SearchX } from 'lucide-react'
import { getRestaurants } from '@/lib/services'
import { useAuth } from '@/store/auth'
import { useRecent } from '@/store/recent'
import { useFavorites } from '@/store/favorites'
import { CategoryChips } from '@/components/category-chips'
import { RestaurantCard, RestaurantCardSkeleton } from '@/components/restaurant-card'
import { EmptyState } from '@/components/empty-state'
import { CartFAB } from '@/components/cart-fab'

export default function HomePage() {
  const customer = useAuth((s) => s.customer)
  const recentItems = useRecent((s) => s.items)
  const favoriteCount = useFavorites((s) => s.ids.length)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')

  const allQuery = useQuery({
    queryKey: ['restaurants', 'all'],
    queryFn: () => getRestaurants(),
    staleTime: 5 * 60 * 1000,
  })

  const restaurants = useMemo(() => {
    let list = allQuery.data ?? []
    if (category !== 'all') list = list.filter((r) => r.category === category)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((r) => r.name.toLowerCase().includes(q))
    }
    return list
  }, [allQuery.data, category, search])

  const loading = allQuery.isLoading

  return (
    <div>
      <header className="rounded-b-3xl bg-secondary px-4 pb-6 pt-5 text-secondary-foreground">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-secondary-foreground/70">Livraison à</p>
            <p className="flex items-center gap-1 font-semibold">
              <MapPin className="size-4 text-primary" />
              {customer?.city || 'Abidjan'}, Côte d&apos;Ivoire
            </p>
          </div>
          <div className="flex size-11 items-center justify-center overflow-hidden rounded-full bg-white">
            {customer ? (
              <span className="text-lg font-bold text-primary">{customer.name[0].toUpperCase()}</span>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src="/icon-menupro.png" alt="MenuPro" className="size-9 object-contain" />
            )}
          </div>
        </div>

        <h1 className="mt-5 text-2xl font-bold leading-tight text-balance">
          {customer ? `Bonjour ${customer.name.split(' ')[0]},` : 'Bonjour,'} que mangeons-nous
          aujourd&apos;hui ?
        </h1>

        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-card px-4 py-3 shadow-sm">
          <Search className="size-5 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un restaurant..."
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
      </header>

      {/* Favorites link + Recent restaurants */}
      {(favoriteCount > 0 || recentItems.length > 0) && (
        <div className="px-4 pt-4">
          {favoriteCount > 0 && (
            <Link
              href="/favorites"
              className="mb-3 flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3"
            >
              <Heart className="size-4 fill-destructive text-destructive" />
              <span className="text-sm font-medium text-foreground">
                Mes favoris ({favoriteCount})
              </span>
            </Link>
          )}

          {recentItems.length > 0 && (
            <div className="mb-2">
              <h2 className="mb-2 text-sm font-semibold text-muted-foreground">Consultés récemment</h2>
              <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4">
                {recentItems.map((item) => (
                  <Link
                    key={item.id}
                    href={`/restaurants/${item.id}`}
                    className="flex shrink-0 flex-col items-center gap-1.5"
                  >
                    <div className="size-14 overflow-hidden rounded-full border-2 border-border bg-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.logo_url || '/icon-menupro.png'}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <span className="max-w-16 truncate text-[11px] font-medium text-muted-foreground">
                      {item.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="px-4 py-4">
        <CategoryChips value={category} onChange={setCategory} />
      </div>

      <section className="space-y-4 px-4 pb-24">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Restaurants</h2>
          {!loading && (
            <span className="text-xs text-muted-foreground">{restaurants.length} résultats</span>
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <RestaurantCardSkeleton key={i} />
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="Aucun restaurant trouvé"
            description="Essayez un autre nom ou une autre catégorie."
          />
        ) : (
          <div className="space-y-4">
            {restaurants.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} />
            ))}
          </div>
        )}
      </section>

      <CartFAB />
    </div>
  )
}
