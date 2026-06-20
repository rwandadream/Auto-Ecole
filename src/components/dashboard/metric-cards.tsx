'use client'

import { ShoppingCart, UserPlus, PackageX, DollarSign, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

type Metric = {
  label: string
  value: string
  change: string
  lastMonth: string
  icon: React.ComponentType<{ className?: string }>
  iconBg: string
  iconColor: string
}

const metrics: Metric[] = [
  {
    label: 'Total Sales',
    value: '2500',
    change: '+4.9%',
    lastMonth: '2345',
    icon: ShoppingCart,
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
  },
  {
    label: 'New Customer',
    value: '110',
    change: '+7.5%',
    lastMonth: '89',
    icon: UserPlus,
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-600',
  },
  {
    label: 'Return Products',
    value: '72',
    change: '+6.0%',
    lastMonth: '60',
    icon: PackageX,
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-600',
  },
  {
    label: 'Total Revenue',
    value: '$8,220.64',
    change: '+4.9%',
    lastMonth: '$620.00',
    icon: DollarSign,
    iconBg: 'bg-sky-500/10',
    iconColor: 'text-sky-600',
  },
]

export function MetricCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon
        return (
          <div
            key={metric.label}
            className="group rounded-xl border border-border bg-card p-5 transition-all hover:shadow-md hover:shadow-black/5"
          >
            <div className="flex items-start justify-between">
              <div
                className={cn(
                  'flex h-11 w-11 items-center justify-center rounded-xl',
                  metric.iconBg
                )}
              >
                <Icon className={cn('h-5 w-5', metric.iconColor)} />
              </div>
              <div className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1">
                <TrendingUp className="h-3 w-3 text-emerald-600" />
                <span className="text-xs font-semibold text-emerald-600">
                  {metric.change}
                </span>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-muted-foreground">
                {metric.label}
              </p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
                {metric.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Last month: <span className="font-medium text-foreground">{metric.lastMonth}</span>
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
