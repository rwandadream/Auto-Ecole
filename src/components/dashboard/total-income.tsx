'use client'

import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useDataStore } from '@/store/data-store'
import { formatXOF } from '@/lib/format'
import { parseFlexibleDate } from '@/lib/stats'
import { useClientMounted } from '@/hooks/use-client-mounted'

const moisLabels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']

function formatValue(value: number) {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}k`
  }
  return `${value}`
}

type TooltipProps = {
  active?: boolean
  payload?: Array<{ value: number; name: string; color: string }>
  label?: string
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (active && payload && payload.length) {
    const labelMap: Record<string, string> = {
      revenus: 'Revenus',
      depenses: 'Dépenses',
    }
    return (
      <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-md">
        <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-muted-foreground">
              {labelMap[entry.name] || entry.name} :
            </span>
            <span className="text-xs font-bold text-foreground">
              {formatXOF(entry.value)}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export function TotalIncome() {
  const paiements = useDataStore((s) => s.paiements)
  const depenses = useDataStore((s) => s.depenses)
  const mounted = useClientMounted()

  const data = useMemo(() => {
    const currentYear = new Date().getFullYear()
    // Initialize all 12 months to 0
    const buckets = moisLabels.map((m) => ({ month: m, revenus: 0, depenses: 0 }))

    paiements.forEach((p) => {
      const d = parseFlexibleDate(p.datePaiement)
      if (d && d.getFullYear() === currentYear) {
        buckets[d.getMonth()].revenus += p.montant
      }
    })

    depenses.forEach((dep) => {
      const d = parseFlexibleDate(dep.date)
      if (d && d.getFullYear() === currentYear) {
        buckets[d.getMonth()].depenses += dep.montant
      }
    })

    return buckets
  }, [paiements, depenses])

  const maxValue = data.reduce((m, d) => Math.max(m, d.revenus + d.depenses), 0)
  const yAxisMax = Math.max(2000000, Math.ceil((maxValue * 1.1) / 2000000) * 2000000)
  const ticks = Array.from({ length: 6 }, (_, i) => (yAxisMax / 5) * i)

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Revenus & Dépenses</h2>
          <p className="text-sm text-muted-foreground">
            Comparaison mensuelle sur l'année en cours (XOF)
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
            <span className="text-xs font-medium text-muted-foreground">Revenus</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Dépenses</span>
          </div>
        </div>
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
              dataKey="month"
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
            <Bar
              dataKey="revenus"
              stackId="finance"
              fill="#2563EB"
              maxBarSize={36}
            />
            <Bar
              dataKey="depenses"
              stackId="finance"
              fill="#1E293B"
              radius={[6, 6, 0, 0]}
              maxBarSize={36}
            />
          </BarChart>
        )}
      </div>
    </div>
  )
}
