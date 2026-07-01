import { Badge } from '@/components/ui/badge'
import type { OrderStatus } from '@/lib/types'

const MAP: Record<OrderStatus, { label: string; variant: React.ComponentProps<typeof Badge>['variant'] }> = {
  pending_payment: { label: 'En attente de paiement', variant: 'warning' },
  confirmed: { label: 'Confirmée', variant: 'info' },
  preparing: { label: 'En préparation', variant: 'info' },
  ready: { label: 'Prête', variant: 'info' },
  delivering: { label: 'En livraison', variant: 'purple' },
  completed: { label: 'Livrée', variant: 'success' },
  cancelled: { label: 'Annulée', variant: 'danger' },
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = MAP[status] ?? { label: status, variant: 'neutral' as const }
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>
}
