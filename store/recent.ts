'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface RecentItem {
  id: number
  name: string
  logo_url: string | null
  category: string
  visitedAt: number
}

interface RecentState {
  items: RecentItem[]
  add: (restaurant: { id: number; name: string; logo_url: string | null; category: string }) => void
}

export const useRecent = create<RecentState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (restaurant) => {
        const filtered = get().items.filter((r) => r.id !== restaurant.id)
        const item: RecentItem = { ...restaurant, visitedAt: Date.now() }
        set({ items: [item, ...filtered].slice(0, 10) })
      },
    }),
    { name: 'menupro-recent' },
  ),
)
