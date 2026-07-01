import { cn } from '@/lib/utils'

export function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('animate-pulse rounded-xl bg-muted-foreground/15', className)}
      {...props}
    />
  )
}
