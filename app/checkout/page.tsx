'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Banknote, MapPin, Store, Wallet } from 'lucide-react'
import { toast } from 'sonner'
import { useCart } from '@/store/cart'
import { useAuth } from '@/store/auth'
import { useGeo } from '@/hooks/use-geo'
import { createOrder, getAddresses, getDeliveryEstimate, initiatePayment } from '@/lib/services'
import { apiErrorMessage } from '@/lib/api'
import { formatPrice } from '@/lib/format'
import { PageHeader } from '@/components/page-header'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { LocationPicker } from '@/components/location-picker'
import type { Address } from '@/lib/types'

type PaymentMethod = 'wave' | 'cash'

export default function CheckoutPage() {
  const router = useRouter()
  const token = useAuth((s) => s.token)
  const restaurantId = useCart((s) => s.restaurantId)
  const restaurantName = useCart((s) => s.restaurantName)
  const items = useCart((s) => s.items)
  const subtotal = useCart((s) => s.subtotal())
  const clear = useCart((s) => s.clear)
  const { coords } = useGeo()

  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null)
  const [manualAddress, setManualAddress] = useState('')
  const [manualCity, setManualCity] = useState('Abidjan')
  const [manualLat, setManualLat] = useState<number | null>(null)
  const [manualLng, setManualLng] = useState<number | null>(null)
  const [instructions, setInstructions] = useState('')
  const [promoCode, setPromoCode] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('wave')
  const [loading, setLoading] = useState(false)

  const { data: addresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: getAddresses,
    enabled: !!token,
  })

  const { data: estimate } = useQuery({
    queryKey: ['estimate', restaurantId, coords.lat, coords.lng],
    queryFn: () => getDeliveryEstimate(restaurantId!, coords.lat, coords.lng),
    enabled: !!restaurantId,
    retry: false,
  })

  const deliveryFee = estimate?.delivery_fee ?? 0
  const total = subtotal + deliveryFee

  if (!token) {
    router.replace('/login?redirect=/checkout')
    return null
  }

  if (!restaurantId || items.length === 0) {
    router.replace('/cart')
    return null
  }

  async function handleSubmit() {
    setLoading(true)
    try {
      const deliveryLat = selectedAddress ? Number(selectedAddress.latitude) : (manualLat ?? coords.lat)
      const deliveryLng = selectedAddress ? Number(selectedAddress.longitude) : (manualLng ?? coords.lng)
      const deliveryAddress = selectedAddress ? selectedAddress.address : manualAddress
      const deliveryCity = selectedAddress ? selectedAddress.city : manualCity

      if (!deliveryAddress.trim()) {
        toast.error('Veuillez indiquer une adresse de livraison')
        setLoading(false)
        return
      }

      const orderResponse = await createOrder({
        restaurant_id: restaurantId!,
        items: items.map((i) => ({ dish_id: i.dishId, quantity: i.quantity, notes: i.notes })),
        delivery_lat: deliveryLat,
        delivery_lng: deliveryLng,
        delivery_address: deliveryAddress,
        delivery_city: deliveryCity,
        delivery_instructions: instructions || undefined,
        payment_method: paymentMethod,
      })

      clear()

      if (paymentMethod === 'cash') {
        toast.success('Commande passée ! Préparez le montant exact à la livraison.')
        router.replace('/orders')
        return
      }

      // Paiement en ligne Wave
      const { payment_url } = await initiatePayment(orderResponse.order.id)
      window.location.href = payment_url.startsWith('http')
        ? payment_url
        : `${process.env.NEXT_PUBLIC_API_URL || 'https://menupro.ci'}${payment_url}`
    } catch (err) {
      toast.error(apiErrorMessage(err))
      setLoading(false)
    }
  }

  return (
    <div className="pb-28">
      <PageHeader title="Confirmation" subtitle="Vérifiez et payez" />

      {/* Restaurant + items */}
      <div className="mx-4 mt-4 rounded-2xl bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Store className="size-4 text-primary" />
          {restaurantName}
        </div>
        <div className="mt-3 space-y-2">
          {items.map((item) => (
            <div key={item.dishId} className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {item.quantity}× {item.name}
              </span>
              <span className="font-medium text-foreground">{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery address */}
      <div className="mx-4 mt-4 rounded-2xl bg-card p-4 shadow-sm">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <MapPin className="size-4 text-primary" />
          Adresse de livraison
        </h2>

        {addresses && addresses.length > 0 && (
          <div className="mt-3 space-y-2">
            {addresses.map((addr) => (
              <button
                key={addr.id}
                onClick={() => setSelectedAddress(addr)}
                className={`w-full rounded-xl border p-3 text-left text-sm transition-colors ${
                  selectedAddress?.id === addr.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border'
                }`}
              >
                <span className="font-medium">{addr.label}</span>
                <span className="block text-xs text-muted-foreground">{addr.address}, {addr.city}</span>
              </button>
            ))}
            <button
              onClick={() => setSelectedAddress(null)}
              className={`w-full rounded-xl border p-3 text-left text-sm transition-colors ${
                selectedAddress === null ? 'border-primary bg-primary/5' : 'border-border'
              }`}
            >
              Nouvelle adresse
            </button>
          </div>
        )}

        {!selectedAddress && (
          <div className="mt-3 space-y-3">
            <LocationPicker
              value={manualAddress ? { lat: manualLat ?? coords.lat, lng: manualLng ?? coords.lng, address: manualAddress, city: manualCity } : undefined}
              onChange={({ lat, lng, address, city }) => {
                setManualLat(lat)
                setManualLng(lng)
                setManualAddress(address)
                setManualCity(city)
              }}
              placeholder="Où livrer ?"
            />
            <Input
              placeholder="Instructions pour le livreur (optionnel)"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Méthode de paiement */}
      <div className="mx-4 mt-4 rounded-2xl bg-card p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Mode de paiement</h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setPaymentMethod('wave')}
            className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
              paymentMethod === 'wave'
                ? 'border-primary bg-primary/5'
                : 'border-border'
            }`}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100">
              <Wallet className="size-5 text-blue-600" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">Wave</p>
              <p className="text-xs text-muted-foreground">Paiement mobile</p>
            </div>
          </button>

          <button
            onClick={() => setPaymentMethod('cash')}
            className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
              paymentMethod === 'cash'
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-border'
            }`}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
              <Banknote className="size-5 text-emerald-600" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">Espèces</p>
              <p className="text-xs text-muted-foreground">À la livraison</p>
            </div>
          </button>
        </div>

        {paymentMethod === 'cash' && (
          <p className="mt-3 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700">
            💵 Préparez <span className="font-bold">{formatPrice(total)}</span> en espèces. Le livreur encaissera à la livraison.
          </p>
        )}
      </div>

      {/* Promo code */}
      <div className="mx-4 mt-4 rounded-2xl bg-card p-4 shadow-sm">
        <div className="flex gap-2">
          <Input
            placeholder="Code promo"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            className="flex-1"
          />
          <button
            type="button"
            onClick={() => {
              if (promoCode.trim()) toast.info('Code promo non reconnu')
            }}
            className="shrink-0 rounded-xl bg-secondary px-4 text-sm font-semibold text-secondary-foreground"
          >
            Appliquer
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="mx-4 mt-4 space-y-2 rounded-2xl bg-card p-4 shadow-sm">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Sous-total</span>
          <span className="font-semibold">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Livraison</span>
          <span className="font-semibold">{formatPrice(deliveryFee)}</span>
        </div>
        <div className="border-t border-border pt-2">
          <div className="flex justify-between">
            <span className="font-bold">Total</span>
            <span className="text-lg font-bold text-primary">{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="fixed bottom-16 left-1/2 z-40 w-[calc(100%-2rem)] max-w-[448px] -translate-x-1/2">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-bold text-white shadow-lg disabled:opacity-60 active:scale-[0.99] ${
            paymentMethod === 'cash'
              ? 'bg-emerald-500 shadow-emerald-500/30'
              : 'bg-primary shadow-primary/30'
          }`}
        >
          {loading ? (
            <Spinner className="size-5" />
          ) : paymentMethod === 'cash' ? (
            <>
              <Banknote className="size-5" />
              Commander · Payer à la livraison
            </>
          ) : (
            <>
              <Wallet className="size-5" />
              Payer avec Wave · {formatPrice(total)}
            </>
          )}
        </button>
      </div>
    </div>
  )
}
