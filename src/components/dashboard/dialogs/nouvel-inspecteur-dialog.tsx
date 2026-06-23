'use client'

import { useState } from 'react'
import { Plus, Save } from 'lucide-react'
import { toast } from 'sonner'
import { Modal, ModalCancelButton, ModalPrimaryButton, Field, FormInput } from '@/components/dashboard/modal'
import { Switch } from '@/components/ui/switch'
import { useDataStore } from '@/store/data-store'
import { useDialogReset } from '@/hooks/use-dialog-reset'

type Props = {
  open: boolean
  onOpenChange: (v: boolean) => void
  /** When provided, dialog runs in edit mode (pre-fill + updateInspecteur). Otherwise create mode. */
  inspecteurId?: string | null
}

export function NouvelInspecteurDialog({ open, onOpenChange, inspecteurId = null }: Props) {
  const addInspecteur = useDataStore((s) => s.addInspecteur)
  const updateInspecteur = useDataStore((s) => s.updateInspecteur)
  const inspecteurs = useDataStore((s) => s.inspecteurs)

  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [telephone, setTelephone] = useState('')
  const [email, setEmail] = useState('')
  const [actif, setActif] = useState(true)

  const isEdit = !!inspecteurId

  const seedForm = () => {
    if (inspecteurId) {
      const target = inspecteurs.find((i) => i.id === inspecteurId)
      if (target) {
        setNom(target.nom)
        setPrenom(target.prenom)
        setTelephone(target.telephone)
        setEmail(target.email)
        setActif(target.actif)
        return
      }
    }
    setNom('')
    setPrenom('')
    setTelephone('')
    setEmail('')
    setActif(true)
  }

  useDialogReset(open, seedForm)

  const reset = () => {
    setNom('')
    setPrenom('')
    setTelephone('')
    setEmail('')
    setActif(true)
  }

  const handleCancel = () => {
    reset()
    onOpenChange(false)
  }

  const handleSubmit = () => {
    if (!nom.trim() || !prenom.trim() || !telephone.trim()) {
      toast.error('Veuillez renseigner le nom, le prénom et le téléphone.')
      return
    }
    const payload = {
      nom: nom.trim(),
      prenom: prenom.trim(),
      telephone: telephone.trim(),
      email: email.trim(),
      actif,
    }
    if (isEdit && inspecteurId) {
      updateInspecteur(inspecteurId, payload)
      toast.success(`Inspecteur ${prenom} ${nom} modifié avec succès.`)
    } else {
      addInspecteur(payload)
      toast.success(`Inspecteur ${prenom} ${nom} ajouté avec succès.`)
    }
    reset()
    onOpenChange(false)
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Modifier l'inspecteur" : 'Ajouter un inspecteur'}
      description={
        isEdit
          ? 'Mettez à jour les informations de l\'inspecteur'
          : "Renseignez les informations du nouvel inspecteur d'examen"
      }
      size="md"
      footer={
        <>
          <ModalCancelButton onClick={handleCancel}>
            Annuler
          </ModalCancelButton>
          <ModalPrimaryButton onClick={handleSubmit}>
            {isEdit ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {isEdit ? 'Enregistrer' : "Créer l'inspecteur"}
          </ModalPrimaryButton>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Nom" required>
            <FormInput value={nom} onChange={(e) => setNom(e.target.value)} placeholder="N'Guessan" />
          </Field>
          <Field label="Prénom" required>
            <FormInput value={prenom} onChange={(e) => setPrenom(e.target.value)} placeholder="Paul" />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Téléphone" required>
            <FormInput value={telephone} onChange={(e) => setTelephone(e.target.value)} placeholder="+225 07 01 02 03" />
          </Field>
          <Field label="Email">
            <FormInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="p.nguessan@examen.gouv.ci" />
          </Field>
        </div>

        <Field label="Statut">
          <div className="flex h-10 items-center gap-3 rounded-lg border border-input bg-background px-3">
            <Switch checked={actif} onCheckedChange={setActif} />
            <span className="text-sm font-medium text-foreground">
              {actif ? 'Actif' : 'Inactif'}
            </span>
            <span className="ml-auto text-xs text-muted-foreground">
              Inspecteur {actif ? 'disponible pour les sessions' : 'désactivé'}
            </span>
          </div>
        </Field>
      </div>
    </Modal>
  )
}
