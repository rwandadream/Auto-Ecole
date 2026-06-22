'use client'

import { useState } from 'react'
import { Plus, Save } from 'lucide-react'
import { toast } from 'sonner'
import { Modal, ModalCancelButton, ModalPrimaryButton, Field, FormInput, FormSelect } from '@/components/dashboard/modal'
import { useDataStore } from '@/store/data-store'

type Props = {
  open: boolean
  onOpenChange: (v: boolean) => void
  vehiculeId?: string | null
}

const ETATS = ['Disponible', 'En maintenance', 'En panne'] as const

export function VehiculeDialog({ open, onOpenChange, vehiculeId = null }: Props) {
  const addVehicule = useDataStore((s) => s.addVehicule)
  const updateVehicule = useDataStore((s) => s.updateVehicule)
  const vehicules = useDataStore((s) => s.vehicules)

  const [marque, setMarque] = useState('')
  const [modele, setModele] = useState('')
  const [immatriculation, setImmatriculation] = useState('')
  const [etat, setEtat] = useState<(typeof ETATS)[number]>('Disponible')

  const isEdit = !!vehiculeId

  const [prevOpen, setPrevOpen] = useState(false)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      if (vehiculeId) {
        const target = vehicules.find((v) => v.id === vehiculeId)
        if (target) {
          setMarque(target.marque)
          setModele(target.modele)
          setImmatriculation(target.immatriculation)
          setEtat(target.etat)
        }
      } else {
        setMarque('')
        setModele('')
        setImmatriculation('')
        setEtat('Disponible')
      }
    }
  }

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
      toast.error("Veuillez renseigner la marque, le modèle et l'immatriculation.")
      return
    }
    const payload = {
      marque: marque.trim(),
      modele: modele.trim(),
      immatriculation: isEdit ? immatriculation.trim().toUpperCase() : immatriculation.trim(),
      etat,
    }
    if (isEdit && vehiculeId) {
      updateVehicule(vehiculeId, payload)
      toast.success(`Véhicule ${marque} ${modele} modifié avec succès.`)
    } else {
      addVehicule(payload)
      toast.success(`Véhicule ${marque} ${modele} ajouté avec succès.`)
    }
    reset()
    onOpenChange(false)
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Modifier le véhicule' : 'Ajouter un véhicule'}
      description={
        isEdit
          ? 'Mettez à jour les informations du véhicule'
          : 'Renseignez les informations du nouveau véhicule'
      }
      size="md"
      footer={
        <>
          <ModalCancelButton onClick={handleCancel}>
            Annuler
          </ModalCancelButton>
          <ModalPrimaryButton onClick={handleSubmit}>
            {isEdit ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {isEdit ? 'Enregistrer' : 'Ajouter le véhicule'}
          </ModalPrimaryButton>
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
          <FormInput
            value={immatriculation}
            onChange={(e) => setImmatriculation(e.target.value)}
            placeholder="AB-1247-CI"
            className={isEdit ? 'font-mono' : undefined}
          />
        </Field>

        <Field label="État">
          <FormSelect value={etat} onChange={(e) => setEtat(e.target.value as (typeof ETATS)[number])}>
            {ETATS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </FormSelect>
        </Field>
      </div>
    </Modal>
  )
}
