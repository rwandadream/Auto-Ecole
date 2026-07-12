'use client'

import { useState } from 'react'
import { Receipt } from 'lucide-react'
import { toast } from 'sonner'
import { Modal, ModalCancelButton, ModalPrimaryButton, Field, FormInput, FormSelect, FormTextarea } from '@/components/dashboard/modal'
import { formatXOF } from '@/components/dashboard/views/shared'
import { useDataStore } from '@/store/data-store'

export function NouvelleFactureDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const addFacture = useDataStore((s) => s.addFacture)
  const eleves = useDataStore((s) => s.eleves)

  const today = new Date().toISOString().split('T')[0]

  const [eleveCode, setEleveCode] = useState('')
  const [libelle, setLibelle] = useState('Facture')
  const [montant, setMontant] = useState('')
  const [avance, setAvance] = useState('')
  const [dateEmission, setDateEmission] = useState(today)
  const [notes, setNotes] = useState('')

  const resetForm = () => {
    setEleveCode('')
    setLibelle('Facture')
    setMontant('')
    setAvance('')
    setDateEmission(today)
    setNotes('')
  }

  const handleSubmit = () => {
    const montantValue = Number(montant) || 0
    const avanceValue = Number(avance) || 0
    if (!eleveCode || montantValue <= 0) {
      toast.error('Veuillez sélectionner un élève et un montant valide')
      return
    }
    if (avanceValue < 0) {
      toast.error('L\'avance ne peut pas être négative')
      return
    }
    if (avanceValue > montantValue) {
      toast.error('L\'avance ne peut pas dépasser le montant total')
      return
    }
    const eleve = eleves.find((e) => e.code === eleveCode)
    if (!eleve) {
      toast.error('Élève introuvable')
      return
    }
    const eleveNom = `${eleve.prenom} ${eleve.nom}`
    addFacture({
      eleve: eleveNom,
      eleveCode,
      formation: libelle.trim() || 'Facture',
      montant: montantValue,
      dateEmission,
      avanceInitiale: avanceValue > 0 ? avanceValue : undefined,
      referenceAvance: notes.trim() || undefined,
    })
    toast.success(avanceValue > 0 ? 'Facture émise avec avance' : 'Facture émise')
    resetForm()
    onOpenChange(false)
  }

  const montantValue = Number(montant) || 0
  const avanceValue = Number(avance) || 0
  const restePreview = Math.max(0, montantValue - avanceValue)

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Émettre une facture"
      description="Générez une facture pour un élève"
      size="md"
      footer={
        <>
          <ModalCancelButton onClick={() => onOpenChange(false)}>
            Annuler
          </ModalCancelButton>
          <ModalPrimaryButton onClick={handleSubmit}>
            <Receipt className="h-4 w-4" />
            Émettre la facture
          </ModalPrimaryButton>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Élève" required>
          <FormSelect value={eleveCode} onChange={(e) => setEleveCode(e.target.value)}>
            <option value="">Sélectionner un élève</option>
            {eleves.map((e) => (
              <option key={e.id} value={e.code}>
                {e.prenom} {e.nom} ({e.code})
              </option>
            ))}
          </FormSelect>
        </Field>

        <Field label="Libellé">
          <FormInput
            value={libelle}
            onChange={(e) => setLibelle(e.target.value)}
            placeholder="Facture"
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Montant total (FCFA)" required>
            <FormInput
              type="text"
              inputMode="numeric"
              value={montant}
              onChange={(e) => setMontant(e.target.value)}
              placeholder="150000"
            />
          </Field>
          <Field label="Date d'émission" required>
            <FormInput type="date" value={dateEmission} onChange={(e) => setDateEmission(e.target.value)} />
          </Field>
        </div>

        <Field label="Avance initiale (FCFA)">
          <FormInput
            type="text"
            inputMode="numeric"
            value={avance}
            onChange={(e) => setAvance(e.target.value)}
            placeholder="0"
          />
        </Field>

        <Field label="Notes">
          <FormTextarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Informations complémentaires (optionnel)"
          />
        </Field>

        <div className="space-y-2 rounded-lg bg-muted p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Montant total</span>
            <span className="text-sm font-bold text-foreground">{formatXOF(montantValue)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Avances payées</span>
            <span className="text-sm font-bold text-success">{formatXOF(avanceValue)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-2">
            <span className="text-sm font-medium text-muted-foreground">Reste à payer</span>
            <span className={`text-lg font-bold ${restePreview > 0 ? 'text-destructive' : 'text-primary'}`}>
              {formatXOF(restePreview)}
            </span>
          </div>
        </div>
      </div>
    </Modal>
  )
}
