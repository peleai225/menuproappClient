'use client'

import { ShoppingBag } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { useCart } from '@/store/cart'

export function CartSwitchDialog() {
  const pending = useCart((s) => s.pending)
  const confirmPending = useCart((s) => s.confirmPending)
  const cancelPending = useCart((s) => s.cancelPending)

  return (
    <Modal open={!!pending} onClose={cancelPending}>
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10">
          <ShoppingBag className="size-7 text-primary" />
        </div>
        <h2 className="text-lg font-bold text-foreground">Vider le panier ?</h2>
        <p className="mt-2 text-sm text-muted-foreground text-pretty">
          Votre panier contient des articles d&apos;un autre restaurant. Voulez-vous le vider et
          commander chez <span className="font-semibold text-foreground">{pending?.restaurantName}</span> ?
        </p>
        <div className="mt-6 flex w-full gap-3">
          <Button variant="outline" size="lg" className="h-12 flex-1 rounded-xl text-sm" onClick={cancelPending}>
            Annuler
          </Button>
          <Button size="lg" className="h-12 flex-1 rounded-xl text-sm" onClick={confirmPending}>
            Vider et commander
          </Button>
        </div>
      </div>
    </Modal>
  )
}
