'use client'

import { useState } from 'react'
import {
  Download,
  Banknote,
  Smartphone,
  Building2,
  Loader2,
  FileText,
  Receipt,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/auth-store'
import { useDataStore, type Facture, type Paiement } from '@/store/data-store'
import type { StatutFacture, ModePaiement } from '@/lib/mock-data'
import { generateFacturePdf, generateRecuPdf } from '@/lib/utils-docs'
import {
  ViewHeader,
  Card,
  StatusBadge,
  formatXOF,
} from './shared'

const statutTone: Record<StatutFacture, 'rose' | 'amber' | 'emerald'> = {
  'Non payée': 'rose',
  Partielle: 'amber',
  Payée: 'emerald',
  Impayée: 'rose',
}

const modePaiementConfig: Record<
  ModePaiement,
  { icon: React.ReactNode; bg: string; fg: string }
> = {
  Espèces: {
    icon: <Banknote className="h-3.5 w-3.5" />,
    bg: 'bg-slate-500/10',
    fg: 'text-slate-600',
  },
  'Orange Money': {
    icon: <Smartphone className="h-3.5 w-3.5" />,
    bg: 'bg-amber-500/10',
    fg: 'text-amber-600',
  },
  Wave: {
    icon: <Smartphone className="h-3.5 w-3.5" />,
    bg: 'bg-sky-500/10',
    fg: 'text-sky-600',
  },
  Virement: {
    icon: <Building2 className="h-3.5 w-3.5" />,
    bg: 'bg-primary/10',
    fg: 'text-primary',
  },
}

function ModePaiementBadge({ mode }: { mode: ModePaiement }) {
  const cfg = modePaiementConfig[mode]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.bg} ${cfg.fg}`}>
      {cfg.icon}
      {mode}
    </span>
  )
}

// KPI mini card
function SummaryCard({
  label,
  value,
  tone = 'slate',
  icon,
}: {
  label: string
  value: string
  tone?: 'primary' | 'emerald' | 'rose' | 'slate'
  icon: React.ReactNode
}) {
  const valueColor: Record<string, string> = {
    primary: 'text-primary',
    emerald: 'text-emerald-600',
    rose: 'text-rose-600',
    slate: 'text-foreground',
  }
  const iconWrap: Record<string, string> = {
    primary: 'bg-primary/10 text-primary',
    emerald: 'bg-emerald-500/10 text-emerald-600',
    rose: 'bg-rose-500/10 text-rose-600',
    slate: 'bg-muted text-muted-foreground',
  }
  return (
    <Card>
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconWrap[tone]}`}>
          {icon}
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className={`mt-0.5 text-xl font-bold ${valueColor[tone]}`}>{value}</p>
        </div>
      </div>
    </Card>
  )
}

// Download button calling real PDF generators
function DownloadButton({
  label,
  document,
  type,
}: {
  label: string
  document: Facture | Paiement
  type: 'facture' | 'recu'
}) {
  const [generating, setGenerating] = useState(false)

  const handleClick = () => {
    if (generating) return
    setGenerating(true)
    try {
      if (type === 'facture') {
        generateFacturePdf(document as Facture)
      } else {
        generateRecuPdf(document as Paiement)
      }
      toast.success('PDF généré')
    } catch {
      toast.error('Erreur lors de la génération du PDF')
    } finally {
      setTimeout(() => setGenerating(false), 600)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={generating}
      className="flex h-8 items-center gap-1.5 rounded-md border border-input bg-background px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-70"
    >
      {generating ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Download className="h-3.5 w-3.5" />
      )}
      <span className="hidden sm:inline">{generating ? 'Génération...' : label}</span>
    </button>
  )
}

export function StudentFacturesView() {
  const user = useAuthStore((s) => s.user)
  const factures = useDataStore((s) => s.factures)
  const paiements = useDataStore((s) => s.paiements)

  if (!user || user.mode !== 'eleve') return null

  // My factures
  const myFactures = factures.filter((f) => f.eleveCode === user.code)
  // My facture numbers
  const myFactureNumbers = new Set(myFactures.map((f) => f.numero))
  // My paiements (those linked to my factures)
  const myPaiements = paiements.filter((p) => myFactureNumbers.has(p.facture))

  // Summaries
  const totalFacture = myFactures.reduce((sum, f) => sum + f.montant, 0)
  const totalPaye = myFactures.reduce((sum, f) => sum + f.paye, 0)
  const totalReste = myFactures.reduce((sum, f) => sum + f.reste, 0)

  return (
    <>
      <ViewHeader
        title="Mes Factures & Reçus"
        description="Historique de vos factures et paiements"
      />

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Total facturé"
          value={formatXOF(totalFacture)}
          tone="slate"
          icon={<FileText className="h-5 w-5" />}
        />
        <SummaryCard
          label="Total payé"
          value={formatXOF(totalPaye)}
          tone="emerald"
          icon={<Receipt className="h-5 w-5" />}
        />
        <SummaryCard
          label="Reste à payer"
          value={formatXOF(totalReste)}
          tone={totalReste > 0 ? 'rose' : 'emerald'}
          icon={<Download className="h-5 w-5" />}
        />
      </div>

      <Tabs defaultValue="factures" className="mt-6">
        <TabsList>
          <TabsTrigger value="factures">Factures ({myFactures.length})</TabsTrigger>
          <TabsTrigger value="recus">Reçus de paiement ({myPaiements.length})</TabsTrigger>
        </TabsList>

        {/* -------- Tab 1 : Factures -------- */}
        <TabsContent value="factures">
          <Card className="p-0">
            <div className="custom-scrollbar overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Numéro</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Formation</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Montant</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Payé</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Reste</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Statut</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {myFactures.map((f) => (
                    <tr key={f.id} className="hover:bg-muted/40">
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm font-bold text-foreground">{f.numero}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{f.formation}</td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-foreground">{formatXOF(f.montant)}</td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-emerald-600">{formatXOF(f.paye)}</td>
                      <td className="px-4 py-3 text-right text-sm font-medium">
                        <span className={f.reste > 0 ? 'text-rose-600' : 'text-muted-foreground'}>
                          {formatXOF(f.reste)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge label={f.statut} tone={statutTone[f.statut]} />
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{f.dateEmission}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <DownloadButton label="Télécharger PDF" document={f} type="facture" />
                        </div>
                      </td>
                    </tr>
                  ))}
                  {myFactures.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-10 text-center text-sm text-muted-foreground">
                        Aucune facture à afficher.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* -------- Tab 2 : Reçus -------- */}
        <TabsContent value="recus">
          <Card className="p-0">
            <div className="custom-scrollbar overflow-x-auto">
              <table className="w-full min-w-[800px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Facture</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Montant</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mode paiement</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Référence</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {myPaiements.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/40">
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm font-bold text-foreground">{p.facture}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-emerald-600">
                        {formatXOF(p.montant)}
                      </td>
                      <td className="px-4 py-3">
                        <ModePaiementBadge mode={p.modePaiement} />
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm text-muted-foreground">{p.reference}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{p.datePaiement}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <DownloadButton label="Télécharger le reçu" document={p} type="recu" />
                        </div>
                      </td>
                    </tr>
                  ))}
                  {myPaiements.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">
                        Aucun reçu de paiement à afficher.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}
