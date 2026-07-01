'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface FavoritesState {
  ids: number[]
  toggle: (id: number) => void
  isFavorite: (id: number) => boolean
}

export const useFavorites = create<FavoritesState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) => {
        const { ids } = get()
        if (ids.includes(id)) {
          set({ ids: ids.filter((i) => i !== id) })
        } else {
          set({ ids: [...ids, id] })
        }
      },
      isFavorite: (id) => get().ids.includes(id),
    }),
    { name: 'menupro-favorites' },
  ),
)
