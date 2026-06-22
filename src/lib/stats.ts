const MOIS: Record<string, number> = {
  jan: 0, janv: 0, janvier: 0,
  fév: 1, fev: 1, févr: 1, fevrier: 1, février: 1,
  mar: 2, mars: 2,
  avr: 3, avril: 3,
  mai: 4,
  juin: 5,
  juil: 6, juillet: 6,
  août: 7, aout: 7,
  sep: 8, sept: 8, septembre: 8,
  oct: 9, octobre: 9,
  nov: 10, novembre: 10,
  déc: 11, dec: 11, décembre: 11, decembre: 11,
}

/** Parse "02 Déc 2026" ou ISO "2026-12-02" → Date */
export function parseFlexibleDate(value: string): Date | null {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(value + 'T00:00:00')
  }
  const parts = value.trim().split(/\s+/)
  if (parts.length < 3) return null
  const day = parseInt(parts[0], 10)
  const monthKey = parts[1].toLowerCase().replace('.', '')
  const year = parseInt(parts[2], 10)
  const month = MOIS[monthKey]
  if (Number.isNaN(day) || month === undefined || Number.isNaN(year)) return null
  return new Date(year, month, day)
}

export function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function previousMonthKey(key: string): string {
  const [y, m] = key.split('-').map(Number)
  const d = new Date(y, m - 2, 1)
  return monthKey(d)
}

export function formatPercentChange(current: number, previous: number): string {
  if (previous === 0) {
    return current > 0 ? '+100%' : '—'
  }
  const pct = ((current - previous) / previous) * 100
  const sign = pct >= 0 ? '+' : ''
  return `${sign}${pct.toFixed(1).replace('.', ',')}%`
}

export function sumByMonth<T>(
  items: T[],
  getDate: (item: T) => string,
  getAmount: (item: T) => number,
  targetMonth: string,
): number {
  return items.reduce((sum, item) => {
    const d = parseFlexibleDate(getDate(item))
    if (!d || monthKey(d) !== targetMonth) return sum
    return sum + getAmount(item)
  }, 0)
}

export function countByMonth<T>(
  items: T[],
  getDate: (item: T) => string,
  targetMonth: string,
): number {
  return items.filter((item) => {
    const d = parseFlexibleDate(getDate(item))
    return d !== null && monthKey(d) === targetMonth
  }).length
}
