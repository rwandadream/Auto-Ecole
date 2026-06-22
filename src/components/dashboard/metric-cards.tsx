'use client'

import { useMemo } from 'react'
import { Wallet, TrendingDown, TrendingUp, Users, Award, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDataStore } from '@/store/data-store'
import { formatXOF } from '@/components/dashboard/views/shared'
import {
  countByMonth,
  formatPercentChange,
  monthKey,
  previousMonthKey,
  sumByMonth,
} from '@/lib/stats'

type Metric = {
  label: string
  value: string
  change: string
  lastMonth: string
  icon: React.ComponentType<{ className?: string }>
  iconBg: string
  iconColor: string
  isNegative?: boolean
}

export function MetricCards() {
  const factures = useDataStore((s) => s.factures)
  const depenses = useDataStore((s) => s.depenses)
  const eleves = useDataStore((s) => s.eleves)
  const examens = useDataStore((s) => s.examens)

  const metrics: Metric[] = useMemo(() => {
    const currentMonth = monthKey(new Date())
    const prevMonth = previousMonthKey(currentMonth)

    const caCurrent = sumByMonth(factures, (f) => f.dateEmission, (f) => f.montant, currentMonth)
    const caPrev = sumByMonth(factures, (f) => f.dateEmission, (f) => f.montant, prevMonth)
    const depCurrent = sumByMonth(depenses, (d) => d.date, (d) => d.montant, currentMonth)
    const depPrev = sumByMonth(depenses, (d) => d.date, (d) => d.montant, prevMonth)
    const beneficeCurrent = caCurrent - depCurrent
    const beneficePrev = caPrev - depPrev
    const elevesCurrent = countByMonth(eleves, (e) => e.dateInscription, currentMonth)
    const elevesPrev = countByMonth(eleves, (e) => e.dateInscription, prevMonth)

    const examensNotes = examens.filter((x) => x.resultat !== 'En attente')
    const admis = examensNotes.filter((x) => x.resultat === 'Admis').length
    const tauxReussite =
      examensNotes.length > 0
        ? `${((admis / examensNotes.length) * 100).toFixed(1).replace('.', ',')}%`
        : '—'

    const facturesEnAttente = factures.filter((f) => f.statut !== 'Payée').length
    const impayesMontant = factures
      .filter((f) => f.statut === 'Impayée' || f.statut === 'Non payée')
      .reduce((s, f) => s + f.reste, 0)

    const caTotal = factures.reduce((sum, f) => sum + f.montant, 0)
    const totalDepenses = depenses.reduce((sum, d) => sum + d.montant, 0)
    const benefice = caTotal - totalDepenses

    return [
      {
        label: "Chiffre d'affaires",
        value: formatXOF(caTotal),
        change: formatPercentChange(caCurrent, caPrev),
        lastMonth: formatXOF(caPrev),
        icon: Wallet,
        iconBg: 'bg-primary/10',
        iconColor: 'text-primary',
      },
      {
        label: 'Total dépenses',
        value: formatXOF(totalDepenses),
        change: formatPercentChange(depCurrent, depPrev),
        lastMonth: formatXOF(depPrev),
        icon: TrendingDown,
        iconBg: 'bg-destructive/10',
        iconColor: 'text-destructive',
        isNegative: true,
      },
      {
        label: 'Bénéfice net',
        value: formatXOF(benefice),
        change: formatPercentChange(beneficeCurrent, beneficePrev),
        lastMonth: formatXOF(beneficePrev),
        icon: TrendingUp,
        iconBg: 'bg-success/10',
        iconColor: 'text-success',
      },
      {
        label: 'Élèves inscrits',
        value: String(eleves.length),
        change: formatPercentChange(elevesCurrent, elevesPrev),
        lastMonth: `${elevesPrev} ce mois`,
        icon: Users,
        iconBg: 'bg-secondary',
        iconColor: 'text-secondary-foreground',
      },
      {
        label: 'Taux de réussite',
        value: tauxReussite,
        change: `${admis}/${examensNotes.length} admis`,
        lastMonth: 'Examens notés',
        icon: Award,
        iconBg: 'bg-warning/10',
        iconColor: 'text-warning',
      },
      {
        label: 'Factures en attente',
        value: String(facturesEnAttente),
        change: formatXOF(impayesMontant),
        lastMonth: 'Montant impayé',
        icon: Clock,
        iconBg: 'bg-primary/10',
        iconColor: 'text-primary',
      },
    ]
  }, [factures, depenses, eleves, examens])

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {metrics.map((metric) => {
        const Icon = metric.icon
        const isNegative = metric.isNegative === true
        return (
          <div
            key={metric.label}
            className="group rounded-xl border border-border bg-card p-5 transition-all hover:shadow-md hover:shadow-black/5"
          >
            <div className="flex items-start justify-between">
              <div
                className={cn(
                  'flex h-11 w-11 items-center justify-center rounded-xl',
                  metric.iconBg,
                )}
              >
                <Icon className={cn('h-5 w-5', metric.iconColor)} />
              </div>
              <div
                className={cn(
                  'flex items-center gap-1 rounded-full px-2 py-1',
                  isNegative ? 'bg-destructive/10' : 'bg-success/10',
                )}
              >
                <TrendingUp
                  className={cn(
                    'h-3 w-3',
                    isNegative ? 'rotate-180 text-destructive' : 'text-success',
                  )}
                />
                <span
                  className={cn(
                    'text-xs font-semibold',
                    isNegative ? 'text-destructive' : 'text-success',
                  )}
                >
                  {metric.change}
                </span>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">{metric.value}</p>
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
