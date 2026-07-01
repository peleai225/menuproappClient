'use client'

import { Flame, Leaf, Minus, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/store/cart'
import { formatPrice } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Dish } from '@/lib/types'

export function DishCard({
  dish,
  restaurantId,
  restaurantName,
}: {
  dish: Dish
  restaurantId: number
  restaurantName: string
}) {
  const quantity = useCart((s) => s.items.find((i) => i.dishId === dish.id)?.quantity ?? 0)
  const addItem = useCart((s) => s.addItem)
  const updateQuantity = useCart((s) => s.updateQuantity)

  const disabled = !dish.is_available

  function add() {
    addItem(restaurantId, restaurantName, {
      dishId: dish.id,
      name: dish.name,
      price: dish.price,
      image_url: dish.image_url,
    })
  }

  return (
    <div
      className={cn(
        'flex gap-3 rounded-2xl bg-card p-3 shadow-sm',
        disabled && 'opacity-60',
      )}
    >
      <div className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={dish.image_url || '/placeholder.svg?height=96&width=96&query=plat'}
          alt={dish.name}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start gap-1.5">
          <h3 className="text-sm font-semibold text-foreground text-pretty">{dish.name}</h3>
        </div>
        {dish.description && (
          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{dish.description}</p>
        )}
        <div className="mt-1 flex flex-wrap gap-1">
          {dish.is_spicy && (
            <Badge variant="danger" className="px-1.5 py-0">
              <Flame className="size-3" /> Épicé
            </Badge>
          )}
          {dish.is_vegetarian && (
            <Badge variant="success" className="px-1.5 py-0">
              <Leaf className="size-3" /> Végé
            </Badge>
          )}
        </div>

        <div className="mt-auto flex items-end justify-between pt-2">
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-foreground">{formatPrice(dish.price)}</span>
            {dish.compare_price && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(dish.compare_price)}
              </span>
            )}
          </div>

          {disabled ? (
            <Badge variant="neutral">Indisponible</Badge>
          ) : quantity === 0 ? (
            <button
              type="button"
              onClick={add}
              aria-label={`Ajouter ${dish.name}`}
              className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm shadow-primary/30 transition-transform active:scale-90"
            >
              <Plus className="size-5" />
            </button>
          ) : (
            <div className="flex items-center gap-2 rounded-full bg-primary px-1 py-1 text-primary-foreground">
              <button
                type="button"
                aria-label="Retirer un"
                onClick={() => updateQuantity(dish.id, quantity - 1)}
                className="flex size-7 items-center justify-center rounded-full bg-white/20 transition active:scale-90"
              >
                <Minus className="size-4" />
              </button>
              <span className="min-w-4 text-center text-sm font-bold">{quantity}</span>
              <button
                type="button"
                aria-label="Ajouter un"
                onClick={() => updateQuantity(dish.id, quantity + 1)}
                className="flex size-7 items-center justify-center rounded-full bg-white/20 transition active:scale-90"
              >
                <Plus className="size-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
