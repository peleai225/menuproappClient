'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  dishId: number
  name: string
  price: number // centimes
  image_url?: string | null
  quantity: number
  notes?: string
}

interface PendingAdd {
  restaurantId: number
  restaurantName: string
  item: Omit<CartItem, 'quantity'> & { quantity?: number }
}

interface CartState {
  restaurantId: number | null
  restaurantName: string | null
  items: CartItem[]
  /** Set when addItem is blocked by a different restaurant. UI shows a dialog. */
  pending: PendingAdd | null

  addItem: (
    restaurantId: number,
    restaurantName: string,
    item: Omit<CartItem, 'quantity'> & { quantity?: number },
  ) => void
  confirmPending: () => void
  cancelPending: () => void
  updateQuantity: (dishId: number, quantity: number) => void
  removeItem: (dishId: number) => void
  clear: () => void
  subtotal: () => number
  itemCount: () => number
  quantityOf: (dishId: number) => number
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      restaurantId: null,
      restaurantName: null,
      items: [],
      pending: null,

      addItem: (restaurantId, restaurantName, item) => {
        const state = get()
        // Different restaurant -> ask for confirmation before clearing
        if (
          state.restaurantId !== null &&
          state.restaurantId !== restaurantId &&
          state.items.length > 0
        ) {
          set({ pending: { restaurantId, restaurantName, item } })
          return
        }

        const qty = item.quantity ?? 1
        const existing = state.items.find((i) => i.dishId === item.dishId)
        if (existing) {
          set({
            items: state.items.map((i) =>
              i.dishId === item.dishId ? { ...i, quantity: i.quantity + qty } : i,
            ),
          })
        } else {
          set({
            restaurantId,
            restaurantName,
            items: [...state.items, { ...item, quantity: qty }],
          })
        }
      },

      confirmPending: () => {
        const { pending } = get()
        if (!pending) return
        set({
          restaurantId: pending.restaurantId,
          restaurantName: pending.restaurantName,
          items: [{ ...pending.item, quantity: pending.item.quantity ?? 1 }],
          pending: null,
        })
      },

      cancelPending: () => set({ pending: null }),

      updateQuantity: (dishId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(dishId)
          return
        }
        set({
          items: get().items.map((i) =>
            i.dishId === dishId ? { ...i, quantity } : i,
          ),
        })
      },

      removeItem: (dishId) => {
        const items = get().items.filter((i) => i.dishId !== dishId)
        set(
          items.length === 0
            ? { items, restaurantId: null, restaurantName: null }
            : { items },
        )
      },

      clear: () => set({ items: [], restaurantId: null, restaurantName: null }),

      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      quantityOf: (dishId) =>
        get().items.find((i) => i.dishId === dishId)?.quantity ?? 0,
    }),
    { name: 'menupro-cart' },
  ),
)
