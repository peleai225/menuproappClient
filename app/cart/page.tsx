'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { useCart } from '@/store/cart'
import { useAuth } from '@/store/auth'
import { useGeo } from '@/hooks/use-geo'
import { getDeliveryEstimate } from '@/lib/services'
import { formatPrice } from '@/lib/format'
import { PageHeader } from '@/components/page-header'
import { EmptyState } from '@/components/empty-state'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export default function CartPage() {
  const router = useRouter()
  const token = useAuth((s) => s.token)
  const restaurantId = useCart((s) => s.restaurantId)
  const restaurantName = useCart((s) => s.restaurantName)
  const items = useCart((s) => s.items)
  const updateQuantity = useCart((s) => s.updateQuantity)
  const removeItem = useCart((s) => s.removeItem)
  const subtotal = useCart((s) => s.subtotal())
  const { coords } = useGeo()

  const { data: estimate, isLoading: estimateLoading } = useQuery({
    queryKey: ['estimate', restaurantId, coords.lat, coords.lng],
    queryFn: () => getDeliveryEstimate(restaurantId!, coords.lat, coords.lng),
    enabled: !!restaurantId,
    retry: false,
  })

  const deliveryFee = estimate?.delivery_fee ?? 0
  const total = subtotal + deliveryFee

  if (items.length === 0) {
    return (
      <div>
        <PageHeader title="Panier" back={false} />
        <div className="px-4 pt-20">
          <EmptyState
            icon={ShoppingBag}
            title="Votre panier est vide"
            description="Explorez les restaurants et ajoutez des plats."
          />
          <div className="mt-6 flex justify-center">
            <Button asChild className="h-12 rounded-2xl px-8">
              <Link href="/restaurants">Explorer les restaurants</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  function handleOrder() {
    if (!token) {
      router.push('/login?redirect=/checkout')
    } else {
      router.push('/checkout')
    }
  }

  return (
    <div className="pb-28">
      <PageHeader title="Panier" subtitle={restaurantName ?? undefined} />

      <div className="space-y-3 px-4 pt-4">
        {items.map((item) => (
          <div key={item.dishId} className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-sm">
            <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image_url || '/placeholder.svg'}
                alt={item.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-semibold text-foreground">{item.name}</h3>
              <p className="text-sm font-bold text-primary">{formatPrice(item.price)}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => updateQuantity(item.dishId, item.quantity - 1)}
                className="flex size-8 items-center justify-center rounded-full bg-muted text-foreground"
              >
                <Minus className="size-4" />
              </button>
              <span className="min-w-5 text-center text-sm font-bold">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.dishId, item.quantity + 1)}
                className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground"
              >
                <Plus className="size-4" />
              </button>
            </div>
            <button
              onClick={() => removeItem(item.dishId)}
              className="flex size-8 items-center justify-center rounded-full text-destructive"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mx-4 mt-6 space-y-3 rounded-2xl bg-card p-4 shadow-sm">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Sous-total</span>
          <span className="font-semibold text-foreground">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Frais de livraison</span>
          {estimateLoading ? (
            <Skeleton className="h-4 w-20" />
          ) : (
            <span className="font-semibold text-foreground">{formatPrice(deliveryFee)}</span>
          )}
        </div>
        <div className="border-t border-border pt-3">
          <div className="flex justify-between">
            <span className="font-bold text-foreground">Total</span>
            <span className="text-lg font-bold text-primary">{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="fixed bottom-16 left-1/2 z-40 w-[calc(100%-2rem)] max-w-[448px] -translate-x-1/2">
        <button
          onClick={handleOrder}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-bold text-primary-foreground shadow-lg shadow-primary/30 active:scale-[0.99]"
        >
          Commander · {formatPrice(total)}
        </button>
      </div>
    </div>
  )
}
