'use client'

import { useState } from 'react'
import { Plus, Save } from 'lucide-react'
import { toast } from 'sonner'
import { Modal, ModalCancelButton, ModalPrimaryButton, Field, FormInput, FormTextarea } from '@/components/dashboard/modal'
import { Switch } from '@/components/ui/switch'
import { useDataStore } from '@/store/data-store'

type Props = {
  open: boolean
  onOpenChange: (v: boolean) => void
  /** When provided: edit mode. When null: create mode. */
  formationId?: string | null
}

export function FormationDialog({ open, onOpenChange, formationId = null }: Props) {
  const addFormation = useDataStore((s) => s.addFormation)
  const updateFormation = useDataStore((s) => s.updateFormation)
  const formations = useDataStore((s) => s.formations)

  const [nom, setNom] = useState('')
  const [description, setDescription] = useState('')
  const [prix, setPrix] = useState('')
  const [actif, setActif] = useState(true)

  const isEdit = !!formationId

  const [prevOpen, setPrevOpen] = useState(false)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      if (formationId) {
        const target = formations.find((f) => f.id === formationId)
        if (target) {
          setNom(target.nom)
          setDescription(target.description)
          setPrix(String(target.prix))
          setActif(target.actif)
        }
      } else {
        setNom('')
        setDescription('')
        setPrix('')
        setActif(true)
      }
    }
  }

  const reset = () => {
    setNom('')
    setDescription('')
    setPrix('')
    setActif(true)
  }

  const handleCancel = () => {
    reset()
    onOpenChange(false)
  }

  const handleSubmit = () => {
    if (!nom.trim() || !description.trim() || !prix.trim()) {
      toast.error('Veuillez renseigner le nom, la description et le prix.')
      return
    }
    const prixNum = parseInt(prix.replace(/\D/g, ''), 10)
    if (isNaN(prixNum) || prixNum <= 0) {
      toast.error('Le prix doit être un nombre entier positif (en F CFA).')
      return
    }
    const payload = {
      nom: nom.trim(),
      description: description.trim(),
      prix: prixNum,
      actif,
    }
    if (isEdit && formationId) {
      updateFormation(formationId, payload)
      toast.success(`Formation "${nom}" modifiée avec succès.`)
    } else {
      addFormation(payload)
      toast.success(`Formation "${nom}" ajoutée au catalogue.`)
    }
    reset()
    onOpenChange(false)
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Modifier la formation' : 'Nouvelle formation'}
      description={
        isEdit
          ? 'Mettez à jour les informations de la formation'
          : 'Ajoutez un nouveau pack au catalogue de formations'
      }
      size="md"
      footer={
        <>
          <ModalCancelButton onClick={handleCancel}>
            Annuler
          </ModalCancelButton>
          <ModalPrimaryButton onClick={handleSubmit}>
            {isEdit ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {isEdit ? 'Enregistrer' : 'Créer la formation'}
          </ModalPrimaryButton>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Nom" required>
          <FormInput value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Pack Permis B standard" />
        </Field>

        <Field label="Description" required>
          <FormTextarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="20h conduite + code illimité"
            rows={2}
          />
        </Field>

        <Field label="Prix (F CFA)" required>
          <FormInput
            type="text"
            inputMode="numeric"
            value={prix}
            onChange={(e) => setPrix(e.target.value)}
            placeholder="350000"
          />
        </Field>

        <Field label="Statut">
          <div className="flex h-10 items-center gap-3 rounded-lg border border-input bg-background px-3">
            <Switch checked={actif} onCheckedChange={setActif} />
            <span className="text-sm font-medium text-foreground">
              {actif ? 'Actif' : 'Inactif'}
            </span>
            <span className="ml-auto text-xs text-muted-foreground">
              {actif ? 'Proposable aux élèves à l\'inscription' : 'Masqué du catalogue'}
            </span>
          </div>
        </Field>
      </div>
    </Modal>
  )
}
