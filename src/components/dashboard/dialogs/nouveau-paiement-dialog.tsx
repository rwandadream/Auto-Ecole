'use client'

import { useState } from 'react'
import { Banknote } from 'lucide-react'
import { toast } from 'sonner'
import { Modal, ModalCancelButton, ModalPrimaryButton, Field, FormInput, FormSelect } from '@/components/dashboard/modal'
import { useDataStore } from '@/store/data-store'
import { MODES_PAIEMENT } from '@/lib/constants'
import { formatXOF, todayFrShort } from '@/lib/format'
import type { ModePaiement } from '@/lib/domain/types'

export function NouveauPaiementDialog({
  factureId,
  open,
  onOpenChange,
}: {
  factureId: string | null
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const addPaiement = useDataStore((s) => s.addPaiement)
  const factures = useDataStore((s) => s.factures)
  const modesPaiement = useDataStore((s) => s.modesPaiement)
  const modeOpts = modesPaiement.length > 0 ? modesPaiement.map((m) => m.label) : MODES_PAIEMENT

  const today = todayFrShort()

  const [montant, setMontant] = useState<number>(0)
  const [modePaiement, setModePaiement] = useState<ModePaiement>('Espèces')
  const [reference, setReference] = useState('')
  const [datePaiement, setDatePaiement] = useState(today)

  const facture = factures.find((f) => f.id === factureId)

  // Reset montant au reste à payer quand on ouvre (sans useEffect)
  const [prevOpen, setPrevOpen] = useState(false)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open && facture) {
      setMontant(facture.reste)
      setModePaiement('Espèces')
      setReference('')
      setDatePaiement(today)
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  const handleSubmit = () => {
    if (!facture) {
      toast.error('Aucune facture sélectionnée.')
      return
    }
    if (montant <= 0) {
      toast.error('Veuillez saisir un montant supérieur à 0.')
      return
    }
    if (montant > facture.reste) {
      toast.error(`Le montant dépasse le reste à payer (${formatXOF(facture.reste)}).`)
      return
    }
    if (!reference.trim()) {
      // Génération automatique de la référence si vide
      const auto = `${modePaiement.slice(0, 3).toUpperCase()}-${Math.floor(Math.random() * 900000 + 100000)}`
      setReference(auto)
    }
    addPaiement({
      factureId: facture.id,
      eleve: facture.eleve,
      montant,
      modePaiement,
      reference: reference.trim() || `REF-${Math.floor(Math.random() * 900000 + 100000)}`,
      datePaiement,
    })
    toast.success(`Paiement de ${formatXOF(montant)} encaissé pour ${facture.eleve}.`)
    onOpenChange(false)
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Encaisser un paiement"
      description={facture ? `Facture ${facture.numero} — ${facture.eleve}` : 'Aucune facture sélectionnée'}
      size="md"
      footer={
        <>
          <ModalCancelButton onClick={handleCancel}>
            Annuler
          </ModalCancelButton>
          <ModalPrimaryButton onClick={handleSubmit} disabled={!facture}>
            <Banknote className="h-4 w-4" />
            Encaisser
          </ModalPrimaryButton>
        </>
      }
    >
      {facture ? (
        <div className="space-y-4">
          {/* Récap facture */}
          <div className="grid grid-cols-3 gap-3 rounded-lg bg-muted p-3">
            <div>
              <p className="text-xs text-muted-foreground">Montant facture</p>
              <p className="text-sm font-bold text-foreground">{formatXOF(facture.montant)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Déjà payé</p>
              <p className="text-sm font-bold text-success">{formatXOF(facture.paye)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Reste à payer</p>
              <p className="text-sm font-bold text-destructive">{formatXOF(facture.reste)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Montant encaissé (FCFA)" required>
              <FormInput
                type="number"
                min={0}
                max={facture.reste}
                value={montant}
                onChange={(e) => setMontant(Number(e.target.value))}
              />
            </Field>
            <Field label="Mode de paiement" required>
              <FormSelect value={modePaiement} onChange={(e) => setModePaiement(e.target.value as ModePaiement)}>
                {modeOpts.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </FormSelect>
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Référence">
              <FormInput
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Auto-générée si vide"
              />
            </Field>
            <Field label="Date de paiement">
              <FormInput value={datePaiement} onChange={(e) => setDatePaiement(e.target.value)} />
            </Field>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-primary/5 p-3">
            <span className="text-sm font-medium text-muted-foreground">Nouveau reste après encaissement</span>
            <span className="text-lg font-bold text-primary">
              {formatXOF(Math.max(0, facture.reste - montant))}
            </span>
          </div>
        </div>
      ) : (
        <p className="py-6 text-center text-sm text-muted-foreground">Aucune facture sélectionnée.</p>
      )}
    </Modal>
  )
}
