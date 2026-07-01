'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { Toaster } from 'sonner'
import { useFcm } from '@/hooks/use-fcm'

function FcmInit() {
  useFcm()
  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={client}>
      <FcmInit />
      {children}
      <Toaster
        position="top-center"
        richColors
        toastOptions={{ style: { fontFamily: 'inherit' } }}
      />
    </QueryClientProvider>
  )
}
