'use client'

import { useMemo, useState } from 'react'
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
} from 'lucide-react'
import { toast } from 'sonner'
import { type EtatVehicule } from '@/lib/mock-data'
import { useDataStore } from '@/store/data-store'
import { cn } from '@/lib/utils'
import {
  ViewHeader,
  StatusBadge,
  ActionButton,
  Card,
  KpiCard,
  PaginationFooter,
} from './shared'
import { NouveauVehiculeDialog } from '@/components/dashboard/dialogs/nouveau-vehicule-dialog'
import { ModifierVehiculeDialog } from '@/components/dashboard/dialogs/modifier-vehicule-dialog'
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
      return 'emerald'
    case 'En maintenance':
      return 'amber'
    case 'En panne':
      return 'rose'
    default:
      return 'slate'
  }
}

export function VehiculesView() {
  const vehicules = useDataStore((s) => s.vehicules)
  const deleteVehicule = useDataStore((s) => s.deleteVehicule)

  const [recherche, setRecherche] = useState('')
  const [etatFiltre, setEtatFiltre] = useState<EtatFiltre>('Tous')
  const [page, setPage] = useState(1)
  const [showAdd, setShowAdd] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [showEdit, setShowEdit] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

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
          tone="emerald"
        />
        <KpiCard
          label="En maintenance"
          value={String(enMaintenance)}
          icon={<Wrench className="h-5 w-5" />}
          tone="amber"
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

      {/* Table */}
      <Card className="p-0">
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
                    ? 'bg-emerald-500/10 text-emerald-600'
                    : v.etat === 'En maintenance'
                      ? 'bg-amber-500/10 text-amber-600'
                      : 'bg-rose-500/10 text-rose-600'
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
                          <DropdownMenuItem
                            className="text-rose-600 focus:text-rose-600"
                            onSelect={() => setDeleteId(v.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer
                          </DropdownMenuItem>
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

      <NouveauVehiculeDialog open={showAdd} onOpenChange={setShowAdd} />
      <ModifierVehiculeDialog vehiculeId={editId} open={showEdit} onOpenChange={setShowEdit} />

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
              className="bg-rose-600 text-white hover:bg-rose-700"
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
