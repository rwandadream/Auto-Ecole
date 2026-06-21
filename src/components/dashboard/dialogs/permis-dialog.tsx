'use client'

import { useState } from 'react'
import { Plus, Save } from 'lucide-react'
import { toast } from 'sonner'
import { Modal, Field, FormInput, FormSelect } from '@/components/dashboard/modal'
import { useDataStore } from '@/store/data-store'

const CODES = ['A', 'B', 'AB', 'C'] as const
type Code = (typeof CODES)[number]

const CODE_LABELS: Record<Code, string> = {
  A: 'A — Moto',
  B: 'B — Voiture',
  AB: 'AB — Moto + Voiture',
  C: 'C — Poids lourd',
}

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

  const [code, setCode] = useState<Code>('B')
  const [libelle, setLibelle] = useState('')

  const isEdit = !!permisId

  const [prevOpen, setPrevOpen] = useState(false)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      if (permisId) {
        const target = permis.find((p) => p.id === permisId)
        if (target) {
          setCode(target.code as Code)
          setLibelle(target.libelle)
        }
      } else {
        setCode('B')
        setLibelle('')
      }
    }
  }

  const reset = () => {
    setCode('B')
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
    const payload = {
      code,
      libelle: libelle.trim(),
    }
    if (isEdit && permisId) {
      updatePermis(permisId, payload)
      toast.success(`Permis ${code} modifié avec succès.`)
    } else {
      addPermis(payload)
      toast.success(`Permis ${code} ajouté au catalogue.`)
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
          <button
            onClick={handleCancel}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-input bg-background px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {isEdit ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {isEdit ? 'Enregistrer' : 'Créer le permis'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Code" required>
          <FormSelect value={code} onChange={(e) => setCode(e.target.value as Code)}>
            {CODES.map((c) => (
              <option key={c} value={c}>
                {CODE_LABELS[c]}
              </option>
            ))}
          </FormSelect>
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
