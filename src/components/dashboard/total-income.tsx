'use client'

import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useDataStore } from '@/store/data-store'

// Reference year aligned with the mock data timeline
const REF_YEAR = 2026

const moisLabels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']

const moisFrToNum: Record<string, number> = {
  'Jan': 0, 'Fév': 1, 'Mar': 2, 'Avr': 3, 'Mai': 4, 'Juin': 5,
  'Juil': 6, 'Août': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Déc': 11,
}

// Parse "29 Nov 2026" → { month: 0-11, year: number } | null
function parseFrMonth(s: string): { month: number; year: number } | null {
  const parts = s.split(/\s+/)
  if (parts.length !== 3) return null
  const mois = moisFrToNum[parts[1]]
  const annee = parseInt(parts[2], 10)
  if (mois === undefined || Number.isNaN(annee)) return null
  return { month: mois, year: annee }
}

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
              {entry.value.toLocaleString('fr-FR')} F
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

  const data = useMemo(() => {
    // Initialize all 12 months to 0
    const buckets = moisLabels.map((m) => ({ month: m, revenus: 0, depenses: 0 }))

    paiements.forEach((p) => {
      const d = parseFrMonth(p.datePaiement)
      if (d && d.year === REF_YEAR) {
        buckets[d.month].revenus += p.montant
      }
    })

    depenses.forEach((d) => {
      const dt = parseFrMonth(d.date)
      if (dt && dt.year === REF_YEAR) {
        buckets[dt.month].depenses += d.montant
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
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 0, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.94 0.005 240)" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'oklch(0.55 0.015 240)', fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'oklch(0.55 0.015 240)', fontSize: 12 }}
              tickFormatter={(value) => formatValue(value)}
              domain={[0, yAxisMax]}
              ticks={ticks}
            />
            <Tooltip cursor={{ fill: 'oklch(0.97 0.005 240)' }} content={<CustomTooltip />} />
            <Bar
              dataKey="revenus"
              stackId="finance"
              fill="oklch(0.665 0.193 32.7)"
              maxBarSize={36}
            />
            <Bar
              dataKey="depenses"
              stackId="finance"
              fill="oklch(0.21 0.02 240)"
              radius={[6, 6, 0, 0]}
              maxBarSize={36}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
