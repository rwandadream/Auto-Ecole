'use client'

import { useMemo, useState } from 'react'
import {
  UserPlus,
  Users,
  CheckCircle2,
  Briefcase,
  MoreVertical,
  Pencil,
  Trash2,
  Search,
  Phone,
  Mail,
} from 'lucide-react'
import { toast } from 'sonner'
import { type StatutMoniteur } from '@/lib/domain/types'
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
  initials,
  statutMoniteurTone,
  PaginationFooter,
} from './shared'
import {
  ResponsiveDataView,
  MobileListCard,
  MobileListCardRow,
} from '@/components/dashboard/responsive-data-view'
import { MoniteurDialog } from '@/components/dashboard/dialogs/nouveau-moniteur-dialog'
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

type StatutFiltre = 'Tous' | StatutMoniteur

const STATUT_FILTRES: StatutFiltre[] = ['Tous', 'Disponible', 'En mission', 'Absent']
const SPECIALITE_FILTRES = ['Tous', 'Conduite', 'Code'] as const

export function MoniteursView() {
  const moniteurs = useDataStore((s) => s.moniteurs)
  const deleteMoniteur = useDataStore((s) => s.deleteMoniteur)
  const user = useAuthStore((s) => s.user)
  const canDeleteMoniteur = canPerformAction(user?.mode === 'admin' ? user.role : '', 'delete_moniteur')

  const [recherche, setRecherche] = useState('')
  const [statutFiltre, setStatutFiltre] = useState<StatutFiltre>('Tous')
  const [specialiteFiltre, setSpecialiteFiltre] = useState<(typeof SPECIALITE_FILTRES)[number]>('Tous')
  const [page, setPage] = useState(1)
  const [showAdd, setShowAdd] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [showEdit, setShowEdit] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const totalMoniteurs = moniteurs.length
  const disponibles = moniteurs.filter((m) => m.statut === 'Disponible').length
  const enMission = moniteurs.filter((m) => m.statut === 'En mission').length

  const moniteursFiltres = useMemo(() => {
    return moniteurs.filter((m) => {
      const matchStatut = statutFiltre === 'Tous' || m.statut === statutFiltre
      const matchSpecialite = specialiteFiltre === 'Tous' || m.specialite === specialiteFiltre
      const q = recherche.trim().toLowerCase()
      const nomComplet = `${m.prenom} ${m.nom}`
      const matchRecherche =
        q === '' ||
        nomComplet.toLowerCase().includes(q) ||
        m.telephone.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.specialite.toLowerCase().includes(q)
      return matchStatut && matchSpecialite && matchRecherche
    })
  }, [moniteurs, recherche, statutFiltre, specialiteFiltre])

  const parPage = 8
  const totalPages = Math.max(1, Math.ceil(moniteursFiltres.length / parPage))
  const pageCourante = Math.min(page, totalPages)
  const debut = (pageCourante - 1) * parPage
  const moniteursPage = moniteursFiltres.slice(debut, debut + parPage)

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
          tone="success"
        />
        <KpiCard
          label="En mission"
          value={String(enMission)}
          icon={<Briefcase className="h-5 w-5" />}
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
              placeholder="Rechercher un moniteur..."
              aria-label="Rechercher un moniteur"
              className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
            />
          </div>

          <div className="custom-scrollbar -mx-1 flex flex-wrap items-center gap-1.5 overflow-x-auto px-1 pb-1 lg:pb-0">
            {SPECIALITE_FILTRES.map((s) => {
              const actif = specialiteFiltre === s
              return (
                <button
                  key={s}
                  aria-pressed={actif}
                  onClick={() => {
                    setSpecialiteFiltre(s)
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
            <span className="mx-1 h-5 w-px bg-border" />
            {STATUT_FILTRES.map((s) => {
              const actif = statutFiltre === s
              return (
                <button
                  key={s}
                  aria-pressed={actif}
                  onClick={() => {
                    setStatutFiltre(s)
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
          empty={moniteursPage.length === 0}
          emptyState={
            <p className="px-4 py-12 text-center text-sm text-muted-foreground">
              Aucun moniteur ne correspond à votre recherche.
            </p>
          }
          mobile={moniteursPage.map((m) => {
            const nomComplet = `${m.prenom} ${m.nom}`
            const isCode = m.specialite === 'Code'
            return (
              <MobileListCard key={m.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {initials(nomComplet)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-foreground">{nomComplet}</p>
                      <span
                        className={cn(
                          'mt-1 inline-flex h-6 items-center justify-center rounded-md px-2 text-xs font-bold',
                          isCode
                            ? 'bg-secondary text-secondary-foreground'
                            : 'bg-primary/10 text-primary',
                        )}
                      >
                        {m.specialite}
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
                          setEditId(m.id)
                          setShowEdit(true)
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>
                      {canDeleteMoniteur && (
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onSelect={() => setDeleteId(m.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="mt-3 space-y-1 border-t border-border pt-3">
                  <MobileListCardRow label="Téléphone">
                    <span className="flex items-center justify-end gap-1.5">
                      <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
                      {m.telephone}
                    </span>
                  </MobileListCardRow>
                  <MobileListCardRow label="Email">
                    <span className="truncate">{m.email}</span>
                  </MobileListCardRow>
                  <MobileListCardRow label="Statut">
                    <StatusBadge label={m.statut} tone={statutMoniteurTone[m.statut]} />
                  </MobileListCardRow>
                  <MobileListCardRow label="Séances animées">
                    <span className="font-bold">{m.seances}</span>
                  </MobileListCardRow>
                </div>
              </MobileListCard>
            )
          })}
          desktop={
            <div className="custom-scrollbar overflow-x-auto">
              <table className="w-full min-w-[960px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Moniteur
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Téléphone
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Spécialité
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Statut
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Séances animées
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {moniteursPage.map((m) => {
                const nomComplet = `${m.prenom} ${m.nom}`
                const isCode = m.specialite === 'Code'
                return (
                  <tr key={m.id} className="transition-colors hover:bg-muted/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {initials(nomComplet)}
                        </div>
                        <p className="truncate font-semibold text-foreground">{nomComplet}</p>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
                        {m.telephone}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
                        <span className="truncate">{m.email}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'inline-flex h-7 min-w-8 items-center justify-center rounded-md px-2 text-xs font-bold',
                          isCode
                            ? 'bg-secondary text-secondary-foreground'
                            : 'bg-primary/10 text-primary'
                        )}
                      >
                        {m.specialite}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge label={m.statut} tone={statutMoniteurTone[m.statut]} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <span className="font-bold text-foreground">{m.seances}</span>
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
                              setEditId(m.id)
                              setShowEdit(true)
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Modifier
                          </DropdownMenuItem>
                          {canDeleteMoniteur && (
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onSelect={() => setDeleteId(m.id)}
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

              {moniteursPage.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    Aucun moniteur ne correspond à votre recherche.
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
          total={totalMoniteurs}
          debut={debut}
          pageDataLength={moniteursPage.length}
          label="moniteurs"
          setPage={setPage}
        />
      </Card>

      <MoniteurDialog open={showAdd} onOpenChange={setShowAdd} />
      <MoniteurDialog moniteurId={editId} open={showEdit} onOpenChange={setShowEdit} />

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
              variant="destructive"
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
