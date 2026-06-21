'use client'

import { cn } from '@/lib/utils'

type ViewHeaderProps = {
  title: string
  description?: string
  actions?: React.ReactNode
  className?: string
}

export function ViewHeader({ title, description, actions, className }: ViewHeaderProps) {
  return (
    <div className={cn('mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between', className)}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

// Shared status badge styles (consistent across views)
type BadgeTone = 'primary' | 'emerald' | 'amber' | 'rose' | 'sky' | 'slate'

const toneStyles: Record<BadgeTone, { badge: string; dot: string }> = {
  primary: { badge: 'bg-primary/10 text-primary', dot: 'bg-primary' },
  emerald: { badge: 'bg-emerald-500/10 text-emerald-600', dot: 'bg-emerald-500' },
  amber: { badge: 'bg-amber-500/10 text-amber-600', dot: 'bg-amber-500' },
  rose: { badge: 'bg-rose-500/10 text-rose-600', dot: 'bg-rose-500' },
  sky: { badge: 'bg-sky-500/10 text-sky-600', dot: 'bg-sky-500' },
  slate: { badge: 'bg-slate-500/10 text-slate-600', dot: 'bg-slate-500' },
}

export function StatusBadge({ label, tone }: { label: string; tone: BadgeTone }) {
  const style = toneStyles[tone]
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold', style.badge)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', style.dot)} />
      {label}
    </span>
  )
}

// Shared action button
export function ActionButton({
  children,
  variant = 'primary',
  onClick,
}: {
  children: React.ReactNode
  variant?: 'primary' | 'outline'
  onClick?: () => void
}) {
  if (variant === 'outline') {
    return (
      <button
        onClick={onClick}
        className="flex h-9 items-center gap-2 rounded-lg border border-input bg-background px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        {children}
      </button>
    )
  }
  return (
    <button
      onClick={onClick}
      className="flex h-9 items-center gap-2 rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
    >
      {children}
    </button>
  )
}

// Shared card wrapper
export function Card({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div onClick={onClick} className={cn('rounded-xl border border-border bg-card p-5', className)}>{children}</div>
  )
}

// Format currency XOF
export function formatXOF(value: number) {
  return `${value.toLocaleString('fr-FR')} F`
}

// Avatar initials from name
export function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}
