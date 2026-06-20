'use client'

import { useState } from 'react'
import { CalendarPlus } from 'lucide-react'
import { Modal, Field, FormInput, FormSelect, FormTextarea } from '@/components/dashboard/modal'
import { eleves, moniteurs, vehicules } from '@/lib/mock-data'

export function NouvelleSeanceDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const [eleveCode, setEleveCode] = useState('')
  const [moniteurId, setMoniteurId] = useState('')
  const [vehiculeId, setVehiculeId] = useState('')
  const [date, setDate] = useState('')
  const [heureDebut, setHeureDebut] = useState('')
  const [heureFin, setHeureFin] = useState('')
  const [type, setType] = useState('Conduite')
  const [notes, setNotes] = useState('')

  const vehiculesDisponibles = vehicules.filter((v) => v.etat === 'Disponible')

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Planifier une séance"
      description="Créez une nouvelle séance de conduite ou de code"
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
            onClick={() => onOpenChange(false)}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <CalendarPlus className="h-4 w-4" />
            Planifier la séance
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Élève" required>
          <FormSelect value={eleveCode} onChange={(e) => setEleveCode(e.target.value)}>
            <option value="">Sélectionner un élève</option>
            {eleves.map((e) => (
              <option key={e.id} value={e.code}>
                {e.prenom} {e.nom} ({e.code})
              </option>
            ))}
          </FormSelect>
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Moniteur" required>
            <FormSelect value={moniteurId} onChange={(e) => setMoniteurId(e.target.value)}>
              <option value="">Sélectionner un moniteur</option>
              {moniteurs.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.prenom} {m.nom}
                </option>
              ))}
            </FormSelect>
          </Field>

          <Field label="Véhicule">
            <FormSelect value={vehiculeId} onChange={(e) => setVehiculeId(e.target.value)}>
              <option value="">Aucun véhicule</option>
              {vehiculesDisponibles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.marque} {v.modele} ({v.immatriculation})
                </option>
              ))}
            </FormSelect>
          </Field>
        </div>

        <p className="-mt-2 text-xs text-muted-foreground">
          Seuls les véhicules disponibles sont proposés
        </p>

        <Field label="Date" required>
          <FormInput type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Heure début" required>
            <FormInput type="time" value={heureDebut} onChange={(e) => setHeureDebut(e.target.value)} />
          </Field>
          <Field label="Heure fin" required>
            <FormInput type="time" value={heureFin} onChange={(e) => setHeureFin(e.target.value)} />
          </Field>
        </div>

        <Field label="Type">
          <FormSelect value={type} onChange={(e) => setType(e.target.value)}>
            <option value="Conduite">Conduite</option>
            <option value="Code">Code</option>
          </FormSelect>
        </Field>

        <Field label="Notes">
          <FormTextarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Observations éventuelles (optionnel)"
          />
        </Field>
      </div>
    </Modal>
  )
}
