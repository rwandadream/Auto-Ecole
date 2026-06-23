'use client'

import { useState } from 'react'
import { Plus, Save } from 'lucide-react'
import { toast } from 'sonner'
import { Modal, ModalCancelButton, ModalPrimaryButton, Field, FormInput, FormSelect } from '@/components/dashboard/modal'
import { useDataStore } from '@/store/data-store'
import { STATUTS_MONITEUR } from '@/lib/constants'
import type { StatutMoniteur } from '@/lib/domain/types'
import { useDialogReset } from '@/hooks/use-dialog-reset'

type Props = {
  open: boolean
  onOpenChange: (v: boolean) => void
  moniteurId?: string | null
}

export function MoniteurDialog({ open, onOpenChange, moniteurId = null }: Props) {
  const addMoniteur = useDataStore((s) => s.addMoniteur)
  const updateMoniteur = useDataStore((s) => s.updateMoniteur)
  const moniteurs = useDataStore((s) => s.moniteurs)

  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [telephone, setTelephone] = useState('')
  const [email, setEmail] = useState('')
  const [specialite, setSpecialite] = useState<'Conduite' | 'Code'>('Conduite')
  const [statut, setStatut] = useState<StatutMoniteur>('Disponible')

  const isEdit = !!moniteurId

  const seedForm = () => {
    if (moniteurId) {
      const target = moniteurs.find((m) => m.id === moniteurId)
      if (target) {
        setNom(target.nom)
        setPrenom(target.prenom)
        setTelephone(target.telephone)
        setEmail(target.email)
        setSpecialite(target.specialite as 'Conduite' | 'Code')
        setStatut(target.statut)
        return
      }
    }
    setNom('')
    setPrenom('')
    setTelephone('')
    setEmail('')
    setSpecialite('Conduite')
    setStatut('Disponible')
  }

  useDialogReset(open, seedForm)

  const reset = () => {
    setNom('')
    setPrenom('')
    setTelephone('')
    setEmail('')
    setSpecialite('Conduite')
    setStatut('Disponible')
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
      specialite,
      statut,
    }
    if (isEdit && moniteurId) {
      updateMoniteur(moniteurId, payload)
      toast.success(`Moniteur ${prenom} ${nom} modifié avec succès.`)
    } else {
      addMoniteur(payload)
      toast.success(`Moniteur ${prenom} ${nom} ajouté avec succès.`)
    }
    reset()
    onOpenChange(false)
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Modifier le moniteur' : 'Ajouter un moniteur'}
      description={
        isEdit
          ? 'Mettez à jour les informations du moniteur'
          : 'Renseignez les informations du nouveau moniteur'
      }
      size="md"
      footer={
        <>
          <ModalCancelButton onClick={handleCancel}>
            Annuler
          </ModalCancelButton>
          <ModalPrimaryButton onClick={handleSubmit}>
            {isEdit ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {isEdit ? 'Enregistrer' : 'Créer le moniteur'}
          </ModalPrimaryButton>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Nom" required>
            <FormInput value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Koffi" />
          </Field>
          <Field label="Prénom" required>
            <FormInput value={prenom} onChange={(e) => setPrenom(e.target.value)} placeholder="Jean-Marc" />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Téléphone" required>
            <FormInput value={telephone} onChange={(e) => setTelephone(e.target.value)} placeholder="+225 07 11 22 33" />
          </Field>
          <Field label="Email">
            <FormInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jm.koffi@sarahauto.ci" />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Spécialité">
            <FormSelect value={specialite} onChange={(e) => setSpecialite(e.target.value as 'Conduite' | 'Code')}>
              <option value="Conduite">Conduite</option>
              <option value="Code">Code</option>
            </FormSelect>
          </Field>
          <Field label="Statut">
            <FormSelect value={statut} onChange={(e) => setStatut(e.target.value as StatutMoniteur)}>
              {STATUTS_MONITEUR.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </FormSelect>
          </Field>
        </div>
      </div>
    </Modal>
  )
}
