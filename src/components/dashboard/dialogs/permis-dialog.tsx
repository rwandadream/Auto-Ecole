'use client'

import { useState } from 'react'
import { Plus, Save } from 'lucide-react'
import { toast } from 'sonner'
import { Modal, ModalCancelButton, ModalPrimaryButton, Field, FormInput, FormSelect } from '@/components/dashboard/modal'
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

  const [code, setCode] = useState('B')
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
    setCode(permis[0]?.code ?? 'B')
    setLibelle('')
  }

  useDialogReset(open, seedForm)

  const reset = () => {
    setCode(permis[0]?.code ?? 'B')
    setLibelle('')
  }

  const handleCancel = () => {
    reset()
    onOpenChange(false)
  }

  const handleSubmit = () => {
    if (!libelle.trim()) {
      toast.error('Veuillez renseigner le libellé du permis.')
      return
    }
    if (!code.trim()) {
      toast.error('Veuillez renseigner le code du permis.')
      return
    }
    const payload = {
      code: code.trim().toUpperCase(),
      libelle: libelle.trim(),
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
          {permis.length > 0 ? (
            <FormSelect value={code} onChange={(e) => setCode(e.target.value)}>
              {permis.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.code} — {p.libelle}
                </option>
              ))}
            </FormSelect>
          ) : (
            <FormInput
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Ex : B, A, AB, C…"
            />
          )}
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
