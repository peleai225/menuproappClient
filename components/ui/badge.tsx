import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap',
  {
    variants: {
      variant: {
        default: 'bg-primary/10 text-primary',
        neutral: 'bg-muted text-muted-foreground',
        success: 'bg-success/12 text-success',
        warning: 'bg-primary/12 text-primary',
        danger: 'bg-destructive/12 text-destructive',
        info: 'bg-chart-3/12 text-chart-3',
        purple: 'bg-[oklch(0.55_0.2_300)]/12 text-[oklch(0.5_0.2_300)]',
        solid: 'bg-primary text-primary-foreground',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

export function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
