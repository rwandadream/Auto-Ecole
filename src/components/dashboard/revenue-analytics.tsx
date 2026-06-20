'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from 'recharts'
import { ChevronDown } from 'lucide-react'

const data = [
  { day: 'Fri', value: 12000 },
  { day: 'Sat', value: 18500 },
  { day: 'Sun', value: 22430 },
  { day: 'Mon', value: 9800 },
  { day: 'Thu', value: 15600 },
  { day: 'Wed', value: 13400 },
  { day: 'Thus', value: 17200 },
]

const peakIndex = data.findIndex((d) => d.value === Math.max(...data.map((d) => d.value)))

function formatValue(value: number) {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}k`
  }
  return `$${value}`
}

type TooltipProps = {
  active?: boolean
  payload?: Array<{ value: number; payload: { day: string } }>
}

function CustomTooltip({ active, payload }: TooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-md">
        <p className="text-xs font-medium text-muted-foreground">{payload[0].payload.day}</p>
        <p className="text-sm font-bold text-foreground">{formatValue(payload[0].value)}</p>
      </div>
    )
  }
  return null
}

export function RevenueAnalytics() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Revenue analytics</h2>
          <p className="text-sm text-muted-foreground">Weekly revenue performance</p>
        </div>
        <button className="flex h-9 items-center gap-2 rounded-lg border border-input bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted">
          This Week
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      <div className="mt-6 h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.94 0.005 240)" />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'oklch(0.55 0.015 240)', fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'oklch(0.55 0.015 240)', fontSize: 12 }}
              tickFormatter={(value) => `$${value / 1000}k`}
              domain={[0, 30000]}
              ticks={[0, 5000, 10000, 15000, 20000, 25000, 30000]}
            />
            <Tooltip cursor={{ fill: 'oklch(0.97 0.005 240)' }} content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={48}>
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={index === peakIndex ? 'oklch(0.665 0.193 32.7)' : 'oklch(0.665 0.193 32.7)'}
                  fillOpacity={index === peakIndex ? 1 : 0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Peak indicator */}
      <div className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-primary/5 px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-primary" />
        <span className="text-xs text-muted-foreground">
          Peak revenue on <span className="font-semibold text-foreground">Sunday</span>:{' '}
          <span className="font-bold text-primary">$22,430</span>
        </span>
      </div>
    </div>
  )
}
