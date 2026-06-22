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
  const formations = useDataStore((s) => s.formations)

  const today = new Date().toISOString().split('T')[0]

  const [eleveCode, setEleveCode] = useState('')
  const [formationId, setFormationId] = useState('')
  const [montant, setMontant] = useState<number>(0)
  const [dateEmission, setDateEmission] = useState(today)
  const [notes, setNotes] = useState('')

  // Quand la formation change, on met à jour le montant avec le prix de la formation
  const handleFormationChange = (id: string) => {
    setFormationId(id)
    const f = formations.find((fo) => fo.id === id)
    if (f) {
      setMontant(f.prix)
    }
  }

  const resetForm = () => {
    setEleveCode('')
    setFormationId('')
    setMontant(0)
    setDateEmission(today)
    setNotes('')
  }

  const handleSubmit = () => {
    if (!eleveCode || !formationId || montant <= 0) {
      toast.error('Veuillez sélectionner un élève, une formation et un montant valide')
      return
    }
    const eleve = eleves.find((e) => e.code === eleveCode)
    const formation = formations.find((f) => f.id === formationId)
    if (!eleve || !formation) {
      toast.error('Élève ou formation introuvable')
      return
    }
    const eleveNom = `${eleve.prenom} ${eleve.nom}`
    addFacture({
      eleve: eleveNom,
      eleveCode,
      formation: formation.nom,
      montant,
      dateEmission,
    })
    toast.success('Facture émise')
    resetForm()
    onOpenChange(false)
  }

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

        <Field label="Formation" required>
          <FormSelect value={formationId} onChange={(e) => handleFormationChange(e.target.value)}>
            <option value="">Sélectionner une formation</option>
            {formations.filter((f) => f.actif).map((f) => (
              <option key={f.id} value={f.id}>
                {f.nom} — {formatXOF(f.prix)}
              </option>
            ))}
          </FormSelect>
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Montant" required>
            <FormInput
              type="number"
              value={montant}
              min={0}
              onChange={(e) => setMontant(Number(e.target.value))}
              placeholder="0"
            />
          </Field>
          <Field label="Date d'émission" required>
            <FormInput type="date" value={dateEmission} onChange={(e) => setDateEmission(e.target.value)} />
          </Field>
        </div>

        <Field label="Notes">
          <FormTextarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Informations complémentaires (optionnel)"
          />
        </Field>

        {/* Aperçu en direct du montant total */}
        <div className="flex items-center justify-between rounded-lg bg-muted p-3">
          <span className="text-sm font-medium text-muted-foreground">Montant total</span>
          <span className="text-lg font-bold text-primary">{formatXOF(montant)}</span>
        </div>
      </div>
    </Modal>
  )
}
