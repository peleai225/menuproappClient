'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { login } from '@/lib/services'
import { useAuth } from '@/store/auth'
import { apiErrorMessage } from '@/lib/api'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'

const schema = z.object({
  phone: z
    .string()
    .min(10, 'Numéro invalide')
    .regex(/^0[157]/, 'Le numéro doit commencer par 01, 05 ou 07'),
  password: z.string().min(6, 'Minimum 6 caractères'),
})

type FormValues = z.infer<typeof schema>

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
  const setAuth = useAuth((s) => s.setAuth)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    setLoading(true)
    try {
      const data = await login(values)
      setAuth(data.token, data.customer)
      toast.success('Connexion réussie')
      router.push(redirect)
    } catch (err: any) {
      const msg = err.response?.data?.message
      toast.error(msg || 'Identifiants incorrects')
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
          <h1 className="text-2xl font-bold text-foreground">Connexion</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Connectez-vous pour commander vos repas
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Input
              placeholder="Téléphone (07 08 12 15 20)"
              type="tel"
              {...register('phone')}
              aria-invalid={!!errors.phone}
            />
            {errors.phone && (
              <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>
            )}
          </div>
          <div>
            <Input
              placeholder="Mot de passe"
              type="password"
              {...register('password')}
              aria-invalid={!!errors.password}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex h-12 w-full items-center justify-center rounded-2xl bg-primary text-base font-bold text-primary-foreground shadow-sm disabled:opacity-60"
          >
            {loading ? <Spinner className="size-5" /> : 'Se connecter'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Pas de compte ?{' '}
          <Link href="/register" className="font-semibold text-primary">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  )
}
