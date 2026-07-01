'use client'

import { Heart } from 'lucide-react'
import { useFavorites } from '@/store/favorites'
import { cn } from '@/lib/utils'

export function FavoriteButton({ restaurantId, className }: { restaurantId: number; className?: string }) {
  const isFav = useFavorites((s) => s.ids.includes(restaurantId))
  const toggle = useFavorites((s) => s.toggle)

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggle(restaurantId)
      }}
      aria-label={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      className={cn(
        'flex size-9 items-center justify-center rounded-full bg-card/90 shadow-sm backdrop-blur transition-transform active:scale-90',
        className,
      )}
    >
      <Heart
        className={cn(
          'size-5 transition-colors',
          isFav ? 'fill-destructive text-destructive' : 'text-muted-foreground',
        )}
      />
    </button>
  )
}
