'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Modal, Field, FormInput, FormSelect } from '@/components/dashboard/modal'
import { useDataStore } from '@/store/data-store'

export function NouveauVehiculeDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const addVehicule = useDataStore((s) => s.addVehicule)

  const [marque, setMarque] = useState('')
  const [modele, setModele] = useState('')
  const [immatriculation, setImmatriculation] = useState('')
  const [etat, setEtat] = useState<'Disponible' | 'En maintenance' | 'En panne'>('Disponible')

  const reset = () => {
    setMarque('')
    setModele('')
    setImmatriculation('')
    setEtat('Disponible')
  }

  const handleCancel = () => {
    reset()
    onOpenChange(false)
  }

  const handleSubmit = () => {
    if (!marque.trim() || !modele.trim() || !immatriculation.trim()) {
      toast.error('Veuillez renseigner la marque, le modèle et l\'immatriculation.')
      return
    }
    addVehicule({
      marque: marque.trim(),
      modele: modele.trim(),
      immatriculation: immatriculation.trim(),
      etat,
    })
    toast.success(`Véhicule ${marque} ${modele} ajouté avec succès.`)
    reset()
    onOpenChange(false)
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Ajouter un véhicule"
      description="Renseignez les informations du nouveau véhicule"
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
            <Plus className="h-4 w-4" />
            Ajouter le véhicule
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Marque" required>
            <FormInput value={marque} onChange={(e) => setMarque(e.target.value)} placeholder="Toyota" />
          </Field>
          <Field label="Modèle" required>
            <FormInput value={modele} onChange={(e) => setModele(e.target.value)} placeholder="Yaris" />
          </Field>
        </div>

        <Field label="Immatriculation" required>
          <FormInput value={immatriculation} onChange={(e) => setImmatriculation(e.target.value)} placeholder="AB-1247-CI" />
        </Field>

        <Field label="État">
          <FormSelect value={etat} onChange={(e) => setEtat(e.target.value as 'Disponible' | 'En maintenance' | 'En panne')}>
            <option value="Disponible">Disponible</option>
            <option value="En maintenance">En maintenance</option>
            <option value="En panne">En panne</option>
          </FormSelect>
        </Field>
      </div>
    </Modal>
  )
}
