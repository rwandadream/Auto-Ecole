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
  { month: 'Jan', profit: 18000, loss: 5000 },
  { month: 'Feb', profit: 22000, loss: 7000 },
  { month: 'Mar', profit: 28000, loss: 4000 },
  { month: 'Apr', profit: 20000, loss: 9000 },
  { month: 'May', profit: 32000, loss: 6000 },
  { month: 'Jun', profit: 26000, loss: 8000 },
  { month: 'Jul', profit: 35000, loss: 5000 },
  { month: 'Aug', profit: 30000, loss: 7000 },
]

type TooltipProps = {
  active?: boolean
  payload?: Array<{ value: number; name: string; color: string }>
  label?: string
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-md">
        <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs capitalize text-muted-foreground">{entry.name}:</span>
            <span className="text-xs font-bold text-foreground">
              ${entry.value.toLocaleString()}
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
          <h2 className="text-lg font-semibold text-foreground">Total Income</h2>
          <p className="text-sm text-muted-foreground">
            View your income in a certain period of time
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
            <span className="text-xs font-medium text-muted-foreground">Profit</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Loss</span>
          </div>
        </div>
      </div>

      <div className="mt-6 h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
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
              tickFormatter={(value) => `$${value / 1000}k`}
              domain={[0, 50000]}
              ticks={[0, 10000, 20000, 30000, 40000, 50000]}
            />
            <Tooltip cursor={{ fill: 'oklch(0.97 0.005 240)' }} content={<CustomTooltip />} />
            <Bar
              dataKey="profit"
              stackId="income"
              fill="oklch(0.665 0.193 32.7)"
              radius={[0, 0, 0, 0]}
              maxBarSize={36}
            />
            <Bar
              dataKey="loss"
              stackId="income"
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
