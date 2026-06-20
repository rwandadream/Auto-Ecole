'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const data = [
  { month: 'Jan', revenus: 6200000, depenses: 1850000 },
  { month: 'Fév', revenus: 7100000, depenses: 2100000 },
  { month: 'Mar', revenus: 5800000, depenses: 1750000 },
  { month: 'Avr', revenus: 8220640, depenses: 2145300 },
  { month: 'Mai', revenus: 9100000, depenses: 2380000 },
  { month: 'Jun', revenus: 7650000, depenses: 1990000 },
  { month: 'Juil', revenus: 8800000, depenses: 2240000 },
  { month: 'Août', revenus: 6950000, depenses: 1870000 },
]

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
              domain={[0, 10000000]}
              ticks={[0, 2000000, 4000000, 6000000, 8000000, 10000000]}
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
