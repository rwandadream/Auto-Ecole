'use client'

import { useState } from 'react'
import { UserPlus, Users, CheckCircle2, Briefcase, Phone, Mail, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { type StatutMoniteur } from '@/lib/mock-data'
import { useDataStore } from '@/store/data-store'
import {
  ViewHeader,
  StatusBadge,
  ActionButton,
  Card,
  initials,
} from '@/components/dashboard/views/shared'
import { NouveauMoniteurDialog } from '@/components/dashboard/dialogs/nouveau-moniteur-dialog'
import { ModifierMoniteurDialog } from '@/components/dashboard/dialogs/modifier-moniteur-dialog'
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

function statutTone(statut: StatutMoniteur): React.ComponentProps<typeof StatusBadge>['tone'] {
  switch (statut) {
    case 'Disponible':
      return 'emerald'
    case 'En mission':
      return 'amber'
    case 'Absent':
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

export function MoniteursView() {
  const moniteurs = useDataStore((s) => s.moniteurs)
  const deleteMoniteur = useDataStore((s) => s.deleteMoniteur)
  const [showAdd, setShowAdd] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [showEdit, setShowEdit] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const totalMoniteurs = moniteurs.length
  const disponibles = moniteurs.filter((m) => m.statut === 'Disponible').length
  const enMission = moniteurs.filter((m) => m.statut === 'En mission').length

  return (
    <div>
      <ViewHeader
        title="Moniteurs"
        description="Équipe pédagogique — moniteurs de conduite et de code"
        actions={
          <ActionButton variant="primary" onClick={() => setShowAdd(true)}>
            <UserPlus className="h-4 w-4" />
            Ajouter un moniteur
          </ActionButton>
        }
      />

      {/* KPI row */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          label="Total moniteurs"
          value={String(totalMoniteurs)}
          icon={<Users className="h-5 w-5" />}
          tone="primary"
        />
        <KpiCard
          label="Disponibles"
          value={String(disponibles)}
          icon={<CheckCircle2 className="h-5 w-5" />}
          tone="emerald"
        />
        <KpiCard
          label="En mission"
          value={String(enMission)}
          icon={<Briefcase className="h-5 w-5" />}
          tone="amber"
        />
      </div>

      {/* Grid of moniteur cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {moniteurs.map((m) => {
          const nomComplet = `${m.prenom} ${m.nom}`
          const isCode = m.specialite === 'Code'
          return (
            <Card key={m.id} className="relative flex flex-col gap-4">
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
                        setEditId(m.id)
                        setShowEdit(true)
                      }}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Modifier
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-rose-600 focus:text-rose-600"
                      onSelect={() => setDeleteId(m.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {/* Header: avatar + name + statut */}
              <div className="flex items-start gap-3 pr-8">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {initials(nomComplet)}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold text-foreground">{nomComplet}</h3>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <span
                      className={
                        isCode
                          ? 'inline-flex items-center gap-1 rounded-full bg-sky-500/10 px-2 py-0.5 text-xs font-semibold text-sky-600'
                          : 'inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary'
                      }
                    >
                      {m.specialite}
                    </span>
                    <StatusBadge label={m.statut} tone={statutTone(m.statut)} />
                  </div>
                </div>
              </div>

              {/* Contact info */}
              <div className="space-y-2 border-t border-border pt-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4 shrink-0" />
                  <span className="truncate">{m.telephone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span className="truncate">{m.email}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-auto flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                <span className="text-xs text-muted-foreground">Séances animées</span>
                <span className="text-sm font-bold text-foreground">{m.seances}</span>
              </div>
            </Card>
          )
        })}
      </div>

      <NouveauMoniteurDialog open={showAdd} onOpenChange={setShowAdd} />
      <ModifierMoniteurDialog moniteurId={editId} open={showEdit} onOpenChange={setShowEdit} />

      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(v) => { if (!v) setDeleteId(null) }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce moniteur ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le moniteur sera définitivement retiré de l&apos;équipe pédagogique.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 text-white hover:bg-rose-700"
              onClick={() => {
                if (deleteId) {
                  deleteMoniteur(deleteId)
                  toast.success('Moniteur supprimé.')
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
