'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

export function PageHeader({
  title,
  subtitle,
  right,
  back = true,
  className,
}: {
  title: string
  subtitle?: string
  right?: React.ReactNode
  back?: boolean
  className?: string
}) {
  const router = useRouter()
  return (
    <header
      className={cn(
        'sticky top-0 z-40 flex items-center gap-3 border-b border-border bg-card/95 px-4 py-3 backdrop-blur',
        className,
      )}
    >
      {back && (
        <button
          type="button"
          aria-label="Retour"
          onClick={() => router.back()}
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:bg-muted-foreground/10"
        >
          <ChevronLeft className="size-5" />
        </button>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-base font-bold text-foreground">{title}</h1>
        {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {right}
    </header>
  )
}
