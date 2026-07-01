import type { LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function EmptyState({
  icon: Icon,
  title,
  description,
  ctaLabel,
  ctaHref,
}: {
  icon: LucideIcon
  title: string
  description: string
  ctaLabel?: string
  ctaHref?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-16 text-center">
      <div className="mb-5 flex size-20 items-center justify-center rounded-full bg-primary/10">
        <Icon className="size-9 text-primary" />
      </div>
      <h2 className="text-lg font-bold text-foreground text-balance">{title}</h2>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground text-pretty">{description}</p>
      {ctaLabel && ctaHref && (
        <Link
          href={ctaHref}
          className={cn(buttonVariants({ size: 'lg' }), 'mt-6 h-12 rounded-xl px-6 text-sm')}
        >
          {ctaLabel}
        </Link>
      )}
    </div>
  )
}
