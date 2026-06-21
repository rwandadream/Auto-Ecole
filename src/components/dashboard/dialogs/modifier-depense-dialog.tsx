'use client'

import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { Modal, Field, FormInput, FormSelect } from '@/components/dashboard/modal'
import { useDataStore } from '@/store/data-store'
import { type CategorieDepense, type ModePaiement } from '@/lib/mock-data'
import { formatXOF } from '@/components/dashboard/views/shared'

const categories: CategorieDepense[] = [
  'Carburant',
  'Entretien',
  'Réparations',
  'Assurance',
  'Salaires',
  'Fournitures',
  'Autres',
]

const modes: ModePaiement[] = ['Espèces', 'Orange Money', 'Wave', 'Virement']

export function ModifierDepenseDialog({
  depenseId,
  open,
  onOpenChange,
}: {
  depenseId: string | null
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const depense = useDataStore((s) => s.depenses).find((d) => d.id === depenseId)
  const updateDepense = useDataStore((s) => s.updateDepense)
  const vehiculesList = useDataStore((s) => s.vehicules)

  const [categorie, setCategorie] = useState<CategorieDepense>('Carburant')
  const [description, setDescription] = useState('')
  const [montant, setMontant] = useState<number>(0)
  const [modePaiement, setModePaiement] = useState<ModePaiement>('Espèces')
  const [vehicule, setVehicule] = useState('—')
  const [date, setDate] = useState('')

  const [prevOpen, setPrevOpen] = useState(false)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open && depense) {
      setCategorie(depense.categorie)
      setDescription(depense.description)
      setMontant(depense.montant)
      setModePaiement(depense.modePaiement)
      setVehicule(depense.vehicule)
      setDate(depense.date)
    }
  }

  if (!depense) {
    return (
      <Modal open={open} onOpenChange={onOpenChange} title="Modifier la dépense" size="md">
        <div className="py-12 text-center text-sm text-muted-foreground">
          Aucune dépense sélectionnée.
        </div>
      </Modal>
    )
  }

  const handleSubmit = () => {
    if (!description.trim() || montant <= 0) {
      toast.error('Veuillez renseigner la description et un montant valide.')
      return
    }
    updateDepense(depense.id, {
      categorie,
      description: description.trim(),
      montant,
      modePaiement,
      vehicule,
      date,
    })
    toast.success(`Dépense « ${description} » modifiée (${formatXOF(montant)}).`)
    onOpenChange(false)
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Modifier la dépense"
      description={`Mise à jour de la dépense — ${depense.description}`}
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
          <Field label="Catégorie" required>
            <FormSelect value={categorie} onChange={(e) => setCategorie(e.target.value as CategorieDepense)}>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </FormSelect>
          </Field>
          <Field label="Mode de paiement">
            <FormSelect value={modePaiement} onChange={(e) => setModePaiement(e.target.value as ModePaiement)}>
              {modes.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </FormSelect>
          </Field>
        </div>

        <Field label="Description" required>
          <FormInput value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Plein Toyota Yaris" />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Montant (FCFA)" required>
            <FormInput
              type="number"
              min={0}
              value={montant}
              onChange={(e) => setMontant(Number(e.target.value))}
              placeholder="0"
            />
          </Field>
          <Field label="Date">
            <FormInput value={date} onChange={(e) => setDate(e.target.value)} placeholder="15 Nov 2026" />
          </Field>
        </div>

        <Field label="Véhicule associé">
          <FormSelect value={vehicule} onChange={(e) => setVehicule(e.target.value)}>
            <option value="—">— Aucun —</option>
            {vehiculesList.map((v) => (
              <option key={v.id} value={`${v.marque} ${v.modele} (${v.immatriculation})`}>
                {v.marque} {v.modele} ({v.immatriculation})
              </option>
            ))}
          </FormSelect>
        </Field>

        <div className="flex items-center justify-between rounded-lg bg-muted p-3">
          <span className="text-sm font-medium text-muted-foreground">Montant total</span>
          <span className="text-lg font-bold text-primary">{formatXOF(montant)}</span>
        </div>
      </div>
    </Modal>
  )
}
