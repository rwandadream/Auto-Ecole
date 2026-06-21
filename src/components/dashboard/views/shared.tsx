'use client'

import { ChevronLeft, ChevronRight, Banknote, Smartphone, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type {
  StatutFacture,
  StatutSeance,
  StatutEleve,
  StatutMoniteur,
  ResultatExamen,
  ModePaiement,
} from '@/lib/mock-data'

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

// --- Status tone maps (single source of truth) ---
export const statutFactureTone: Record<StatutFacture, BadgeTone> = {
  'Non payée': 'rose',
  Partielle: 'amber',
  Payée: 'emerald',
  Impayée: 'rose',
}

export const statutSeanceTone: Record<StatutSeance, BadgeTone> = {
  Planifié: 'primary',
  Effectué: 'emerald',
  'Absent élève': 'amber',
  Annulé: 'rose',
}

export const statutEleveTone: Record<StatutEleve, BadgeTone> = {
  Prospect: 'slate',
  Inscrit: 'sky',
  'En formation': 'primary',
  Examen: 'amber',
  Admis: 'emerald',
  Ajourné: 'rose',
  Terminé: 'emerald',
  Abandon: 'slate',
}

export const statutMoniteurTone: Record<StatutMoniteur, BadgeTone> = {
  Disponible: 'emerald',
  'En mission': 'amber',
  Absent: 'rose',
}

export const resultatExamenTone: Record<ResultatExamen, BadgeTone> = {
  'En attente': 'amber',
  Admis: 'emerald',
  Échec: 'rose',
}

// --- Date helpers (French) ---
export const JOURS_COURTS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
export const MOIS_COURTS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']

export function formatDateFr(iso: string, opts?: { withYear?: boolean }): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  const day = JOURS_COURTS[d.getDay()]
  const date = String(d.getDate()).padStart(2, '0')
  const month = MOIS_COURTS[d.getMonth()]
  return opts?.withYear ? `${day} ${date} ${month} ${d.getFullYear()}` : `${day} ${date} ${month}`
}

export function dureeLabel(min: number): string {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, '0')}`
}

// --- Shared KPI cards ---
type KpiTone = 'primary' | 'emerald' | 'amber' | 'rose' | 'sky' | 'slate'

const kpiToneClasses: Record<KpiTone, string> = {
  primary: 'bg-primary/10 text-primary',
  emerald: 'bg-emerald-500/10 text-emerald-600',
  amber: 'bg-amber-500/10 text-amber-600',
  rose: 'bg-rose-500/10 text-rose-600',
  sky: 'bg-sky-500/10 text-sky-600',
  slate: 'bg-slate-500/10 text-slate-600',
}

export function KpiCard({
  label,
  value,
  icon,
  tone = 'primary',
}: {
  label: string
  value: string
  icon: React.ReactNode
  tone?: KpiTone
}) {
  return (
    <Card className="flex items-center gap-4 p-4">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${kpiToneClasses[tone]}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-xl font-bold tracking-tight text-foreground">{value}</p>
      </div>
    </Card>
  )
}

const kpiMinimalValueColor: Record<KpiTone, string> = {
  primary: 'text-primary',
  emerald: 'text-emerald-600',
  amber: 'text-amber-600',
  rose: 'text-rose-600',
  sky: 'text-sky-600',
  slate: 'text-foreground',
}

export function KpiCardMinimal({
  label,
  value,
  tone = 'slate',
}: {
  label: string
  value: string
  tone?: KpiTone
}) {
  return (
    <Card className="p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${kpiMinimalValueColor[tone]}`}>{value}</p>
    </Card>
  )
}

// --- Mode de paiement badge ---
export const modePaiementConfig: Record<
  ModePaiement,
  { icon: React.ReactNode; bg: string; fg: string }
> = {
  Espèces: { icon: <Banknote className="h-3.5 w-3.5" />, bg: 'bg-slate-500/10', fg: 'text-slate-600' },
  'Orange Money': { icon: <Smartphone className="h-3.5 w-3.5" />, bg: 'bg-amber-500/10', fg: 'text-amber-600' },
  Wave: { icon: <Smartphone className="h-3.5 w-3.5" />, bg: 'bg-sky-500/10', fg: 'text-sky-600' },
  Virement: { icon: <Building2 className="h-3.5 w-3.5" />, bg: 'bg-primary/10', fg: 'text-primary' },
}

export function ModePaiementBadge({ mode }: { mode: ModePaiement }) {
  const cfg = modePaiementConfig[mode]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.bg} ${cfg.fg}`}>
      {cfg.icon}
      {mode}
    </span>
  )
}

// --- Pagination footer ---
export function PaginationFooter({
  pageCourante,
  totalPages,
  total,
  debut,
  pageDataLength,
  label,
  setPage,
}: {
  pageCourante: number
  totalPages: number
  total: number
  debut: number
  pageDataLength: number
  label: string
  setPage: (fn: (p: number) => number) => void
}) {
  return (
    <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-muted-foreground">
        Affichage de{' '}
        <span className="font-semibold text-foreground">
          {total === 0 ? 0 : debut + 1}
        </span>{' '}
        à <span className="font-semibold text-foreground">{debut + pageDataLength}</span> sur{' '}
        <span className="font-semibold text-foreground">{total}</span> {label}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={pageCourante <= 1}
          className="inline-flex h-8 items-center gap-1 rounded-md border border-border bg-background px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4" />
          Précédent
        </button>
        <span className="px-2 text-xs font-medium text-muted-foreground">
          Page <span className="font-semibold text-foreground">{pageCourante}</span> / {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={pageCourante >= totalPages}
          className="inline-flex h-8 items-center gap-1 rounded-md border border-border bg-background px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
        >
          Suivant
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
