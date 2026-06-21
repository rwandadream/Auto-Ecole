'use client'

import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { Modal, Field, FormInput, FormSelect } from '@/components/dashboard/modal'
import { useDataStore } from '@/store/data-store'

export function NouveauMoniteurDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const addMoniteur = useDataStore((s) => s.addMoniteur)

  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [telephone, setTelephone] = useState('')
  const [email, setEmail] = useState('')
  const [specialite, setSpecialite] = useState<'Conduite' | 'Code'>('Conduite')
  const [statut, setStatut] = useState<'Disponible' | 'En mission' | 'Absent'>('Disponible')

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
    addMoniteur({
      nom: nom.trim(),
      prenom: prenom.trim(),
      telephone: telephone.trim(),
      email: email.trim(),
      specialite,
      statut,
    })
    toast.success(`Moniteur ${prenom} ${nom} ajouté avec succès.`)
    reset()
    onOpenChange(false)
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Ajouter un moniteur"
      description="Renseignez les informations du nouveau moniteur"
      size="md"
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
            <UserPlus className="h-4 w-4" />
            Créer le moniteur
          </button>
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
            <FormSelect value={statut} onChange={(e) => setStatut(e.target.value as 'Disponible' | 'En mission' | 'Absent')}>
              <option value="Disponible">Disponible</option>
              <option value="En mission">En mission</option>
              <option value="Absent">Absent</option>
            </FormSelect>
          </Field>
        </div>
      </div>
    </Modal>
  )
}
