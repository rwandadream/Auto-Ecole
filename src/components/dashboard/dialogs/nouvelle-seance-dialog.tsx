'use client'

import { useState } from 'react'
import { CalendarPlus } from 'lucide-react'
import { toast } from 'sonner'
import { Modal, Field, FormInput, FormSelect, FormTextarea } from '@/components/dashboard/modal'
import { useDataStore } from '@/store/data-store'

export function NouvelleSeanceDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const addSeance = useDataStore((s) => s.addSeance)
  const eleves = useDataStore((s) => s.eleves)
  const moniteurs = useDataStore((s) => s.moniteurs)
  const vehicules = useDataStore((s) => s.vehicules)

  const [eleveCode, setEleveCode] = useState('')
  const [moniteurId, setMoniteurId] = useState('')
  const [vehiculeId, setVehiculeId] = useState('')
  const [date, setDate] = useState('')
  const [heureDebut, setHeureDebut] = useState('')
  const [heureFin, setHeureFin] = useState('')
  const [type, setType] = useState('Conduite')
  const [notes, setNotes] = useState('')

  const vehiculesDisponibles = vehicules.filter((v) => v.etat === 'Disponible')

  const resetForm = () => {
    setEleveCode('')
    setMoniteurId('')
    setVehiculeId('')
    setDate('')
    setHeureDebut('')
    setHeureFin('')
    setType('Conduite')
    setNotes('')
  }

  const computeDureeMin = (debut: string, fin: string) => {
    if (!debut || !fin) return 0
    const [dh, dm] = debut.split(':').map(Number)
    const [fh, fm] = fin.split(':').map(Number)
    const debutMin = dh * 60 + dm
    const finMin = fh * 60 + fm
    return Math.max(0, finMin - debutMin)
  }

  const handleSubmit = () => {
    if (!eleveCode || !moniteurId || !date || !heureDebut || !heureFin) {
      toast.error('Veuillez renseigner tous les champs obligatoires')
      return
    }
    if (heureFin <= heureDebut) {
      toast.error("L'heure de fin doit être après l'heure de début")
      return
    }
    const eleve = eleves.find((e) => e.code === eleveCode)
    const moniteur = moniteurs.find((m) => m.id === moniteurId)
    const vehicule = vehicules.find((v) => v.id === vehiculeId)
    if (!eleve || !moniteur) {
      toast.error('Élève ou moniteur introuvable')
      return
    }
    const eleveNom = `${eleve.prenom} ${eleve.nom}`
    const moniteurNom = `${moniteur.prenom} ${moniteur.nom}`
    const vehiculeDesc = vehicule
      ? `${vehicule.marque} ${vehicule.modele} (${vehicule.immatriculation})`
      : '—'
    const duree = computeDureeMin(heureDebut, heureFin)
    addSeance({
      eleve: eleveNom,
      eleveCode,
      moniteur: moniteurNom,
      vehicule: vehiculeDesc,
      date,
      heureDebut,
      heureFin,
      duree,
      statut: 'Planifié',
      notes: notes.trim(),
    })
    toast.success('Séance planifiée')
    resetForm()
    onOpenChange(false)
  }

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
            onClick={handleSubmit}
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
