'use client'

import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { Modal, Field, FormInput, FormSelect } from '@/components/dashboard/modal'
import { useDataStore } from '@/store/data-store'
import type { EtatVehicule } from '@/lib/mock-data'

const ETATS: EtatVehicule[] = ['Disponible', 'En maintenance', 'En panne']

export function ModifierVehiculeDialog({
  vehiculeId,
  open,
  onOpenChange,
}: {
  vehiculeId: string | null
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const vehicule = useDataStore((s) => s.vehicules).find((v) => v.id === vehiculeId)
  const updateVehicule = useDataStore((s) => s.updateVehicule)

  const [marque, setMarque] = useState('')
  const [modele, setModele] = useState('')
  const [immatriculation, setImmatriculation] = useState('')
  const [etat, setEtat] = useState<EtatVehicule>('Disponible')

  const [prevOpen, setPrevOpen] = useState(false)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open && vehicule) {
      setMarque(vehicule.marque)
      setModele(vehicule.modele)
      setImmatriculation(vehicule.immatriculation)
      setEtat(vehicule.etat)
    }
  }

  if (!vehicule) {
    return (
      <Modal open={open} onOpenChange={onOpenChange} title="Modifier le véhicule" size="md">
        <div className="py-12 text-center text-sm text-muted-foreground">
          Aucun véhicule sélectionné.
        </div>
      </Modal>
    )
  }

  const handleSubmit = () => {
    if (!marque.trim() || !modele.trim() || !immatriculation.trim()) {
      toast.error('Veuillez renseigner la marque, le modèle et l\'immatriculation.')
      return
    }
    updateVehicule(vehicule.id, {
      marque: marque.trim(),
      modele: modele.trim(),
      immatriculation: immatriculation.trim().toUpperCase(),
      etat,
    })
    toast.success(`Véhicule ${marque} ${modele} modifié avec succès.`)
    onOpenChange(false)
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Modifier le véhicule"
      description={`Mise à jour — ${vehicule.marque} ${vehicule.modele} (${vehicule.immatriculation})`}
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
            className="font-mono"
          />
        </Field>

        <Field label="État">
          <FormSelect value={etat} onChange={(e) => setEtat(e.target.value as EtatVehicule)}>
            {ETATS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </FormSelect>
        </Field>
      </div>
    </Modal>
  )
}
