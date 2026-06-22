'use client'

import { useState } from 'react'
import { Plus, MoreHorizontal, CalendarDays, CheckCircle2, Clock, XCircle, ClipboardCheck, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { type StatutSeance } from '@/lib/domain/types'
import type { Seance } from '@/store/data-store'
import { useDataStore } from '@/store/data-store'
import { cn } from '@/lib/utils'
import {
  ViewHeader,
  StatusBadge,
  ActionButton,
  Card,
  initials,
  formatDateFr,
  statutSeanceTone,
  dureeLabel,
} from './shared'
import { NouvelleSeanceDialog } from '@/components/dashboard/dialogs/nouvelle-seance-dialog'
import { SuiviSeanceDialog } from '@/components/dashboard/dialogs/suivi-seance-dialog'
import { PlanningCalendar } from '@/components/dashboard/views/planning-calendar'
import {
  ResponsiveDataView,
  MobileListCard,
  MobileListCardRow,
} from '@/components/dashboard/responsive-data-view'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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

function formatPlanningDate(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso
  return formatDateFr(iso + 'T00:00:00')
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
  const [vue, setVue] = useState<'liste' | 'calendrier'>('liste')
  const [filtre, setFiltre] = useState<'Tous' | StatutSeance>('Tous')
  const [page, setPage] = useState(1)
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
      iconWrap: 'bg-success/10 text-success',
    },
    {
      label: 'Planifiées',
      value: nbPlanifiees,
      icon: <Clock className="h-4 w-4" />,
      iconWrap: 'bg-secondary text-secondary-foreground',
    },
    {
      label: 'Annulées / Absences',
      value: nbAnnuleesAbsences,
      icon: <XCircle className="h-4 w-4" />,
      iconWrap: 'bg-destructive/10 text-destructive',
    },
  ]

  const seancesFiltrees =
    filtre === 'Tous' ? seances : seances.filter((s) => s.statut === filtre)

  const parPage = 8
  const totalPages = Math.max(1, Math.ceil(seancesFiltrees.length / parPage))
  const pageCourante = Math.min(page, totalPages)
  const debut = (pageCourante - 1) * parPage
  const seancesPage = seancesFiltrees.slice(debut, debut + parPage)

  const changeFiltre = (f: 'Tous' | StatutSeance) => {
    setFiltre(f)
    setPage(1)
  }

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

      <Tabs value={vue} onValueChange={(v) => setVue(v as 'liste' | 'calendrier')} className="mt-6">
        <TabsList>
          <TabsTrigger value="liste">Liste</TabsTrigger>
          <TabsTrigger value="calendrier" className="hidden lg:inline-flex">
            Calendrier
          </TabsTrigger>
        </TabsList>

        <TabsContent value="liste" className="mt-4">
      {/* Statut filter */}
      <div className="flex flex-wrap items-center gap-2">
        {FILTRES.map((f) => {
          const active = filtre === f
          return (
            <button
              key={f}
              onClick={() => changeFiltre(f)}
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
        <ResponsiveDataView
          empty={seancesPage.length === 0}
          emptyState={
            <p className="px-5 py-12 text-center text-sm text-muted-foreground">
              Aucune séance ne correspond à ce filtre.
            </p>
          }
          mobile={seancesPage.map((s) => (
            <MobileListCard key={s.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{formatPlanningDate(s.date)}</p>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    {s.heureDebut} – {s.heureFin}
                    <span className="ml-2 rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                      {dureeLabel(s.duree)}
                    </span>
                  </p>
                </div>
                <StatusBadge label={s.statut} tone={statutSeanceTone[s.statut]} />
              </div>
              <div className="mt-3 space-y-1 border-t border-border pt-3">
                <MobileListCardRow label="Élève">
                  <div className="flex items-center justify-end gap-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                      {initials(s.eleve)}
                    </div>
                    <div className="min-w-0 text-right">
                      <div className="truncate text-sm font-medium">{s.eleve}</div>
                      <div className="text-xs text-muted-foreground">{s.eleveCode}</div>
                    </div>
                  </div>
                </MobileListCardRow>
                <MobileListCardRow label="Moniteur">{s.moniteur}</MobileListCardRow>
                <MobileListCardRow label="Véhicule">{s.vehicule}</MobileListCardRow>
                <MobileListCardRow label="Lieu RDV">{s.lieuRdv || '—'}</MobileListCardRow>
                {s.notes && (
                  <MobileListCardRow label="Notes">
                    <span className="line-clamp-2 text-left">{s.notes}</span>
                  </MobileListCardRow>
                )}
              </div>
              <div className="mt-3 flex justify-end border-t border-border pt-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="inline-flex h-8 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      aria-label="Actions"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                      Actions
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
                      className="flex items-center gap-2 text-sm text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </MobileListCard>
          ))}
          desktop={
        <div className="custom-scrollbar overflow-x-auto">
          <table className="w-full min-w-[1100px] border-collapse text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Horaire</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Élève</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Moniteur</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Véhicule</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Lieu RDV</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Statut</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notes</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {seancesPage.map((s) => (
                <tr key={s.id} className="hover:bg-muted/40">
                  <td className="px-5 py-3.5">
                    <div className="text-sm font-semibold text-foreground">{formatPlanningDate(s.date)}</div>
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
                  <td className="px-5 py-3.5 max-w-[180px]">
                    <span className="line-clamp-2 text-sm text-muted-foreground" title={s.lieuRdv}>
                      {s.lieuRdv || '—'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge label={s.statut} tone={statutSeanceTone[s.statut]} />
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
                          className="flex items-center gap-2 text-sm text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
          }
        />

        {/* Footer */}
        <div className="flex flex-col gap-3 border-t border-border px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            Affichage de <span className="font-semibold text-foreground">{seancesFiltrees.length === 0 ? 0 : debut + 1}</span> à{' '}
            <span className="font-semibold text-foreground">{debut + seancesPage.length}</span> sur{' '}
            <span className="font-semibold text-foreground">{seancesFiltrees.length}</span> séance{seancesFiltrees.length > 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={pageCourante <= 1}
              className="inline-flex h-8 items-center gap-1 rounded-md border border-input bg-background px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Précédent
            </button>
            <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-md bg-primary px-2 text-xs font-semibold text-primary-foreground">
              {pageCourante}
            </span>
            <span className="px-1 text-xs font-medium text-muted-foreground">
              / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={pageCourante >= totalPages}
              className="inline-flex h-8 items-center gap-1 rounded-md border border-input bg-background px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
            >
              Suivant
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Card>
        </TabsContent>
        <TabsContent value="calendrier" className="mt-4">
          <div className="hidden lg:block">
            <PlanningCalendar seances={seancesFiltrees} onSelect={openSuivi} />
          </div>
          <div className="space-y-4 lg:hidden">
            {seancesFiltrees.length === 0 ? (
              <p className="rounded-lg border border-border bg-card p-6 text-center text-sm text-muted-foreground">
                Aucune séance pour ce filtre.
              </p>
            ) : (
              [...seancesFiltrees]
                .sort((a, b) => a.date.localeCompare(b.date) || a.heureDebut.localeCompare(b.heureDebut))
                .reduce<Array<{ date: string; items: typeof seancesFiltrees }>>((acc, s) => {
                  const last = acc[acc.length - 1]
                  if (last?.date === s.date) last.items.push(s)
                  else acc.push({ date: s.date, items: [s] })
                  return acc
                }, [])
                .map(({ date, items }) => (
                  <div key={date}>
                    <h3 className="mb-2 text-sm font-semibold text-foreground">{formatPlanningDate(date)}</h3>
                    <div className="space-y-3">
                      {items.map((s) => (
                        <MobileListCard key={s.id} onClick={() => openSuivi(s)}>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold text-foreground">
                                {s.heureDebut} – {s.heureFin}
                              </p>
                              <p className="text-xs text-muted-foreground">{dureeLabel(s.duree)}</p>
                            </div>
                            <StatusBadge label={s.statut} tone={statutSeanceTone[s.statut]} />
                          </div>
                          <div className="mt-2 space-y-1">
                            <MobileListCardRow label="Élève">{s.eleve}</MobileListCardRow>
                            <MobileListCardRow label="Moniteur">{s.moniteur}</MobileListCardRow>
                          </div>
                        </MobileListCard>
                      ))}
                    </div>
                  </div>
                ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      <NouvelleSeanceDialog open={showNewSeance} onOpenChange={setShowNewSeance} />
      <SuiviSeanceDialog seance={suiviSeance} open={showSuivi} onOpenChange={setShowSuivi} />

      {/* Confirmation suppression */}
      <AlertDialog open={!!toDelete} onOpenChange={(v) => !v && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette séance ?</AlertDialogTitle>
            <AlertDialogDescription>
              {toDelete
                ? `La séance du ${formatPlanningDate(toDelete.date)} (${toDelete.heureDebut}–${toDelete.heureFin}) pour ${toDelete.eleve} sera définitivement supprimée. Cette action est irréversible.`
                : 'Cette action est irréversible.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              variant="destructive"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
