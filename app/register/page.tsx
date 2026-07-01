'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import axios from 'axios'
import { register as registerApi } from '@/lib/services'
import { useAuth } from '@/store/auth'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'

const schema = z.object({
  name: z.string().min(2, 'Nom trop court'),
  phone: z
    .string()
    .min(10, 'Numéro invalide')
    .regex(/^0[157]/, 'Le numéro doit commencer par 01, 05 ou 07'),
  password: z.string().min(6, 'Minimum 6 caractères'),
  email: z.string().email('Email invalide').or(z.literal('')).optional(),
  city: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export default function RegisterPage() {
  const router = useRouter()
  const setAuth = useAuth((s) => s.setAuth)
  const [loading, setLoading] = useState(false)

  const {
    register: reg,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    setLoading(true)
    try {
      const data = await registerApi({
        name: values.name,
        phone: values.phone,
        password: values.password,
        email: values.email && values.email.trim() ? values.email : undefined,
        city: values.city && values.city.trim() ? values.city : undefined,
      })
      setAuth(data.token, data.customer)
      toast.success('Compte créé avec succès !')
      router.push('/')
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 422) {
        const apiErrors = err.response.data.errors
        if (apiErrors) {
          const firstError = Object.values(apiErrors)[0] as string[]
          toast.error(firstError[0])
        } else {
          toast.error(err.response.data.message ?? 'Données invalides')
        }
      } else if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message ?? "Erreur lors de l'inscription")
      } else {
        toast.error("Erreur lors de l'inscription")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-menupro.png" alt="MenuPro" className="mx-auto mb-4 h-12 w-auto" />
          <h1 className="text-2xl font-bold text-foreground">Créer un compte</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Inscrivez-vous pour commander
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Input
              placeholder="Nom complet"
              {...reg('name')}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div>
            <Input
              placeholder="Téléphone (07 08 12 15 20)"
              type="tel"
              {...reg('phone')}
              aria-invalid={!!errors.phone}
            />
            {errors.phone && (
              <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>
            )}
          </div>
          <div>
            <Input
              placeholder="Mot de passe (min. 6 caractères)"
              type="password"
              {...reg('password')}
              aria-invalid={!!errors.password}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>
          <div>
            <Input
              placeholder="Email (optionnel)"
              type="email"
              {...reg('email')}
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div>
            <Input placeholder="Ville (optionnel)" {...reg('city')} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex h-12 w-full items-center justify-center rounded-2xl bg-primary text-base font-bold text-primary-foreground shadow-sm disabled:opacity-60"
          >
            {loading ? <Spinner className="size-5" /> : 'Créer mon compte'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Déjà un compte ?{' '}
          <Link href="/login" className="font-semibold text-primary">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}
