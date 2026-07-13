'use client'

import { useState } from 'react'
import { Plus, Save } from 'lucide-react'
import { toast } from 'sonner'
import { Modal, ModalCancelButton, ModalPrimaryButton, Field, FormInput } from '@/components/dashboard/modal'
import { useDataStore } from '@/store/data-store'
import { useDialogReset } from '@/hooks/use-dialog-reset'

type Props = {
  open: boolean
  onOpenChange: (v: boolean) => void
  /** When provided: edit mode. When null: create mode. */
  permisId?: string | null
}

export function PermisDialog({ open, onOpenChange, permisId = null }: Props) {
  const addPermis = useDataStore((s) => s.addPermis)
  const updatePermis = useDataStore((s) => s.updatePermis)
  const permis = useDataStore((s) => s.permis)

  const [code, setCode] = useState('')
  const [libelle, setLibelle] = useState('')

  const isEdit = !!permisId

  const seedForm = () => {
    if (permisId) {
      const target = permis.find((p) => p.id === permisId)
      if (target) {
        setCode(target.code)
        setLibelle(target.libelle)
        return
      }
    }
    setCode('')
    setLibelle('')
  }

  useDialogReset(open, seedForm)

  const reset = () => {
    setCode('')
    setLibelle('')
  }

  const handleCancel = () => {
    reset()
    onOpenChange(false)
  }

  const handleSubmit = () => {
    const nextCode = code.trim().toUpperCase()
    const nextLibelle = libelle.trim()
    if (!nextCode) {
      toast.error('Veuillez renseigner le code du permis.')
      return
    }
    if (!nextLibelle) {
      toast.error('Veuillez renseigner le libellé du permis.')
      return
    }
    const duplicate = permis.some(
      (p) => p.code.toUpperCase() === nextCode && p.id !== permisId,
    )
    if (duplicate) {
      toast.error(`Le code « ${nextCode} » existe déjà dans le catalogue.`)
      return
    }
    const payload = {
      code: nextCode,
      libelle: nextLibelle,
    }
    if (isEdit && permisId) {
      updatePermis(permisId, payload)
      toast.success(`Permis ${payload.code} modifié avec succès.`)
    } else {
      addPermis(payload)
      toast.success(`Permis ${payload.code} ajouté au catalogue.`)
    }
    reset()
    onOpenChange(false)
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Modifier le permis' : 'Nouveau permis'}
      description={
        isEdit
          ? 'Mettez à jour les informations du type de permis'
          : 'Ajoutez un nouveau type de permis au catalogue'
      }
      size="sm"
      footer={
        <>
          <ModalCancelButton onClick={handleCancel}>
            Annuler
          </ModalCancelButton>
          <ModalPrimaryButton onClick={handleSubmit}>
            {isEdit ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {isEdit ? 'Enregistrer' : 'Créer le permis'}
          </ModalPrimaryButton>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Code" required>
          <FormInput
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Ex : B, A, AB, C…"
            disabled={isEdit}
            readOnly={isEdit}
          />
        </Field>

        <Field label="Libellé" required>
          <FormInput
            value={libelle}
            onChange={(e) => setLibelle(e.target.value)}
            placeholder="Voiture"
          />
        </Field>
      </div>
    </Modal>
  )
}
