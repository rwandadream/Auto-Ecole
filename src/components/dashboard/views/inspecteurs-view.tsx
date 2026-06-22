'use client'

import { useState } from 'react'
import {
  Plus,
  Shield,
  CheckCircle2,
  XCircle,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Phone,
  Mail,
} from 'lucide-react'
import { toast } from 'sonner'
import { useDataStore } from '@/store/data-store'
import {
  ViewHeader,
  StatusBadge,
  ActionButton,
  Card,
  initials,
  PaginationFooter,
  KpiCard,
} from '@/components/dashboard/views/shared'
import {
  ResponsiveDataView,
  MobileListCard,
  MobileListCardRow,
} from '@/components/dashboard/responsive-data-view'
import { NouvelInspecteurDialog } from '@/components/dashboard/dialogs/nouvel-inspecteur-dialog'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'

type StatutFilter = 'Tous' | 'Actif' | 'Inactif'

export function InspecteursView() {
  const inspecteurs = useDataStore((s) => s.inspecteurs)
  const deleteInspecteur = useDataStore((s) => s.deleteInspecteur)

  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statutFilter, setStatutFilter] = useState<StatutFilter>('Tous')
  const [page, setPage] = useState(1)

  const total = inspecteurs.length
  const actifs = inspecteurs.filter((i) => i.actif).length
  const inactifs = total - actifs

  const filtered = inspecteurs.filter((i) => {
    const nomComplet = `${i.prenom} ${i.nom}`.toLowerCase()
    const q = search.trim().toLowerCase()
    const matchesSearch =
      !q ||
      nomComplet.includes(q) ||
      i.telephone.toLowerCase().includes(q) ||
      i.email.toLowerCase().includes(q)
    const matchesStatut =
      statutFilter === 'Tous' ||
      (statutFilter === 'Actif' && i.actif) ||
      (statutFilter === 'Inactif' && !i.actif)
    return matchesSearch && matchesStatut
  })

  const parPage = 8
  const totalPages = Math.max(1, Math.ceil(filtered.length / parPage))
  const pageCourante = Math.min(page, totalPages)
  const debut = (pageCourante - 1) * parPage
  const inspecteursPage = filtered.slice(debut, debut + parPage)

  const deletingTarget = inspecteurs.find((i) => i.id === deletingId)

  const handleConfirmDelete = () => {
    if (!deletingId) return
    const target = inspecteurs.find((i) => i.id === deletingId)
    deleteInspecteur(deletingId)
    toast.success(`Inspecteur ${target ? `${target.prenom} ${target.nom}` : ''} supprimé.`)
    setDeletingId(null)
  }

  return (
    <div>
      <ViewHeader
        title="Inspecteurs"
        description="Inspecteurs officiels d'examen"
        actions={
          <ActionButton variant="primary" onClick={() => { setEditingId(null); setShowAdd(true) }}>
            <Plus className="h-4 w-4" />
            Ajouter un inspecteur
          </ActionButton>
        }
      />

      {/* KPI row */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          label="Total inspecteurs"
          value={String(total)}
          icon={<Shield className="h-5 w-5" />}
          tone="primary"
        />
        <KpiCard
          label="Actifs"
          value={String(actifs)}
          icon={<CheckCircle2 className="h-5 w-5" />}
          tone="success"
        />
        <KpiCard
          label="Inactifs"
          value={String(inactifs)}
          icon={<XCircle className="h-5 w-5" />}
          tone="neutral"
        />
      </div>

      {/* Search + filter */}
      <Card className="mb-4 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom, téléphone ou email..."
              className="h-10 w-full rounded-lg border border-input bg-background pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            {(['Tous', 'Actif', 'Inactif'] as StatutFilter[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatutFilter(s)}
                className={`h-10 rounded-lg px-3 text-sm font-medium transition-colors ${
                  statutFilter === s
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-input bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Table / cartes mobile */}
      <Card className="p-0">
        <ResponsiveDataView
          empty={inspecteursPage.length === 0}
          emptyState={
            <p className="px-4 py-12 text-center text-sm text-muted-foreground">
              Aucun inspecteur ne correspond à votre recherche.
            </p>
          }
          mobile={inspecteursPage.map((i) => {
            const nomComplet = `${i.prenom} ${i.nom}`
            return (
              <MobileListCard key={i.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {initials(nomComplet)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-foreground">{nomComplet}</p>
                      <StatusBadge
                        label={i.actif ? 'Actif' : 'Inactif'}
                        tone={i.actif ? 'success' : 'neutral'}
                      />
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        aria-label="Actions"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem
                        onClick={() => { setEditingId(i.id); setShowAdd(true) }}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setDeletingId(i.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="mt-3 space-y-1 border-t border-border pt-3">
                  <MobileListCardRow label="Téléphone">
                    <span className="flex items-center justify-end gap-1.5">
                      <Phone className="h-3.5 w-3.5 shrink-0" />
                      {i.telephone}
                    </span>
                  </MobileListCardRow>
                  <MobileListCardRow label="Email">
                    <span className="truncate">{i.email || '—'}</span>
                  </MobileListCardRow>
                </div>
              </MobileListCard>
            )
          })}
          desktop={
            <div className="custom-scrollbar overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nom complet</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Téléphone</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Statut</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {inspecteursPage.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    Aucun inspecteur ne correspond à votre recherche.
                  </td>
                </tr>
              )}
              {inspecteursPage.map((i) => {
                const nomComplet = `${i.prenom} ${i.nom}`
                return (
                  <tr key={i.id} className="hover:bg-muted/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {initials(nomComplet)}
                        </div>
                        <span className="text-sm font-semibold text-foreground">{nomComplet}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Phone className="h-3.5 w-3.5 shrink-0" />
                        {i.telephone}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{i.email || '—'}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        label={i.actif ? 'Actif' : 'Inactif'}
                        tone={i.actif ? 'success' : 'neutral'}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                              aria-label="Actions"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem
                              onClick={() => { setEditingId(i.id); setShowAdd(true) }}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeletingId(i.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
            </div>
          }
        />
        <PaginationFooter
          pageCourante={pageCourante}
          totalPages={totalPages}
          total={filtered.length}
          debut={debut}
          pageDataLength={inspecteursPage.length}
          label="inspecteurs"
          setPage={setPage}
        />
      </Card>

      {/* Dialogs */}
      <NouvelInspecteurDialog
        open={showAdd}
        onOpenChange={(v) => { setShowAdd(v); if (!v) setEditingId(null) }}
        inspecteurId={editingId}
      />

      <AlertDialog open={!!deletingId} onOpenChange={(v) => { if (!v) setDeletingId(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'inspecteur ?</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingTarget ? (
                <>
                  Vous êtes sur le point de supprimer <strong>{deletingTarget.prenom} {deletingTarget.nom}</strong>.
                  Cette action est irréversible et sera tracée dans le journal d'audit.
                </>
              ) : (
                'Cette action est irréversible.'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              variant="destructive"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
