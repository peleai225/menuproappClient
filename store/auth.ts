'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Customer } from '@/lib/types'

interface AuthState {
  token: string | null
  customer: Customer | null
  hydrated: boolean
  setAuth: (token: string, customer: Customer) => void
  setCustomer: (customer: Customer) => void
  logout: () => void
  setHydrated: () => void
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      customer: null,
      hydrated: false,
      setAuth: (token, customer) => {
        // Mirror the token to a plain key so the axios interceptor can read it
        if (typeof window !== 'undefined') localStorage.setItem('token', token)
        set({ token, customer })
      },
      setCustomer: (customer) => set({ customer }),
      logout: () => {
        if (typeof window !== 'undefined') localStorage.removeItem('token')
        set({ token: null, customer: null })
      },
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: 'menupro-auth',
      onRehydrateStorage: () => (state) => {
        state?.setHydrated()
        // Keep the plain token key in sync after rehydration
        if (typeof window !== 'undefined' && state?.token) {
          localStorage.setItem('token', state.token)
        }
      },
    },
  ),
)
