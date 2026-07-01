'use client'

import Link from 'next/link'
import { XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PaymentErrorPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <div className="mb-5 flex size-20 items-center justify-center rounded-full bg-destructive/10">
        <XCircle className="size-10 text-destructive" />
      </div>
      <h1 className="text-2xl font-bold text-foreground">Paiement échoué</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Le paiement n&apos;a pas pu être effectué. Veuillez réessayer.
      </p>
      <div className="mt-8 flex gap-3">
        <Button variant="outline" asChild className="h-12 rounded-2xl px-6">
          <Link href="/">Accueil</Link>
        </Button>
        <Button asChild className="h-12 rounded-2xl px-6">
          <Link href="/cart">Réessayer</Link>
        </Button>
      </div>
    </div>
  )
}
