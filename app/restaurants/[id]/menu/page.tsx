'use client'

import { use, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getMenu, getRestaurant } from '@/lib/services'
import { PageHeader } from '@/components/page-header'
import { DishCard } from '@/components/dish-card'
import { CartFAB } from '@/components/cart-fab'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export default function MenuPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const restaurantId = Number(id)
  const [activeCategory, setActiveCategory] = useState<number | null>(null)
  const sectionsRef = useRef<Map<number, HTMLElement>>(new Map())

  const { data: restaurant } = useQuery({
    queryKey: ['restaurant', restaurantId],
    queryFn: () => getRestaurant(restaurantId),
  })

  const { data: menu, isLoading } = useQuery({
    queryKey: ['menu', restaurantId],
    queryFn: () => getMenu(restaurantId),
    staleTime: 10 * 60 * 1000,
  })

  function scrollToCategory(catId: number) {
    setActiveCategory(catId)
    const el = sectionsRef.current.get(catId)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const categories = menu?.categories ?? []
  const active = activeCategory ?? categories[0]?.id ?? null

  return (
    <div className="pb-28">
      <PageHeader
        title={restaurant?.name ?? 'Menu'}
        subtitle="Choisissez vos plats"
      />

      {/* Category tabs */}
      {categories.length > 0 && (
        <div className="no-scrollbar sticky top-[57px] z-30 flex gap-2 overflow-x-auto border-b border-border bg-card px-4 py-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => scrollToCategory(cat.id)}
              className={cn(
                'shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                active === cat.id
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border text-muted-foreground',
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-6 px-4 pt-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="size-24 shrink-0 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-5 w-1/3" />
              </div>
            </div>
          ))
        ) : (
          categories.map((cat) => (
            <section
              key={cat.id}
              ref={(el) => {
                if (el) sectionsRef.current.set(cat.id, el)
              }}
            >
              <h2 className="mb-3 text-base font-bold text-foreground">{cat.name}</h2>
              <div className="space-y-3">
                {cat.dishes.map((dish) => (
                  <DishCard
                    key={dish.id}
                    dish={dish}
                    restaurantId={restaurantId}
                    restaurantName={restaurant?.name ?? ''}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      <CartFAB />
    </div>
  )
}
