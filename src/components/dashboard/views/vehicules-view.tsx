'use client'

import { useMemo, useState, useCallback } from 'react'
import {
  Plus,
  Car,
  CheckCircle2,
  Wrench,
  CalendarClock,
  MoreVertical,
  Pencil,
  Trash2,
  Search,
  AlertTriangle,
  ShieldCheck as ShieldOkIcon,
  BookOpen,
} from 'lucide-react'
import { toast } from 'sonner'
import { type EtatVehicule } from '@/lib/domain/types'
import { canPerformAction } from '@/lib/permissions'
import { useDataStore } from '@/store/data-store'
import { useAuthStore } from '@/store/auth-store'
import { cn } from '@/lib/utils'
import {
  ViewHeader,
  StatusBadge,
  ActionButton,
  Card,
  KpiCard,
  PaginationFooter,
  formatXOF,
} from './shared'
import {
  ResponsiveDataView,
  MobileListCard,
  MobileListCardRow,
} from '@/components/dashboard/responsive-data-view'
import { VehiculeDialog } from '@/components/dashboard/dialogs/nouveau-vehicule-dialog'
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

type EtatFiltre = 'Tous' | EtatVehicule

const ETAT_FILTRES: EtatFiltre[] = ['Tous', 'Disponible', 'En maintenance', 'En panne']

function etatTone(etat: EtatVehicule): React.ComponentProps<typeof StatusBadge>['tone'] {
  switch (etat) {
    case 'Disponible':
      return 'success'
    case 'En maintenance':
      return 'warning'
    case 'En panne':
      return 'destructive'
    default:
      return 'neutral'
  }
}

const MOIS_FR: Record<string, number> = {
  janv: 0, févr: 1, mars: 2, avr: 3, mai: 4, juin: 5,
  juil: 6, août: 7, sept: 8, oct: 9, nov: 10, déc: 11,
}

function parseDateFr(s: string): Date | null {
  const parts = s.trim().split(/[\s.]+/)
  if (parts.length < 3) return null
  const day = parseInt(parts[0])
  const month = MOIS_FR[parts[1].toLowerCase().replace('.', '')]
  const year = parseInt(parts[2])
  if (isNaN(day) || month === undefined || isNaN(year)) return null
  return new Date(year, month, day)
}

const CATS_ENTRETIEN = ['Entretien', 'Réparations', 'Carburant', 'Assurance'] as const

export function VehiculesView() {
  const vehicules = useDataStore((s) => s.vehicules)
  const depenses = useDataStore((s) => s.depenses)
  const deleteVehicule = useDataStore((s) => s.deleteVehicule)
  const user = useAuthStore((s) => s.user)
  const canDeleteVehicule = canPerformAction(user?.mode === 'admin' ? user.role : '', 'delete_vehicule')

  const [recherche, setRecherche] = useState('')
  const [etatFiltre, setEtatFiltre] = useState<EtatFiltre>('Tous')
  const [page, setPage] = useState(1)
  const [showAdd, setShowAdd] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [showEdit, setShowEdit] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Carnet de bord: map vehicule.id → maintenance depenses
  const carnetByVehicule = useMemo(() => {
    const map = new Map<string, {
      depenses: typeof depenses;
      dernierDate: Date | null;
      joursDepuis: number | null;
      alerte: boolean;
      totalEntretien: number;
    }>()
    for (const v of vehicules) {
      const label = `${v.marque} ${v.modele} (${v.immatriculation})`
      const vDeps = depenses
        .filter((d) => d.vehicule === label && (CATS_ENTRETIEN as readonly string[]).includes(d.categorie))
        .sort((a, b) => {
          const da = parseDateFr(a.date)
          const db = parseDateFr(b.date)
          if (!da || !db) return 0
          return db.getTime() - da.getTime()
        })
      const dernierDate = vDeps.length > 0 ? parseDateFr(vDeps[0].date) : null
      const joursDepuis = dernierDate ? Math.floor((Date.now() - dernierDate.getTime()) / 86400000) : null
      const alerte = joursDepuis !== null && joursDepuis > 90
      const totalEntretien = vDeps
        .filter((d) => d.categorie === 'Entretien' || d.categorie === 'Réparations')
        .reduce((sum, d) => sum + d.montant, 0)
      map.set(v.id, { depenses: vDeps, dernierDate, joursDepuis, alerte, totalEntretien })
    }
    return map
  }, [vehicules, depenses])

  const vehiculesAlerte = useMemo(() => vehicules.filter((v) => carnetByVehicule.get(v.id)?.alerte), [vehicules, carnetByVehicule])

  const totalVehicules = vehicules.length
  const disponibles = vehicules.filter((v) => v.etat === 'Disponible').length
  const enMaintenance = vehicules.filter((v) => v.etat === 'En maintenance').length

  const vehiculesFiltres = useMemo(() => {
    return vehicules.filter((v) => {
      const matchEtat = etatFiltre === 'Tous' || v.etat === etatFiltre
      const q = recherche.trim().toLowerCase()
      const matchRecherche =
        q === '' ||
        `${v.marque} ${v.modele}`.toLowerCase().includes(q) ||
        v.immatriculation.toLowerCase().includes(q)
      return matchEtat && matchRecherche
    })
  }, [vehicules, recherche, etatFiltre])

  const parPage = 8
  const totalPages = Math.max(1, Math.ceil(vehiculesFiltres.length / parPage))
  const pageCourante = Math.min(page, totalPages)
  const debut = (pageCourante - 1) * parPage
  const vehiculesPage = vehiculesFiltres.slice(debut, debut + parPage)

  return (
    <div>
      <ViewHeader
        title="Véhicules"
        description="Parc automobile de l'auto-école"
        actions={
          <ActionButton variant="primary" onClick={() => setShowAdd(true)}>
            <Plus className="h-4 w-4" />
            Ajouter un véhicule
          </ActionButton>
        }
      />

      {/* KPI row */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          label="Total véhicules"
          value={String(totalVehicules)}
          icon={<Car className="h-5 w-5" />}
          tone="primary"
        />
        <KpiCard
          label="Disponibles"
          value={String(disponibles)}
          icon={<CheckCircle2 className="h-5 w-5" />}
          tone="success"
        />
        <KpiCard
          label="En maintenance"
          value={String(enMaintenance)}
          icon={<Wrench className="h-5 w-5" />}
          tone="warning"
        />
      </div>

      {/* Toolbar */}
      <Card className="mb-4 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={recherche}
              onChange={(e) => {
                setRecherche(e.target.value)
                setPage(1)
              }}
              placeholder="Rechercher un véhicule..."
              aria-label="Rechercher un véhicule"
              className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
            />
          </div>

          <div className="custom-scrollbar -mx-1 flex items-center gap-1.5 overflow-x-auto px-1 pb-1 lg:pb-0">
            {ETAT_FILTRES.map((s) => {
              const actif = etatFiltre === s
              return (
                <button
                  key={s}
                  aria-pressed={actif}
                  onClick={() => {
                    setEtatFiltre(s)
                    setPage(1)
                  }}
                  className={cn(
                    'h-8 shrink-0 rounded-full px-3 text-xs font-semibold transition-colors',
                    actif
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  {s}
                </button>
              )
            })}
          </div>
        </div>
      </Card>

      {/* Table / cartes mobile */}
      <Card className="p-0">
        <ResponsiveDataView
          empty={vehiculesPage.length === 0}
          emptyState={
            <p className="px-4 py-12 text-center text-sm text-muted-foreground">
              Aucun véhicule ne correspond à votre recherche.
            </p>
          }
          mobile={vehiculesPage.map((v) => {
            const tone = etatTone(v.etat)
            const iconWrapClass =
              v.etat === 'Disponible'
                ? 'bg-success/10 text-success'
                : v.etat === 'En maintenance'
                  ? 'bg-warning/10 text-warning'
                  : 'bg-destructive/10 text-destructive'
            return (
              <MobileListCard key={v.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconWrapClass}`}>
                      <Car className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-foreground">
                        {v.marque} {v.modele}
                      </p>
                      <span className="mt-1 inline-block rounded-md border border-border bg-muted/40 px-2 py-0.5 font-mono text-xs font-semibold text-foreground">
                        {v.immatriculation}
                      </span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        aria-label="Actions"
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem
                        onSelect={() => {
                          setEditId(v.id)
                          setShowEdit(true)
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>
                      {canDeleteVehicule && (
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onSelect={() => setDeleteId(v.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="mt-3 space-y-1 border-t border-border pt-3">
                  <MobileListCardRow label="État">
                    <StatusBadge label={v.etat} tone={tone} />
                  </MobileListCardRow>
                  <MobileListCardRow label="Séances">
                    <span className="font-bold">{v.seances}</span>
                  </MobileListCardRow>
                  <MobileListCardRow label="Dernière dépense">
                    <span className="flex items-center justify-end gap-1.5">
                      <CalendarClock className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
                      {v.derniereDepense}
                    </span>
                  </MobileListCardRow>
                </div>
              </MobileListCard>
            )
          })}
          desktop={
            <div className="custom-scrollbar overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Véhicule
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Immatriculation
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  État
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Séances
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Dernière dépense
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {vehiculesPage.map((v) => {
                const tone = etatTone(v.etat)
                const iconWrapClass =
                  v.etat === 'Disponible'
                    ? 'bg-success/10 text-success'
                    : v.etat === 'En maintenance'
                      ? 'bg-warning/10 text-warning'
                      : 'bg-destructive/10 text-destructive'
                return (
                  <tr key={v.id} className="transition-colors hover:bg-muted/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconWrapClass}`}>
                          <Car className="h-4 w-4" />
                        </div>
                        <p className="font-semibold text-foreground">
                          {v.marque} {v.modele}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block rounded-md border border-border bg-muted/40 px-2 py-1 font-mono text-xs font-semibold text-foreground">
                        {v.immatriculation}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge label={v.etat} tone={tone} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <span className="font-bold text-foreground">{v.seances}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <CalendarClock className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
                        {v.derniereDepense}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            aria-label="Actions"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem
                            onSelect={() => {
                              setEditId(v.id)
                              setShowEdit(true)
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Modifier
                          </DropdownMenuItem>
                          {canDeleteVehicule && (
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onSelect={() => setDeleteId(v.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Supprimer
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                )
              })}

              {vehiculesPage.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    Aucun véhicule ne correspond à votre recherche.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
            </div>
          }
        />

        <PaginationFooter
          pageCourante={pageCourante}
          totalPages={totalPages}
          total={totalVehicules}
          debut={debut}
          pageDataLength={vehiculesPage.length}
          label="véhicules"
          setPage={setPage}
        />
      </Card>

      {/* Carnet de bord */}
      <div className="mt-6">
        <div className="mb-3 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <h2 className="text-base font-bold text-foreground">Carnet de bord — Entretien</h2>
          {vehiculesAlerte.length > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
              <AlertTriangle className="h-3 w-3" />
              {vehiculesAlerte.length} véhicule{vehiculesAlerte.length > 1 ? 's' : ''} en retard
            </span>
          )}
        </div>
        <Card className="overflow-hidden p-0">
          <div className="divide-y divide-border">
            {vehicules.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">Aucun véhicule enregistré.</p>
            ) : vehicules.map((v) => {
              const info = carnetByVehicule.get(v.id)
              const alerte = info?.alerte ?? false
              const joursDepuis = info?.joursDepuis
              const dernierDate = info?.dernierDate
              const recentDeps = info?.depenses.slice(0, 3) ?? []
              return (
                <div key={v.id} className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${alerte ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'}`}>
                      {alerte ? <AlertTriangle className="h-4 w-4" /> : <ShieldOkIcon className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{v.marque} {v.modele}</p>
                      <p className="font-mono text-xs text-muted-foreground">{v.immatriculation}</p>
                    </div>
                    <div className="text-right shrink-0">
                      {dernierDate ? (
                        <>
                          <p className={`text-sm font-bold ${alerte ? 'text-destructive' : 'text-foreground'}`}>
                            {joursDepuis}j sans entretien
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Dernière op. : {info?.depenses[0]?.date}
                          </p>
                        </>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">Aucune dépense enregistrée</p>
                      )}
                    </div>
                    {info && info.totalEntretien > 0 && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        {formatXOF(info.totalEntretien)} entretien/réparations
                      </span>
                    )}
                  </div>
                  {recentDeps.length > 0 && (
                    <div className="mt-2 space-y-1 pl-11">
                      {recentDeps.map((d) => (
                        <div key={d.id} className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                          <span>{d.date} — {d.categorie}</span>
                          <span className="font-medium text-foreground">{formatXOF(d.montant)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      <VehiculeDialog open={showAdd} onOpenChange={setShowAdd} />
      <VehiculeDialog vehiculeId={editId} open={showEdit} onOpenChange={setShowEdit} />

      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(v) => { if (!v) setDeleteId(null) }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce véhicule ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le véhicule sera définitivement retiré du parc automobile.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (deleteId) {
                  deleteVehicule(deleteId)
                  toast.success('Véhicule supprimé.')
                  setDeleteId(null)
                }
              }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
