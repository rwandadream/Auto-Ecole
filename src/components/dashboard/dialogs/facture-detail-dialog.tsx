'use client'

import { useMemo } from 'react'
import { Download } from 'lucide-react'
import { toast } from 'sonner'
import { Modal, ModalCancelButton, ModalPrimaryButton } from '@/components/dashboard/modal'
import { StatusBadge, formatXOF, initials, statutFactureTone } from '@/components/dashboard/views/shared'
import { useDataStore } from '@/store/data-store'
import { generateFacturePdf } from '@/lib/utils-docs'
import type { ModePaiement } from '@/lib/domain/types'

const modePaiementLabel: Record<ModePaiement, string> = {
  Espèces: 'Espèces',
  'Orange Money': 'Orange Money',
  Wave: 'Wave',
  Virement: 'Virement',
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value || '—'}</p>
    </div>
  )
}

export function FactureDetailDialog({
  factureId,
  open,
  onOpenChange,
}: {
  factureId: string | null
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const factures = useDataStore((s) => s.factures)
  const eleves = useDataStore((s) => s.eleves)
  const allPaiements = useDataStore((s) => s.paiements)
  const facture = useMemo(
    () => (factureId ? factures.find((f) => f.id === factureId) : undefined),
    [factures, factureId],
  )
  const paiements = useMemo(
    () =>
      allPaiements.filter((p) => {
        const pFactureId = (p as { factureId?: string }).factureId
        return pFactureId === factureId || (facture ? p.facture === facture.numero : false)
      }),
    [allPaiements, factureId, facture],
  )
  const eleve = useMemo(
    () => (facture?.eleveCode ? eleves.find((e) => e.code === facture.eleveCode) : undefined),
    [eleves, facture],
  )

  if (!facture) {
    return (
      <Modal open={open} onOpenChange={onOpenChange} title="Détail de la facture" size="lg">
        <div className="py-12 text-center text-sm text-muted-foreground">
          Aucune facture sélectionnée.
        </div>
      </Modal>
    )
  }

  const handleDownload = async () => {
    try {
      await generateFacturePdf(facture)
      toast.success(`Facture ${facture.numero} générée.`)
    } catch {
      toast.error('Impossible de générer le PDF.')
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={`Facture ${facture.numero}`}
      description={`Émise le ${facture.dateEmission}`}
      size="lg"
      footer={
        <>
          <ModalCancelButton onClick={() => onOpenChange(false)}>
            Fermer
          </ModalCancelButton>
          <ModalPrimaryButton onClick={handleDownload}>
            <Download className="h-4 w-4" />
            Télécharger PDF
          </ModalPrimaryButton>
        </>
      }
    >
      <div className="space-y-5">
        {/* En-tête facture + élève */}
        <div className="flex flex-col gap-4 rounded-lg border border-border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {initials(facture.eleve)}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{facture.eleve}</p>
              <p className="font-mono text-xs text-muted-foreground">{facture.eleveCode}</p>
              {eleve?.telephone && (
                <p className="text-xs text-muted-foreground">{eleve.telephone}</p>
              )}
            </div>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Numéro de facture</p>
            <p className="font-mono text-base font-bold text-foreground">{facture.numero}</p>
            <div className="mt-1">
              <StatusBadge label={facture.statut} tone={statutFactureTone[facture.statut]} />
            </div>
          </div>
        </div>

        {/* Infos détaillées */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <InfoRow label="Formation" value={facture.formation} />
          <InfoRow label="Date d'émission" value={facture.dateEmission} />
          <InfoRow
            label="Téléphone élève"
            value={eleve?.telephone ?? '—'}
          />
        </div>

        {/* Montants */}
        <div className="overflow-hidden rounded-lg border border-border">
          <div className="grid grid-cols-3 divide-x divide-border bg-muted/40">
            <div className="px-4 py-3">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Montant</p>
              <p className="mt-1 text-sm font-bold text-foreground">{formatXOF(facture.montant)}</p>
            </div>
            <div className="px-4 py-3">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Payé</p>
              <p className="mt-1 text-sm font-bold text-success">{formatXOF(facture.paye)}</p>
            </div>
            <div className="px-4 py-3">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Reste</p>
              <p className={`mt-1 text-sm font-bold ${facture.reste > 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                {formatXOF(facture.reste)}
              </p>
            </div>
          </div>
        </div>

        {/* Paiements liés */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">
              Paiements associés
            </h3>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {paiements.length} paiement{paiements.length > 1 ? 's' : ''}
            </span>
          </div>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left">
                  <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Montant</th>
                  <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mode</th>
                  <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Référence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paiements.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-3 py-6 text-center text-xs text-muted-foreground">
                      Aucun paiement encaissé pour cette facture.
                    </td>
                  </tr>
                )}
                {paiements.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30">
                    <td className="px-3 py-2 text-sm text-foreground">{p.datePaiement}</td>
                    <td className="px-3 py-2 text-right text-sm font-semibold text-success">
                      {formatXOF(p.montant)}
                    </td>
                    <td className="px-3 py-2 text-sm text-muted-foreground">
                      {modePaiementLabel[p.modePaiement] ?? p.modePaiement}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{p.reference}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Modal>
  )
}
