'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, ShoppingBag, User } from 'lucide-react'
import { useCart } from '@/store/cart'
import { useAuth } from '@/store/auth'
import { cn } from '@/lib/utils'

const items = [
  { href: '/', label: 'Accueil', icon: Home, match: (p: string) => p === '/' },
  { href: '/restaurants', label: 'Explorer', icon: Search, match: (p: string) => p.startsWith('/restaurants') },
  { href: '/cart', label: 'Panier', icon: ShoppingBag, match: (p: string) => p === '/cart' },
  { href: '/profile', label: 'Profil', icon: User, match: (p: string) => p.startsWith('/profile') || p === '/login' || p === '/orders' },
]

export function BottomNav() {
  const pathname = usePathname()
  const count = useCart((s) => s.itemCount())
  const token = useAuth((s) => s.token)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // Hide on the fullscreen tracking map
  if (pathname.startsWith('/orders/track/')) return null

  return (
    <nav
      className="fixed bottom-0 left-1/2 z-50 w-full max-w-[480px] -translate-x-1/2 border-t border-border bg-card shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="flex h-16 items-stretch">
        {items.map((item) => {
          const active = item.match(pathname)
          const href = item.href === '/profile' && !token ? '/login' : item.href
          const Icon = item.icon
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={href}
                className={cn(
                  'flex h-full flex-col items-center justify-center gap-1 text-xs font-medium transition-colors',
                  active ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                <span className="relative">
                  <Icon className={cn('size-6', active && 'fill-primary/10')} />
                  {item.href === '/cart' && mounted && count > 0 && (
                    <span className="absolute -right-2.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
                      {count}
                    </span>
                  )}
                </span>
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
