'use client'

import { useMemo, useState } from 'react'
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
} from './shared'
import { type CategorieDepense, type ModePaiement } from '@/lib/mock-data'
import { useDataStore } from '@/store/data-store'
import { NouvelleDepenseDialog } from '@/components/dashboard/dialogs/nouvelle-depense-dialog'
import { ModifierDepenseDialog } from '@/components/dashboard/dialogs/modifier-depense-dialog'
import { Modal } from '@/components/dashboard/modal'
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
    bar: 'bg-sky-500',
    badge: 'bg-sky-500/10 text-sky-600',
    icon: <Wrench className="h-3.5 w-3.5" />,
  },
  Réparations: {
    bar: 'bg-rose-500',
    badge: 'bg-rose-500/10 text-rose-600',
    icon: <Wrench className="h-3.5 w-3.5" />,
  },
  Assurance: {
    bar: 'bg-amber-500',
    badge: 'bg-amber-500/10 text-amber-600',
    icon: <ShieldCheck className="h-3.5 w-3.5" />,
  },
  Salaires: {
    bar: 'bg-emerald-500',
    badge: 'bg-emerald-500/10 text-emerald-600',
    icon: <Users className="h-3.5 w-3.5" />,
  },
  Fournitures: {
    bar: 'bg-slate-500',
    badge: 'bg-slate-500/10 text-slate-600',
    icon: <Package className="h-3.5 w-3.5" />,
  },
  Autres: {
    bar: 'bg-slate-400',
    badge: 'bg-slate-500/10 text-slate-600',
    icon: <MoreHorizontal className="h-3.5 w-3.5" />,
  },
}

const modePaiementBadge: Record<ModePaiement, { bg: string; fg: string; icon: React.ReactNode }> = {
  Espèces: {
    bg: 'bg-slate-500/10',
    fg: 'text-slate-600',
    icon: <Banknote className="h-3 w-3" />,
  },
  'Orange Money': {
    bg: 'bg-amber-500/10',
    fg: 'text-amber-600',
    icon: <Smartphone className="h-3 w-3" />,
  },
  Wave: {
    bg: 'bg-sky-500/10',
    fg: 'text-sky-600',
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
  tone?: 'primary' | 'emerald' | 'rose' | 'foreground'
}) {
  const valueColor: Record<string, string> = {
    primary: 'text-primary',
    emerald: 'text-emerald-600',
    rose: 'text-rose-600',
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

export function ComptabiliteView() {
  const depenses = useDataStore((s) => s.depenses)
  const deleteDepense = useDataStore((s) => s.deleteDepense)
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [showEdit, setShowEdit] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

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
        <KpiCard label="Total dépenses" value={formatXOF(totalDepenses)} tone="rose" />
        <KpiCard label="Dépenses véhicules" value={formatXOF(depensesVehicules)} tone="primary" />
        <KpiCard label="Salaires & charges" value={formatXOF(depensesSalaires)} tone="emerald" />
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
                        onClick={() => toast.info('Aucun justificatif téléversé pour cette dépense')}
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
                        <button
                          onClick={() => setDeleteId(d.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-md text-rose-600 transition-colors hover:bg-rose-500/10"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
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
      </Card>

      <NouvelleDepenseDialog open={showAdd} onOpenChange={setShowAdd} />
      <ModifierDepenseDialog depenseId={editId} open={showEdit} onOpenChange={setShowEdit} />

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
              className="bg-rose-600 text-white hover:bg-rose-700"
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
        <button
          onClick={() => onOpenChange(false)}
          className="inline-flex h-10 items-center justify-center rounded-lg border border-input bg-background px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          Fermer
        </button>
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
