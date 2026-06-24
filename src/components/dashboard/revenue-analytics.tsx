'use client'

import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from 'recharts'
import { ChevronDown } from 'lucide-react'
import { useDataStore } from '@/store/data-store'
import { formatXOF } from '@/lib/format'
import { parseFlexibleDate } from '@/lib/stats'
import { useClientMounted } from '@/hooks/use-client-mounted'

const joursCourts = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
const joursLongs = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
const moisCourts = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function formatValue(value: number) {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(2)} M`
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}k`
  }
  return `${value}`
}

type TooltipProps = {
  active?: boolean
  payload?: Array<{ value: number; payload: { day: string; fullLabel: string } }>
}

function CustomTooltip({ active, payload }: TooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-md">
        <p className="text-xs font-medium text-muted-foreground">{payload[0].payload.fullLabel}</p>
        <p className="text-sm font-bold text-foreground">{formatXOF(payload[0].value)}</p>
      </div>
    )
  }
  return null
}

export function RevenueAnalytics() {
  const paiements = useDataStore((s) => s.paiements)
  const mounted = useClientMounted()

  const data = useMemo(() => {
    const today = new Date()
    // Build the last 7 days (today - 6 ... today), chronological order
    const days: Date[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      days.push(d)
    }
    // Pre-compute paiement dates once
    const paiementDates = paiements
      .map((p) => ({ date: parseFlexibleDate(p.datePaiement), montant: p.montant }))
      .filter((p): p is { date: Date; montant: number } => p.date !== null)

    return days.map((d) => {
      const total = paiementDates
        .filter((p) => sameDay(p.date, d))
        .reduce((sum, p) => sum + p.montant, 0)
      return {
        day: joursCourts[d.getDay()],
        fullLabel: `${joursLongs[d.getDay()]} ${String(d.getDate()).padStart(2, '0')} ${moisCourts[d.getMonth()]}`,
        value: total,
      }
    })
  }, [paiements])

  const peakIndex = data.findIndex((d) => d.value === Math.max(...data.map((d) => d.value)))
  const peak = data[peakIndex]
  const hasPeak = peak && peak.value > 0

  // Compute a sensible Y-axis max
  const maxValue = data.reduce((m, d) => Math.max(m, d.value), 0)
  const yAxisMax = Math.max(500000, Math.ceil((maxValue * 1.2) / 500000) * 500000)
  const ticks = Array.from({ length: 6 }, (_, i) => (yAxisMax / 5) * i)

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Évolution du chiffre d'affaires</h2>
          <p className="text-sm text-muted-foreground">Recettes encaissées (XOF) — cette semaine</p>
        </div>
        <button className="flex h-9 items-center gap-2 rounded-lg border border-input bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted">
          Cette semaine
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      <div className="mt-6 h-[300px] w-full">
        {!mounted ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Chargement du graphique…
          </div>
        ) : (
          <BarChart width={680} height={300} data={data} margin={{ top: 20, right: 0, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748B', fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748B', fontSize: 12 }}
              tickFormatter={(value) => formatValue(value)}
              domain={[0, yAxisMax]}
              ticks={ticks}
            />
            <Tooltip cursor={{ fill: '#F1F5F9' }} content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={48}>
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={index === peakIndex && hasPeak ? 'var(--accent-emphasis)' : 'var(--primary)'}
                  fillOpacity={index === peakIndex && hasPeak ? 1 : 0.85}
                />
              ))}
            </Bar>
          </BarChart>
        )}
      </div>

      {/* Peak indicator */}
      <div className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-primary/5 px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-[var(--accent-emphasis)]" />
        {hasPeak ? (
          <span className="text-xs text-muted-foreground">
            Meilleure recette le{' '}
            <span className="font-semibold text-foreground">{peak.day}</span> :{' '}
            <span className="font-bold text-primary">{formatXOF(peak.value)}</span>
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">
            Aucune recette encaissée cette semaine
          </span>
        )}
      </div>
    </div>
  )
}
