'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { LogOut, MapPin } from 'lucide-react'
import { useAuth } from '@/store/auth'
import { logout, updateProfile } from '@/lib/services'
import { apiErrorMessage } from '@/lib/api'
import { PageHeader } from '@/components/page-header'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email().or(z.literal('')).optional(),
  city: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export default function ProfilePage() {
  const router = useRouter()
  const token = useAuth((s) => s.token)
  const customer = useAuth((s) => s.customer)
  const setCustomer = useAuth((s) => s.setCustomer)
  const logoutStore = useAuth((s) => s.logout)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!token) router.replace('/login')
  }, [token, router])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: customer?.name ?? '',
      email: customer?.email ?? '',
      city: customer?.city ?? '',
    },
  })

  async function onSubmit(values: FormValues) {
    setSaving(true)
    try {
      const updated = await updateProfile(values)
      setCustomer(updated)
      toast.success('Profil mis à jour')
    } catch (err) {
      toast.error(apiErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  async function handleLogout() {
    await logout()
    logoutStore()
    router.push('/')
  }

  if (!token || !customer) return null

  return (
    <div className="pb-24">
      <PageHeader title="Mon profil" back={false} />

      <div className="px-4 pt-4">
        {/* Avatar */}
        <div className="mb-6 flex flex-col items-center">
          <div className="flex size-20 items-center justify-center rounded-full bg-primary text-3xl font-bold text-primary-foreground">
            {customer.name[0].toUpperCase()}
          </div>
          <p className="mt-2 font-bold text-foreground">{customer.name}</p>
          <p className="text-sm text-muted-foreground">{customer.phone}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Nom</label>
            <Input {...register('name')} aria-invalid={!!errors.name} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Email</label>
            <Input type="email" {...register('email')} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Ville</label>
            <Input {...register('city')} />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex h-12 w-full items-center justify-center rounded-2xl bg-primary text-base font-bold text-primary-foreground disabled:opacity-60"
          >
            {saving ? <Spinner className="size-5" /> : 'Enregistrer'}
          </button>
        </form>

        {/* Links */}
        <Link
          href="/profile/addresses"
          className="mt-6 flex items-center gap-3 rounded-2xl border border-border bg-card p-4"
        >
          <MapPin className="size-5 text-primary" />
          <span className="text-sm font-semibold text-foreground">Mes adresses</span>
        </Link>

        <Link
          href="/orders"
          className="mt-3 flex items-center gap-3 rounded-2xl border border-border bg-card p-4"
        >
          <span className="text-sm font-semibold text-foreground">Historique des commandes</span>
        </Link>

        <button
          onClick={handleLogout}
          className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-destructive/30 text-sm font-semibold text-destructive"
        >
          <LogOut className="size-4" />
          Se déconnecter
        </button>
      </div>
    </div>
  )
}
