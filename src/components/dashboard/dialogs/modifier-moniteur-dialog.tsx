'use client'

import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { Modal, Field, FormInput, FormSelect } from '@/components/dashboard/modal'
import { useDataStore } from '@/store/data-store'
import type { StatutMoniteur } from '@/lib/mock-data'

const STATUTS: StatutMoniteur[] = ['Disponible', 'En mission', 'Absent']

export function ModifierMoniteurDialog({
  moniteurId,
  open,
  onOpenChange,
}: {
  moniteurId: string | null
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const moniteur = useDataStore((s) => s.moniteurs).find((m) => m.id === moniteurId)
  const updateMoniteur = useDataStore((s) => s.updateMoniteur)

  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [telephone, setTelephone] = useState('')
  const [email, setEmail] = useState('')
  const [specialite, setSpecialite] = useState<'Conduite' | 'Code'>('Conduite')
  const [statut, setStatut] = useState<StatutMoniteur>('Disponible')

  const [prevOpen, setPrevOpen] = useState(false)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open && moniteur) {
      setNom(moniteur.nom)
      setPrenom(moniteur.prenom)
      setTelephone(moniteur.telephone)
      setEmail(moniteur.email)
      setSpecialite(moniteur.specialite)
      setStatut(moniteur.statut)
    }
  }

  if (!moniteur) {
    return (
      <Modal open={open} onOpenChange={onOpenChange} title="Modifier le moniteur" size="md">
        <div className="py-12 text-center text-sm text-muted-foreground">
          Aucun moniteur sélectionné.
        </div>
      </Modal>
    )
  }

  const handleSubmit = () => {
    if (!nom.trim() || !prenom.trim() || !telephone.trim()) {
      toast.error('Veuillez renseigner le nom, le prénom et le téléphone.')
      return
    }
    updateMoniteur(moniteur.id, {
      nom: nom.trim(),
      prenom: prenom.trim(),
      telephone: telephone.trim(),
      email: email.trim(),
      specialite,
      statut,
    })
    toast.success(`Moniteur ${prenom} ${nom} modifié avec succès.`)
    onOpenChange(false)
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Modifier le moniteur"
      description={`Mise à jour de la fiche — ${moniteur.prenom} ${moniteur.nom}`}
      size="md"
      footer={
        <>
          <button
            onClick={() => onOpenChange(false)}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-input bg-background px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Pencil className="h-4 w-4" />
            Enregistrer
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
            <FormSelect value={statut} onChange={(e) => setStatut(e.target.value as StatutMoniteur)}>
              {STATUTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </FormSelect>
          </Field>
        </div>
      </div>
    </Modal>
  )
}
