export function formatXOF(value: number) {
  return `${value.toLocaleString('fr-FR')} F`
}

export function formatAmountFr(value: number) {
  return value.toLocaleString('fr-FR')
}

export function formatXOFFcfa(value: number) {
  return `${value.toLocaleString('fr-FR')} F CFA`
}

export function todayFrShort(): string {
  return new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateLongFr(iso: string): string {
  const date = new Date(iso)
  if (isNaN(date.getTime())) return iso
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export function nowFrLocale(): string {
  return new Date().toLocaleString('fr-FR')
}

export function currentMonthRange(): string {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' }
  return `${start.toLocaleDateString('fr-FR', opts)} - ${now.toLocaleDateString('fr-FR', opts)}`
}
