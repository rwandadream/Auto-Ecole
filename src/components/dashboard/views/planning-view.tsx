'use client'

import { useState } from 'react'
import { Plus, MoreHorizontal, CalendarDays, CheckCircle2, Clock, XCircle, ClipboardCheck, Trash2 } from 'lucide-react'
import { type StatutSeance } from '@/lib/mock-data'
import type { Seance } from '@/store/data-store'
import { useDataStore } from '@/store/data-store'
import { cn } from '@/lib/utils'
import {
  ViewHeader,
  StatusBadge,
  ActionButton,
  Card,
  initials,
} from './shared'
import { NouvelleSeanceDialog } from '@/components/dashboard/dialogs/nouvelle-seance-dialog'
import { SuiviSeanceDialog } from '@/components/dashboard/dialogs/suivi-seance-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

// --- Helpers ---
const jours = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
const mois = [
  'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
  'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc',
]

function formatDateFr(iso: string): string {
  // Already-formatted strings (e.g. "01 Déc 2026") are returned as-is
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso
  const d = new Date(iso + 'T00:00:00')
  const j = jours[d.getDay()]
  const jour = String(d.getDate()).padStart(2, '0')
  const m = mois[d.getMonth()]
  return `${j} ${jour} ${m}`
}

function statutTone(statut: StatutSeance): 'primary' | 'emerald' | 'amber' | 'rose' {
  switch (statut) {
    case 'Planifié':
      return 'primary'
    case 'Effectué':
      return 'emerald'
    case 'Absent élève':
      return 'amber'
    case 'Annulé':
      return 'rose'
  }
}

function dureeLabel(min: number): string {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, '0')}`
}

const FILTRES: Array<'Tous' | StatutSeance> = [
  'Tous',
  'Planifié',
  'Effectué',
  'Absent élève',
  'Annulé',
]

// --- KPI card type ---
type Kpi = {
  label: string
  value: number
  icon: React.ReactNode
  iconWrap: string
}

// --- Component ---
export function PlanningView() {
  const [filtre, setFiltre] = useState<'Tous' | StatutSeance>('Tous')
  const [showNewSeance, setShowNewSeance] = useState(false)
  const [suiviSeance, setSuiviSeance] = useState<Seance | null>(null)
  const [showSuivi, setShowSuivi] = useState(false)
  const [toDelete, setToDelete] = useState<Seance | null>(null)

  const seances = useDataStore((s) => s.seances)
  const deleteSeance = useDataStore((s) => s.deleteSeance)

  // KPIs dérivés du store
  const totalSemaine = seances.length
  const nbEffectuees = seances.filter((s) => s.statut === 'Effectué').length
  const nbPlanifiees = seances.filter((s) => s.statut === 'Planifié').length
  const nbAnnuleesAbsences = seances.filter(
    (s) => s.statut === 'Annulé' || s.statut === 'Absent élève',
  ).length

  const kpis: Kpi[] = [
    {
      label: 'Séances cette semaine',
      value: totalSemaine,
      icon: <CalendarDays className="h-4 w-4" />,
      iconWrap: 'bg-primary/10 text-primary',
    },
    {
      label: 'Effectuées',
      value: nbEffectuees,
      icon: <CheckCircle2 className="h-4 w-4" />,
      iconWrap: 'bg-emerald-500/10 text-emerald-600',
    },
    {
      label: 'Planifiées',
      value: nbPlanifiees,
      icon: <Clock className="h-4 w-4" />,
      iconWrap: 'bg-sky-500/10 text-sky-600',
    },
    {
      label: 'Annulées / Absences',
      value: nbAnnuleesAbsences,
      icon: <XCircle className="h-4 w-4" />,
      iconWrap: 'bg-rose-500/10 text-rose-600',
    },
  ]

  const seancesFiltrees =
    filtre === 'Tous' ? seances : seances.filter((s) => s.statut === filtre)

  const openSuivi = (s: Seance) => {
    setSuiviSeance(s)
    setShowSuivi(true)
  }

  const confirmDelete = () => {
    if (!toDelete) return
    deleteSeance(toDelete.id)
    setToDelete(null)
  }

  return (
    <>
      <ViewHeader
        title="Planning & Séances"
        description="Planification des leçons de conduite et cours théoriques"
        actions={
          <ActionButton onClick={() => setShowNewSeance(true)}>
            <Plus className="h-4 w-4" />
            Nouvelle séance
          </ActionButton>
        }
      />

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label} className="flex items-center gap-3">
            <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', k.iconWrap)}>
              {k.icon}
            </div>
            <div>
              <div className="text-2xl font-bold leading-none text-foreground">{k.value}</div>
              <div className="mt-1 text-xs font-medium text-muted-foreground">{k.label}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Statut filter */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        {FILTRES.map((f) => {
          const active = filtre === f
          return (
            <button
              key={f}
              onClick={() => setFiltre(f)}
              className={cn(
                'h-9 rounded-lg px-3.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-input bg-background text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              {f}
            </button>
          )
        })}
      </div>

      {/* Table */}
      <Card className="mt-4 p-0">
        <div className="custom-scrollbar overflow-x-auto">
          <table className="w-full min-w-[920px] border-collapse text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Horaire</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Élève</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Moniteur</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Véhicule</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Statut</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notes</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {seancesFiltrees.map((s) => (
                <tr key={s.id} className="hover:bg-muted/40">
                  <td className="px-5 py-3.5">
                    <div className="text-sm font-semibold text-foreground">{formatDateFr(s.date)}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {s.heureDebut} – {s.heureFin}
                      </span>
                      <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                        {dureeLabel(s.duree)}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {initials(s.eleve)}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-foreground">{s.eleve}</div>
                        <div className="text-xs text-muted-foreground">{s.eleveCode}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm text-foreground">{s.moniteur}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm text-muted-foreground">{s.vehicule}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge label={s.statut} tone={statutTone(s.statut)} />
                  </td>
                  <td className="px-5 py-3.5 max-w-[220px]">
                    {s.notes ? (
                      <span className="line-clamp-1 text-sm text-muted-foreground" title={s.notes}>
                        {s.notes}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground/50">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          aria-label="Actions"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onSelect={() => openSuivi(s)}
                          className="flex items-center gap-2 text-sm"
                        >
                          <ClipboardCheck className="h-4 w-4 text-primary" />
                          Suivi pédagogique
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => setToDelete(s)}
                          className="flex items-center gap-2 text-sm text-rose-600 focus:text-rose-600"
                        >
                          <Trash2 className="h-4 w-4" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {seancesFiltrees.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-sm text-muted-foreground">
                    Aucune séance ne correspond à ce filtre.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-3 border-t border-border px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            {seancesFiltrees.length} séance{seancesFiltrees.length > 1 ? 's' : ''} affichée{seancesFiltrees.length > 1 ? 's' : ''} sur {seances.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled
              className="inline-flex h-8 items-center gap-1 rounded-md border border-input bg-background px-3 text-xs font-medium text-muted-foreground opacity-50"
            >
              Précédent
            </button>
            <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-md bg-primary px-2 text-xs font-semibold text-primary-foreground">
              1
            </span>
            <button
              disabled
              className="inline-flex h-8 items-center gap-1 rounded-md border border-input bg-background px-3 text-xs font-medium text-muted-foreground opacity-50"
            >
              Suivant
            </button>
          </div>
        </div>
      </Card>

      <NouvelleSeanceDialog open={showNewSeance} onOpenChange={setShowNewSeance} />
      <SuiviSeanceDialog seance={suiviSeance} open={showSuivi} onOpenChange={setShowSuivi} />

      {/* Confirmation suppression */}
      <AlertDialog open={!!toDelete} onOpenChange={(v) => !v && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette séance ?</AlertDialogTitle>
            <AlertDialogDescription>
              {toDelete
                ? `La séance du ${formatDateFr(toDelete.date)} (${toDelete.heureDebut}–${toDelete.heureFin}) pour ${toDelete.eleve} sera définitivement supprimée. Cette action est irréversible.`
                : 'Cette action est irréversible.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-rose-600 text-white hover:bg-rose-600/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
