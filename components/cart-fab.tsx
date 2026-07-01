'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '@/store/cart'
import { formatPrice } from '@/lib/format'

export function CartFAB() {
  const count = useCart((s) => s.itemCount())
  const subtotal = useCart((s) => s.subtotal())
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <AnimatePresence>
      {mounted && count > 0 && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="fixed bottom-20 left-1/2 z-40 w-[calc(100%-2rem)] max-w-[448px] -translate-x-1/2"
        >
          <Link
            href="/cart"
            className="flex items-center justify-between rounded-2xl bg-primary px-5 py-3.5 text-primary-foreground shadow-lg shadow-primary/30 active:scale-[0.99]"
          >
            <span className="flex items-center gap-2.5 font-semibold">
              <span className="relative flex size-8 items-center justify-center rounded-full bg-white/20">
                <ShoppingBag className="size-4" />
              </span>
              Voir le panier · {count} {count > 1 ? 'articles' : 'article'}
            </span>
            <span className="font-bold">{formatPrice(subtotal)}</span>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
