'use client'

import { CATEGORIES } from '@/lib/format'
import { cn } from '@/lib/utils'

export function CategoryChips({
  value,
  onChange,
}: {
  value: string
  onChange: (key: string) => void
}) {
  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.key}
          type="button"
          onClick={() => onChange(cat.key)}
          className={cn(
            'shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
            value === cat.key
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-card text-muted-foreground',
          )}
        >
          {cat.label}
        </button>
      ))}
    </div>
  )
}
