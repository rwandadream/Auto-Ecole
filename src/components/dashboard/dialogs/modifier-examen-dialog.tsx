'use client'

import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { Modal, ModalCancelButton, ModalPrimaryButton, Field, FormInput, FormSelect, FormTextarea } from '@/components/dashboard/modal'
import { useDataStore, type Examen } from '@/store/data-store'
import { type ResultatExamen, PERMIS_CATEGORIES } from '@/lib/domain/types'
import { useDialogReset } from '@/hooks/use-dialog-reset'

export function ModifierExamenDialog({
  examen,
  open,
  onOpenChange,
}: {
  examen: Examen | null
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const updateExamen = useDataStore((s) => s.updateExamen)
  const inspecteurs = useDataStore((s) => s.inspecteurs)

  const [typeExamen, setTypeExamen] = useState<'Code' | 'Conduite'>('Conduite')
  const [typePermis, setTypePermis] = useState('B')
  const [dateExamen, setDateExamen] = useState('')
  const [inspecteur, setInspecteur] = useState('—')
  const [resultat, setResultat] = useState<ResultatExamen>('En attente')
  const [notes, setNotes] = useState('')

  const seedForm = () => {
    if (!examen) return
    setTypeExamen(examen.typeExamen as 'Code' | 'Conduite')
    setTypePermis(examen.typePermis)
    setDateExamen(examen.dateExamen)
    setInspecteur(examen.inspecteur)
    setResultat(examen.resultat)
    setNotes(examen.notes ?? '')
  }

  useDialogReset(open, seedForm)

  if (!examen) return null

  const handleSubmit = () => {
    updateExamen(examen.id, {
      typeExamen,
      typePermis,
      dateExamen,
      inspecteur,
      resultat,
      notes: notes.trim(),
    })
    toast.success('Examen modifié')
    onOpenChange(false)
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Modifier l'examen"
      description={`${examen.eleve} (${examen.eleveCode})`}
      size="md"
      footer={
        <>
          <ModalCancelButton onClick={() => onOpenChange(false)}>
            Annuler
          </ModalCancelButton>
          <ModalPrimaryButton onClick={handleSubmit}>
            <Pencil className="h-4 w-4" />
            Enregistrer
          </ModalPrimaryButton>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Type d'examen">
            <FormSelect value={typeExamen} onChange={(e) => setTypeExamen(e.target.value as 'Code' | 'Conduite')}>
              <option value="Conduite">Conduite</option>
              <option value="Code">Code</option>
            </FormSelect>
          </Field>
          <Field label="Type de permis">
            <FormSelect value={typePermis} onChange={(e) => setTypePermis(e.target.value)}>
              {PERMIS_CATEGORIES.map((p) => (
                <option key={p.code} value={p.code}>{p.code} — {p.libelle}</option>
              ))}
            </FormSelect>
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Date" required>
            <FormInput value={dateExamen} onChange={(e) => setDateExamen(e.target.value)} />
          </Field>
          <Field label="Inspecteur">
            <FormSelect value={inspecteur} onChange={(e) => setInspecteur(e.target.value)}>
              <option value="—">— Code (pas d'inspecteur) —</option>
              {inspecteurs.filter((i) => i.actif).map((i) => (
                <option key={i.id} value={`${i.prenom} ${i.nom}`}>
                  {i.prenom} {i.nom}
                </option>
              ))}
            </FormSelect>
          </Field>
        </div>

        <Field label="Résultat">
          <FormSelect value={resultat} onChange={(e) => setResultat(e.target.value as ResultatExamen)}>
            <option value="En attente">En attente</option>
            <option value="Admis">Admis</option>
            <option value="Échec">Échec</option>
          </FormSelect>
        </Field>

        <Field label="Notes">
          <FormTextarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
        </Field>
      </div>
    </Modal>
  )
}
