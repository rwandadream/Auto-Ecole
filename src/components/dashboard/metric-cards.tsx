'use client'

import { Wallet, TrendingDown, TrendingUp, Users, Award, Clock } from 'lucide-react'
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
    label: "Chiffre d'affaires",
    value: '8 220 640 F',
    change: '+4.9%',
    lastMonth: '7 834 000 F',
    icon: Wallet,
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
  },
  {
    label: 'Total dépenses',
    value: '2 145 300 F',
    change: '+2.3%',
    lastMonth: '2 097 000 F',
    icon: TrendingDown,
    iconBg: 'bg-rose-500/10',
    iconColor: 'text-rose-600',
  },
  {
    label: 'Bénéfice net',
    value: '6 075 340 F',
    change: '+6.8%',
    lastMonth: '5 737 000 F',
    icon: TrendingUp,
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-600',
  },
  {
    label: 'Élèves inscrits',
    value: '248',
    change: '+12',
    lastMonth: '236',
    icon: Users,
    iconBg: 'bg-sky-500/10',
    iconColor: 'text-sky-600',
  },
  {
    label: 'Taux de réussite',
    value: '78,5%',
    change: '+3.2%',
    lastMonth: '75,3%',
    icon: Award,
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-600',
  },
  {
    label: 'Factures en attente',
    value: '5',
    change: '1 240 000 F',
    lastMonth: '3 impayées',
    icon: Clock,
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
  },
]

export function MetricCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {metrics.map((metric) => {
        const Icon = metric.icon
        const isNegative = metric.label === 'Total dépenses'
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
              <div
                className={cn(
                  'flex items-center gap-1 rounded-full px-2 py-1',
                  isNegative
                    ? 'bg-rose-500/10'
                    : 'bg-emerald-500/10'
                )}
              >
                <TrendingUp
                  className={cn(
                    'h-3 w-3',
                    isNegative ? 'rotate-180 text-rose-600' : 'text-emerald-600'
                  )}
                />
                <span
                  className={cn(
                    'text-xs font-semibold',
                    isNegative ? 'text-rose-600' : 'text-emerald-600'
                  )}
                >
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
                Mois précédent :{' '}
                <span className="font-medium text-foreground">{metric.lastMonth}</span>
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
