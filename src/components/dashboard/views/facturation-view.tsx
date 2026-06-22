'use client'

import { useMemo, useState } from 'react'
import {
  Plus,
  Search,
  MessageCircle,
  Eye,
  Download,
  Trash2,
  Banknote,
} from 'lucide-react'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import {
  ViewHeader,
  StatusBadge,
  ActionButton,
  Card,
  formatXOF,
  initials,
  statutFactureTone,
  ModePaiementBadge,
  KpiCardMinimal,
} from './shared'
import {
  ResponsiveDataView,
  MobileListCard,
  MobileListCardRow,
} from '@/components/dashboard/responsive-data-view'
import { NouvelleFactureDialog } from '@/components/dashboard/dialogs/nouvelle-facture-dialog'
import { NouveauPaiementDialog } from '@/components/dashboard/dialogs/nouveau-paiement-dialog'
import { FactureDetailDialog } from '@/components/dashboard/dialogs/facture-detail-dialog'
import {
  type StatutFacture,
} from '@/lib/domain/types'
import { useDataStore } from '@/store/data-store'
import { useAuthStore } from '@/store/auth-store'
import { canPerformAction } from '@/lib/permissions'
import { generateFacturePdf, relanceWhatsApp, messageRelanceFacture } from '@/lib/utils-docs'

const statutFilters: ('Tous' | StatutFacture)[] = [
  'Tous',
  'Non payée',
  'Partielle',
  'Payée',
  'Impayée',
]

function AvatarCell({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
        {initials(name)}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">{name}</p>
      </div>
    </div>
  )
}

export function FacturationView() {
  const factures = useDataStore((s) => s.factures)
  const paiements = useDataStore((s) => s.paiements)
  const eleves = useDataStore((s) => s.eleves)
  const [search, setSearch] = useState('')
  const [statutFilter, setStatutFilter] = useState<'Tous' | StatutFacture>('Tous')
  const [showNewFacture, setShowNewFacture] = useState(false)
  const [paiementFactureId, setPaiementFactureId] = useState<string | null>(null)
  const [deleteFactureId, setDeleteFactureId] = useState<string | null>(null)
  const [detailFactureId, setDetailFactureId] = useState<string | null>(null)
  const deleteFacture = useDataStore((s) => s.deleteFacture)
  const user = useAuthStore((s) => s.user)
  const canDeleteFacture = canPerformAction(user?.mode === 'admin' ? user.role : '', 'delete_facture')

  const filteredFactures = useMemo(() => {
    return factures.filter((f) => {
      const matchSearch =
        !search ||
        f.numero.toLowerCase().includes(search.toLowerCase()) ||
        f.eleve.toLowerCase().includes(search.toLowerCase()) ||
        f.formation.toLowerCase().includes(search.toLowerCase())
      const matchStatut = statutFilter === 'Tous' || f.statut === statutFilter
      return matchSearch && matchStatut
    })
  }, [factures, search, statutFilter])

  const impayeesCount = factures.filter((f) => f.statut === 'Impayée').length
  const caTotal = useMemo(() => factures.reduce((sum, f) => sum + f.montant, 0), [factures])
  const encaisse = useMemo(() => paiements.reduce((sum, p) => sum + p.montant, 0), [paiements])
  const enAttente = useMemo(
    () => factures.filter((f) => f.statut !== 'Payée').reduce((sum, f) => sum + f.reste, 0),
    [factures],
  )

  const handleBulkRelanceWhatsApp = () => {
    const cibles = filteredFactures.filter(
      (f) => f.statut === 'Impayée' || f.statut === 'Non payée',
    )
    if (cibles.length === 0) {
      toast.info('Aucune facture impayée à relancer')
      return
    }
    cibles.forEach((f, idx) => {
      const eleve = eleves.find((e) => e.code === f.eleveCode)
      const telephone = eleve?.telephone ?? ''
      if (!telephone) return
      const [prenom, ...restNom] = f.eleve.split(' ')
      const nom = restNom.join(' ')
      setTimeout(() => {
        relanceWhatsApp(
          telephone,
          messageRelanceFacture({
            prenom,
            nom,
            numeroFacture: f.numero,
            reste: f.reste,
            telephone,
          }),
        )
      }, 500 * idx)
    })
    toast.success(`${cibles.length} relance${cibles.length > 1 ? 's' : ''} WhatsApp envoyée${cibles.length > 1 ? 's' : ''}`)
  }

  return (
    <>
      <ViewHeader
        title="Facturation"
        description="Factures, paiements et suivi des encaissements"
        actions={
          <ActionButton variant="primary" onClick={() => setShowNewFacture(true)}>
            <Plus className="h-4 w-4" />
            Nouvelle facture
          </ActionButton>
        }
      />

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCardMinimal label="Chiffre d'affaires total" value={formatXOF(caTotal)} tone="primary" />
        <KpiCardMinimal label="Encaissé" value={formatXOF(encaisse)} tone="success" />
        <KpiCardMinimal label="En attente" value={formatXOF(enAttente)} tone="warning" />
        <KpiCardMinimal label="Factures impayées" value={String(impayeesCount)} tone="destructive" />
      </div>

      <Tabs defaultValue="factures" className="mt-6">
        <TabsList>
          <TabsTrigger value="factures">Factures</TabsTrigger>
          <TabsTrigger value="paiements">Paiements</TabsTrigger>
        </TabsList>

        {/* -------- Tab 1 : Factures -------- */}
        <TabsContent value="factures">
          <Card className="p-0">
            {/* Toolbar */}
            <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher une facture, un élève…"
                  className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
                  {statutFilters.map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatutFilter(s)}
                      className={`h-7 rounded-md px-2.5 text-xs font-medium transition-colors ${
                        statutFilter === s
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleBulkRelanceWhatsApp}
                  className="flex h-9 items-center gap-2 rounded-lg bg-success px-3 text-sm font-semibold text-white transition-colors hover:bg-success/90"
                >
                  <MessageCircle className="h-4 w-4" />
                  Relancer WhatsApp
                </button>
              </div>
            </div>

            {/* Table / cartes mobile */}
            <ResponsiveDataView
              empty={filteredFactures.length === 0}
              emptyState={
                <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                  Aucune facture trouvée.
                </p>
              }
              mobile={filteredFactures.map((f) => {
                const eleve = eleves.find((e) => e.code === f.eleveCode)
                const telephone = eleve?.telephone ?? ''
                const [prenom, ...restNom] = f.eleve.split(' ')
                const nom = restNom.join(' ')
                return (
                  <MobileListCard key={f.id}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {initials(f.eleve)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-mono text-xs font-bold text-foreground">{f.numero}</p>
                          <p className="truncate font-semibold text-foreground">{f.eleve}</p>
                        </div>
                      </div>
                      <StatusBadge label={f.statut} tone={statutFactureTone[f.statut]} />
                    </div>
                    <div className="mt-3 space-y-1 border-t border-border pt-3">
                      <MobileListCardRow label="Formation">{f.formation}</MobileListCardRow>
                      <MobileListCardRow label="Montant">{formatXOF(f.montant)}</MobileListCardRow>
                      <MobileListCardRow label="Payé">
                        <span className="text-success">{formatXOF(f.paye)}</span>
                      </MobileListCardRow>
                      <MobileListCardRow label="Reste">
                        <span className={f.reste > 0 ? 'font-semibold text-destructive' : 'text-muted-foreground'}>
                          {formatXOF(f.reste)}
                        </span>
                      </MobileListCardRow>
                      <MobileListCardRow label="Date émission">{f.dateEmission}</MobileListCardRow>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center justify-end gap-1 border-t border-border pt-3">
                      <button
                        onClick={() => setDetailFactureId(f.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        title="Voir"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          void generateFacturePdf(f)
                          toast.success(`Facture ${f.numero} générée.`)
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        title="Télécharger PDF"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      {f.statut !== 'Payée' && (
                        <button
                          onClick={() => setPaiementFactureId(f.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-md text-success transition-colors hover:bg-success/10"
                          title="Encaisser"
                        >
                          <Banknote className="h-4 w-4" />
                        </button>
                      )}
                      {f.statut === 'Impayée' && telephone && (
                        <button
                          onClick={() =>
                            relanceWhatsApp(
                              telephone,
                              messageRelanceFacture({
                                prenom,
                                nom,
                                numeroFacture: f.numero,
                                reste: f.reste,
                                telephone,
                              }),
                            )
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-md text-success transition-colors hover:bg-success/10"
                          title="Relancer WhatsApp"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </button>
                      )}
                      {canDeleteFacture && (
                        <button
                          onClick={() => setDeleteFactureId(f.id)}
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
                  <table className="w-full min-w-[1100px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Numéro</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Élève</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Formation</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Montant</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Payé</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Reste</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Statut</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date émission</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredFactures.map((f) => {
                    const eleve = eleves.find((e) => e.code === f.eleveCode)
                    const telephone = eleve?.telephone ?? ''
                    const [prenom, ...restNom] = f.eleve.split(' ')
                    const nom = restNom.join(' ')
                    return (
                    <tr key={f.id} className="hover:bg-muted/40">
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm font-bold text-foreground">{f.numero}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            {initials(f.eleve)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">{f.eleve}</p>
                            <p className="font-mono text-xs text-muted-foreground">{f.eleveCode}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{f.formation}</td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-foreground">{formatXOF(f.montant)}</td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-success">{formatXOF(f.paye)}</td>
                      <td className="px-4 py-3 text-right text-sm font-medium">
                        <span className={f.reste > 0 ? 'text-destructive' : 'text-muted-foreground'}>
                          {formatXOF(f.reste)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge label={f.statut} tone={statutFactureTone[f.statut]} />
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{f.dateEmission}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setDetailFactureId(f.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            title="Voir"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              void generateFacturePdf(f)
                              toast.success(`Facture ${f.numero} générée.`)
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            title="Télécharger PDF"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          {f.statut !== 'Payée' && (
                            <button
                              onClick={() => setPaiementFactureId(f.id)}
                              className="flex h-8 w-8 items-center justify-center rounded-md text-success transition-colors hover:bg-success/10"
                              title="Encaisser"
                            >
                              <Banknote className="h-4 w-4" />
                            </button>
                          )}
                          {f.statut === 'Impayée' && telephone && (
                            <button
                              onClick={() =>
                                relanceWhatsApp(
                                  telephone,
                                  messageRelanceFacture({
                                    prenom,
                                    nom,
                                    numeroFacture: f.numero,
                                    reste: f.reste,
                                    telephone,
                                  }),
                                )
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-md text-success transition-colors hover:bg-success/10"
                              title="Relancer WhatsApp"
                            >
                              <MessageCircle className="h-4 w-4" />
                            </button>
                          )}
                          {canDeleteFacture && (
                            <button
                              onClick={() => setDeleteFactureId(f.id)}
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
                  {filteredFactures.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-4 py-10 text-center text-sm text-muted-foreground">
                        Aucune facture trouvée.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
                </div>
              }
            />
          </Card>
        </TabsContent>

        {/* -------- Tab 2 : Paiements -------- */}
        <TabsContent value="paiements">
          <Card className="p-0">
            <ResponsiveDataView
              empty={paiements.length === 0}
              emptyState={
                <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                  Aucun paiement enregistré.
                </p>
              }
              mobile={paiements.map((p) => (
                <MobileListCard key={p.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-mono text-sm font-bold text-foreground">{p.facture}</p>
                      <p className="mt-1 truncate font-semibold text-foreground">{p.eleve}</p>
                    </div>
                    <span className="shrink-0 text-sm font-bold text-success">{formatXOF(p.montant)}</span>
                  </div>
                  <div className="mt-3 space-y-1 border-t border-border pt-3">
                    <MobileListCardRow label="Mode paiement">
                      <ModePaiementBadge mode={p.modePaiement} />
                    </MobileListCardRow>
                    <MobileListCardRow label="Référence">
                      <span className="font-mono text-xs">{p.reference}</span>
                    </MobileListCardRow>
                    <MobileListCardRow label="Date">{p.datePaiement}</MobileListCardRow>
                  </div>
                </MobileListCard>
              ))}
              desktop={
                <div className="custom-scrollbar overflow-x-auto">
                  <table className="w-full min-w-[900px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Facture</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Élève</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Montant</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mode paiement</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Référence</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paiements.map((p) => (
                      <tr key={p.id} className="hover:bg-muted/40">
                        <td className="px-4 py-3">
                          <span className="font-mono text-sm font-bold text-foreground">{p.facture}</span>
                        </td>
                        <td className="px-4 py-3">
                          <AvatarCell name={p.eleve} />
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-bold text-success">
                          {formatXOF(p.montant)}
                        </td>
                        <td className="px-4 py-3">
                          <ModePaiementBadge mode={p.modePaiement} />
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-sm text-muted-foreground">{p.reference}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{p.datePaiement}</td>
                      </tr>
                    ))}
                  {paiements.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">
                        Aucun paiement enregistré.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
                </div>
              }
            />
          </Card>
        </TabsContent>
      </Tabs>
      <NouvelleFactureDialog open={showNewFacture} onOpenChange={setShowNewFacture} />
      <NouveauPaiementDialog
        factureId={paiementFactureId}
        open={!!paiementFactureId}
        onOpenChange={(v) => { if (!v) setPaiementFactureId(null) }}
      />
      <FactureDetailDialog
        factureId={detailFactureId}
        open={!!detailFactureId}
        onOpenChange={(v) => { if (!v) setDetailFactureId(null) }}
      />

      <AlertDialog
        open={deleteFactureId !== null}
        onOpenChange={(v) => { if (!v) setDeleteFactureId(null) }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette facture ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La facture et son solde seront définitivement supprimés.
              Les paiements déjà encaissés ne seront pas affectés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (deleteFactureId) {
                  deleteFacture(deleteFactureId)
                  toast.success('Facture supprimée.')
                  setDeleteFactureId(null)
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
