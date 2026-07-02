'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MapPin, Plus, Star, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/store/auth'
import { getAddresses, createAddress, deleteAddress } from '@/lib/services'
import { apiErrorMessage } from '@/lib/api'
import { PageHeader } from '@/components/page-header'
import { EmptyState } from '@/components/empty-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Skeleton } from '@/components/ui/skeleton'
import { LocationPicker, type LocationValue } from '@/components/location-picker'
import type { Address } from '@/lib/types'

export default function AddressesPage() {
  const router = useRouter()
  const token = useAuth((s) => s.token)
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [label, setLabel] = useState('Maison')
  const [location, setLocation] = useState<LocationValue | null>(null)
  const [instructions, setInstructions] = useState('')

  useEffect(() => {
    if (!token) router.replace('/login')
  }, [token, router])

  const { data: addresses, isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: getAddresses,
    enabled: !!token,
  })

  const createMutation = useMutation({
    mutationFn: (payload: Partial<Address>) => createAddress(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      toast.success('Adresse ajoutée')
      setShowForm(false)
      setLocation(null)
      setInstructions('')
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      toast.success('Adresse supprimée')
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  })

  function handleAdd() {
    if (!location) {
      toast.error('Veuillez saisir une adresse')
      return
    }
    createMutation.mutate({
      label,
      address: location.address,
      city: location.city,
      instructions: instructions || undefined,
      is_default: !addresses || addresses.length === 0,
      latitude: location.lat,
      longitude: location.lng,
    })
  }

  if (!token) return null

  return (
    <div className="pb-24">
      <PageHeader title="Mes adresses" />

      <div className="space-y-3 px-4 pt-4">
        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))
        ) : !addresses || addresses.length === 0 ? (
          <EmptyState
            icon={MapPin}
            title="Aucune adresse"
            description="Ajoutez votre première adresse de livraison."
          />
        ) : (
          addresses.map((addr) => (
            <div key={addr.id} className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-sm">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{addr.label}</span>
                  {addr.is_default && <Star className="size-3.5 fill-primary text-primary" />}
                </div>
                <p className="text-xs text-muted-foreground">{addr.address}, {addr.city}</p>
                {addr.instructions && (
                  <p className="mt-0.5 text-xs italic text-muted-foreground">{addr.instructions}</p>
                )}
              </div>
              <button
                onClick={() => deleteMutation.mutate(addr.id)}
                className="flex size-8 items-center justify-center rounded-full text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))
        )}

        {/* Add form */}
        {showForm ? (
          <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
            <div className="flex gap-2">
              {['Maison', 'Bureau', 'Autre'].map((l) => (
                <button
                  key={l}
                  onClick={() => setLabel(l)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                    label === l ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
            <LocationPicker
              value={location ?? undefined}
              onChange={setLocation}
              placeholder="Rechercher ou localiser sur la carte"
            />
            <Input
              placeholder="Instructions pour le livreur (optionnel)"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>
                Annuler
              </Button>
              <button
                onClick={handleAdd}
                disabled={createMutation.isPending || !location}
                className="flex h-9 flex-1 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                {createMutation.isPending ? <Spinner className="size-4" /> : 'Ajouter'}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border py-4 text-sm font-medium text-muted-foreground"
          >
            <Plus className="size-4" />
            Ajouter une adresse
          </button>
        )}
      </div>
    </div>
  )
}
