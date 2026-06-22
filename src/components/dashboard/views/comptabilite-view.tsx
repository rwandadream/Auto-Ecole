'use client'

import { useMemo, useState, useEffect } from 'react'
import {
  Plus,
  Search,
  Paperclip,
  Eye,
  Pencil,
  Trash2,
  Banknote,
  Smartphone,
  Building2,
  Fuel,
  Wrench,
  ShieldCheck,
  Users,
  Package,
  MoreHorizontal,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  ViewHeader,
  ActionButton,
  Card,
  formatXOF,
  type KpiTone,
} from './shared'
import {
  ResponsiveDataView,
  MobileListCard,
  MobileListCardRow,
} from '@/components/dashboard/responsive-data-view'
import { type CategorieDepense, type ModePaiement } from '@/lib/domain/types'
import { canPerformAction } from '@/lib/permissions'
import { useDataStore } from '@/store/data-store'
import { useAuthStore } from '@/store/auth-store'
import { resolveMediaUrl } from '@/lib/supabase/storage'
import { DepenseDialog } from '@/components/dashboard/dialogs/nouvelle-depense-dialog'
import { Modal, ModalCancelButton } from '@/components/dashboard/modal'
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

const categorieConfig: Record<
  CategorieDepense,
  { bar: string; badge: string; icon: React.ReactNode }
> = {
  Carburant: {
    bar: 'bg-primary',
    badge: 'bg-primary/10 text-primary',
    icon: <Fuel className="h-3.5 w-3.5" />,
  },
  Entretien: {
    bar: 'bg-chart-2',
    badge: 'bg-secondary text-secondary-foreground',
    icon: <Wrench className="h-3.5 w-3.5" />,
  },
  Réparations: {
    bar: 'bg-destructive',
    badge: 'bg-destructive/10 text-destructive',
    icon: <Wrench className="h-3.5 w-3.5" />,
  },
  Assurance: {
    bar: 'bg-warning',
    badge: 'bg-warning/10 text-warning',
    icon: <ShieldCheck className="h-3.5 w-3.5" />,
  },
  Salaires: {
    bar: 'bg-success',
    badge: 'bg-success/10 text-success',
    icon: <Users className="h-3.5 w-3.5" />,
  },
  Fournitures: {
    bar: 'bg-muted-foreground',
    badge: 'bg-muted text-muted-foreground',
    icon: <Package className="h-3.5 w-3.5" />,
  },
  Autres: {
    bar: 'bg-muted-foreground/70',
    badge: 'bg-muted text-muted-foreground',
    icon: <MoreHorizontal className="h-3.5 w-3.5" />,
  },
}

const modePaiementBadge: Record<ModePaiement, { bg: string; fg: string; icon: React.ReactNode }> = {
  Espèces: {
    bg: 'bg-muted',
    fg: 'text-muted-foreground',
    icon: <Banknote className="h-3 w-3" />,
  },
  'Orange Money': {
    bg: 'bg-accent',
    fg: 'text-accent-foreground',
    icon: <Smartphone className="h-3 w-3" />,
  },
  Wave: {
    bg: 'bg-secondary',
    fg: 'text-secondary-foreground',
    icon: <Smartphone className="h-3 w-3" />,
  },
  Virement: {
    bg: 'bg-primary/10',
    fg: 'text-primary',
    icon: <Building2 className="h-3 w-3" />,
  },
}

const categorieOrder: CategorieDepense[] = [
  'Carburant',
  'Entretien',
  'Réparations',
  'Assurance',
  'Salaires',
  'Fournitures',
  'Autres',
]

function KpiCard({
  label,
  value,
  tone = 'foreground',
}: {
  label: string
  value: string
  tone?: KpiTone | 'foreground'
}) {
  const valueColor: Record<string, string> = {
    primary: 'text-primary',
    success: 'text-success',
    destructive: 'text-destructive',
    foreground: 'text-foreground',
  }
  return (
    <Card className="p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className={`mt-2 text-2xl font-bold ${valueColor[tone]}`}>{value}</p>
    </Card>
  )
}

function JustificatifImage({ stored }: { stored: string }) {
  const [url, setUrl] = useState('')

  useEffect(() => {
    let cancelled = false
    void resolveMediaUrl(stored).then((resolved) => {
      if (!cancelled) setUrl(resolved)
    })
    return () => {
      cancelled = true
    }
  }, [stored])

  if (!url) {
    return <p className="py-8 text-center text-sm text-muted-foreground">Chargement du justificatif…</p>
  }

  return (
    <img src={url} alt="Justificatif" className="max-h-[70vh] w-full rounded-lg object-contain" />
  )
}

export function ComptabiliteView() {
  const depenses = useDataStore((s) => s.depenses)
  const deleteDepense = useDataStore((s) => s.deleteDepense)
  const user = useAuthStore((s) => s.user)
  const canDeleteDepense = canPerformAction(user?.mode === 'admin' ? user.role : '', 'delete_depense')
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [showEdit, setShowEdit] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [previewJustificatif, setPreviewJustificatif] = useState<string | null>(null)

  // Compute totals per category
  const categorieTotals = useMemo(() => {
    const totals: Record<CategorieDepense, number> = {
      Carburant: 0,
      Entretien: 0,
      Réparations: 0,
      Assurance: 0,
      Salaires: 0,
      Fournitures: 0,
      Autres: 0,
    }
    depenses.forEach((d) => {
      totals[d.categorie] += d.montant
    })
    return totals
  }, [depenses])

  const totalDepenses = useMemo(
    () => depenses.reduce((sum, d) => sum + d.montant, 0),
    [depenses],
  )

  const depensesVehicules = useMemo(
    () => depenses.filter((d) => d.vehicule !== '—').reduce((sum, d) => sum + d.montant, 0),
    [depenses],
  )

  const depensesSalaires = useMemo(
    () => depenses.filter((d) => d.categorie === 'Salaires').reduce((sum, d) => sum + d.montant, 0),
    [depenses],
  )

  const filteredDepenses = useMemo(() => {
    if (!search) return depenses
    const q = search.toLowerCase()
    return depenses.filter(
      (d) =>
        d.description.toLowerCase().includes(q) ||
        d.categorie.toLowerCase().includes(q) ||
        d.vehicule.toLowerCase().includes(q),
    )
  }, [depenses, search])

  return (
    <>
      <ViewHeader
        title="Comptabilité"
        description="Registre des dépenses et comptabilité analytique"
        actions={
          <ActionButton variant="primary" onClick={() => setShowAdd(true)}>
            <Plus className="h-4 w-4" />
            Nouvelle dépense
          </ActionButton>
        }
      />

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Total dépenses" value={formatXOF(totalDepenses)} tone="destructive" />
        <KpiCard label="Dépenses véhicules" value={formatXOF(depensesVehicules)} tone="primary" />
        <KpiCard label="Salaires & charges" value={formatXOF(depensesSalaires)} tone="success" />
      </div>

      {/* Category breakdown */}
      <Card className="mt-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">Répartition par catégorie</h2>
            <p className="text-sm text-muted-foreground">Dépenses du mois en cours</p>
          </div>
          <span className="text-sm font-medium text-muted-foreground">
            Total : <span className="font-bold text-foreground">{formatXOF(totalDepenses)}</span>
          </span>
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          {categorieOrder.map((cat) => {
            const cfg = categorieConfig[cat]
            const montant = categorieTotals[cat]
            const pct = totalDepenses > 0 ? Math.round((montant / totalDepenses) * 100) : 0
            return (
              <div key={cat} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex h-6 w-6 items-center justify-center rounded-md ${cfg.badge}`}>
                      {cfg.icon}
                    </span>
                    <span className="font-medium text-foreground">{cat}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{formatXOF(montant)}</span>
                    <span className="text-xs text-muted-foreground">{pct}%</span>
                  </div>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full ${cfg.bar}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Dépenses table */}
      <Card className="mt-6 p-0">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-semibold text-foreground">Registre des dépenses</h2>
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une dépense…"
              className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            />
          </div>
        </div>

        <ResponsiveDataView
          empty={filteredDepenses.length === 0}
          emptyState={
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              Aucune dépense trouvée.
            </p>
          }
          mobile={filteredDepenses.map((d) => {
            const cfg = categorieConfig[d.categorie]
            const mp = modePaiementBadge[d.modePaiement]
            return (
              <MobileListCard key={d.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.badge}`}>
                      {cfg.icon}
                      {d.categorie}
                    </span>
                    <p className="mt-2 font-semibold text-foreground">{d.description}</p>
                    <p className="text-xs text-muted-foreground">{d.date}</p>
                  </div>
                  <p className="shrink-0 text-sm font-bold text-foreground">{formatXOF(d.montant)}</p>
                </div>
                <div className="mt-3 space-y-1 border-t border-border pt-3">
                  <MobileListCardRow label="Véhicule">
                    {d.vehicule === '—' ? '—' : d.vehicule}
                  </MobileListCardRow>
                  <MobileListCardRow label="Mode">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${mp.bg} ${mp.fg}`}>
                      {mp.icon}
                      {d.modePaiement}
                    </span>
                  </MobileListCardRow>
                </div>
                <div className="mt-3 flex items-center justify-end gap-1 border-t border-border pt-3">
                  <button
                    onClick={() => {
                      if (d.justificatif) setPreviewJustificatif(d.justificatif)
                      else toast.info('Aucun justificatif téléversé pour cette dépense')
                    }}
                    className="inline-flex h-8 items-center gap-1.5 rounded-md border border-input bg-background px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    title="Voir le justificatif"
                  >
                    <Paperclip className="h-3.5 w-3.5" />
                    Justificatif
                  </button>
                  <button
                    onClick={() => setDetailId(d.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    title="Voir"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      setEditId(d.id)
                      setShowEdit(true)
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    title="Modifier"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  {canDeleteDepense && (
                    <button
                      onClick={() => setDeleteId(d.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-md text-destructive transition-colors hover:bg-destructive/10"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </MobileListCard>
            )
          })}
          desktop={
            <div className="custom-scrollbar overflow-x-auto">
              <table className="w-full min-w-[1000px] text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Catégorie</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Véhicule</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mode</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Montant</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Justificatif</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredDepenses.map((d) => {
                const cfg = categorieConfig[d.categorie]
                const mp = modePaiementBadge[d.modePaiement]
                return (
                  <tr key={d.id} className="hover:bg-muted/40">
                    <td className="px-4 py-3 text-sm text-muted-foreground">{d.date}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.badge}`}>
                        {cfg.icon}
                        {d.categorie}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{d.description}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {d.vehicule === '—' ? <span className="text-muted-foreground/60">—</span> : d.vehicule}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${mp.bg} ${mp.fg}`}>
                        {mp.icon}
                        {d.modePaiement}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-foreground">
                      {formatXOF(d.montant)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => {
                          if (d.justificatif) setPreviewJustificatif(d.justificatif)
                          else toast.info('Aucun justificatif téléversé pour cette dépense')
                        }}
                        className="inline-flex h-8 items-center gap-1.5 rounded-md border border-input bg-background px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        title="Voir le justificatif"
                      >
                        <Paperclip className="h-3.5 w-3.5" />
                        Justificatif
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setDetailId(d.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          title="Voir"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditId(d.id)
                            setShowEdit(true)
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          title="Modifier"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        {canDeleteDepense && (
                          <button
                            onClick={() => setDeleteId(d.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-md text-destructive transition-colors hover:bg-destructive/10"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filteredDepenses.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    Aucune dépense trouvée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
            </div>
          }
        />
      </Card>

      <DepenseDialog open={showAdd} onOpenChange={setShowAdd} />
      <DepenseDialog depenseId={editId} open={showEdit} onOpenChange={setShowEdit} />

      <Modal
        open={previewJustificatif !== null}
        onOpenChange={(v) => { if (!v) setPreviewJustificatif(null) }}
        title="Justificatif"
        description="Aperçu du document joint"
        size="lg"
        footer={
          <ModalCancelButton type="button" onClick={() => setPreviewJustificatif(null)}>
            Fermer
          </ModalCancelButton>
        }
      >
        {previewJustificatif && (
          <JustificatifImage stored={previewJustificatif} />
        )}
      </Modal>

      {/* Detail modal (read-only) */}
      <DepenseDetailModal depenseId={detailId} open={detailId !== null} onOpenChange={(v) => { if (!v) setDetailId(null) }} />

      {/* Delete confirmation */}
      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(v) => { if (!v) setDeleteId(null) }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette dépense ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La dépense sera définitivement retirée du registre comptable.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (deleteId) {
                  deleteDepense(deleteId)
                  toast.success('Dépense supprimée.')
                  setDeleteId(null)
                }
              }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

// --- Dépense detail modal (read-only) ---
function DepenseDetailModal({
  depenseId,
  open,
  onOpenChange,
}: {
  depenseId: string | null
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const depense = useDataStore((s) => s.depenses).find((d) => d.id === depenseId)
  if (!depense) {
    return (
      <Modal open={open} onOpenChange={onOpenChange} title="Détail de la dépense" size="md">
        <div className="py-12 text-center text-sm text-muted-foreground">
          Aucune dépense sélectionnée.
        </div>
      </Modal>
    )
  }
  const cfg = categorieConfig[depense.categorie]
  const mp = modePaiementBadge[depense.modePaiement]
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Détail de la dépense"
      description={`Enregistrée le ${depense.date}`}
      size="md"
      footer={
        <ModalCancelButton onClick={() => onOpenChange(false)}>
          Fermer
        </ModalCancelButton>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-lg bg-muted/40 p-4">
          <div className="flex items-center gap-2">
            <span className={`inline-flex h-8 w-8 items-center justify-center rounded-md ${cfg.badge}`}>
              {cfg.icon}
            </span>
            <div>
              <p className="text-xs text-muted-foreground">Catégorie</p>
              <p className="text-sm font-semibold text-foreground">{depense.categorie}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Montant</p>
            <p className="text-lg font-bold text-primary">{formatXOF(depense.montant)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <DetailRow label="Description" value={depense.description} />
          <DetailRow label="Mode de paiement" value={
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${mp.bg} ${mp.fg}`}>
              {mp.icon}
              {depense.modePaiement}
            </span>
          } />
          <DetailRow label="Véhicule associé" value={depense.vehicule === '—' ? 'Aucun' : depense.vehicule} />
          <DetailRow label="Date" value={depense.date} />
        </div>
      </div>
    </Modal>
  )
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value ?? '—'}</p>
    </div>
  )
}
