'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ClipboardList } from 'lucide-react'
import { useAuth } from '@/store/auth'
import { getOrderHistory } from '@/lib/services'
import { formatPrice } from '@/lib/format'
import { PageHeader } from '@/components/page-header'
import { StatusBadge } from '@/components/status-badge'
import { EmptyState } from '@/components/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function OrdersPage() {
  const router = useRouter()
  const token = useAuth((s) => s.token)

  useEffect(() => {
    if (!token) router.replace('/login?redirect=/orders')
  }, [token, router])

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: getOrderHistory,
    enabled: !!token,
    staleTime: 0,
  })

  if (!token) return null

  return (
    <div className="pb-24">
      <PageHeader title="Mes commandes" back={false} />

      <div className="space-y-3 px-4 pt-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))
        ) : !orders || orders.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Aucune commande"
            description="Vos commandes apparaîtront ici."
          />
        ) : (
          orders.map((order) => (
            <div key={order.id} className="rounded-2xl bg-card p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {order.restaurant_name ?? `Commande #${order.reference}`}
                  </h3>
                  {order.created_at && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {format(new Date(order.created_at), 'dd MMM yyyy à HH:mm', { locale: fr })}
                    </p>
                  )}
                </div>
                <StatusBadge status={order.status} />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm font-bold text-foreground">{formatPrice(order.total)}</span>
                {(order.status === 'delivering' || order.status === 'preparing' || order.status === 'confirmed') && (
                  <Link
                    href={`/orders/track/${order.tracking_token}`}
                    className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground"
                  >
                    Suivre
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
