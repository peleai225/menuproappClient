'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle } from 'lucide-react'

export default function PaymentSuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  )
}

function SuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('tracking_token') || searchParams.get('token')

  useEffect(() => {
    const timer = setTimeout(() => {
      if (token) {
        router.replace(`/orders/track/${token}`)
      } else {
        router.replace('/orders')
      }
    }, 3000)
    return () => clearTimeout(timer)
  }, [token, router])

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <div className="mb-5 flex size-20 items-center justify-center rounded-full bg-success/10">
        <CheckCircle className="size-10 text-success" />
      </div>
      <h1 className="text-2xl font-bold text-foreground">Paiement réussi !</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Votre commande est en cours de traitement. Vous allez être redirigé vers le suivi...
      </p>
    </div>
  )
}
