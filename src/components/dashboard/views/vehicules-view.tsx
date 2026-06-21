'use client'

import { useState } from 'react'
import { Plus, Car, CheckCircle2, Wrench, CalendarClock, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { type EtatVehicule } from '@/lib/mock-data'
import { useDataStore } from '@/store/data-store'
import {
  ViewHeader,
  StatusBadge,
  ActionButton,
  Card,
} from '@/components/dashboard/views/shared'
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

type KpiCardProps = {
  label: string
  value: string
  icon: React.ReactNode
  tone: 'primary' | 'emerald' | 'amber'
}

function KpiCard({ label, value, icon, tone }: KpiCardProps) {
  const toneClasses: Record<KpiCardProps['tone'], string> = {
    primary: 'bg-primary/10 text-primary',
    emerald: 'bg-emerald-500/10 text-emerald-600',
    amber: 'bg-amber-500/10 text-amber-600',
  }
  return (
    <Card className="flex items-center gap-4 p-4">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${toneClasses[tone]}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-xl font-bold tracking-tight text-foreground">{value}</p>
      </div>
    </Card>
  )
}

export function VehiculesView() {
  const vehicules = useDataStore((s) => s.vehicules)
  const deleteVehicule = useDataStore((s) => s.deleteVehicule)
  const [showAdd, setShowAdd] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [showEdit, setShowEdit] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const totalVehicules = vehicules.length
  const disponibles = vehicules.filter((v) => v.etat === 'Disponible').length
  const enMaintenance = vehicules.filter((v) => v.etat === 'En maintenance').length

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

      {/* Grid of vehicle cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {vehicules.map((v) => {
          const tone = etatTone(v.etat)
          const iconWrapClass =
            v.etat === 'Disponible'
              ? 'bg-emerald-500/10 text-emerald-600'
              : v.etat === 'En maintenance'
                ? 'bg-amber-500/10 text-amber-600'
                : 'bg-rose-500/10 text-rose-600'
          return (
            <Card key={v.id} className="relative flex flex-col gap-4">
              {/* Actions menu (top-right) */}
              <div className="absolute right-3 top-3 z-10">
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
              </div>
              {/* Header: icon + marque/modele + immat */}
              <div className="flex items-start gap-3 pr-8">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${iconWrapClass}`}>
                  <Car className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-base font-bold text-foreground">
                    {v.marque} {v.modele}
                  </h3>
                  <span className="mt-1.5 inline-block rounded-md border border-border bg-muted/40 px-2 py-0.5 font-mono text-xs font-semibold text-foreground">
                    {v.immatriculation}
                  </span>
                </div>
              </div>

              {/* État badge */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">État</span>
                <StatusBadge label={v.etat} tone={tone} />
              </div>

              {/* Stats row */}
              <div className="mt-auto grid grid-cols-2 gap-2 border-t border-border pt-3">
                <div className="flex flex-col gap-0.5 rounded-lg bg-muted/40 px-3 py-2">
                  <span className="text-xs text-muted-foreground">Séances</span>
                  <span className="text-sm font-bold text-foreground">{v.seances}</span>
                </div>
                <div className="flex flex-col gap-0.5 rounded-lg bg-muted/40 px-3 py-2">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <CalendarClock className="h-3 w-3" />
                    Dernière dépense
                  </span>
                  <span className="text-sm font-bold text-foreground">{v.derniereDepense}</span>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

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
