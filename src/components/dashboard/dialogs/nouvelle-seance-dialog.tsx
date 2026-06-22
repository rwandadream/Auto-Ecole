'use client'

import { useState, useMemo } from 'react'
import { CalendarPlus } from 'lucide-react'
import { toast } from 'sonner'
import { Modal, ModalCancelButton, ModalPrimaryButton, Field, FormInput, FormSelect, FormTextarea } from '@/components/dashboard/modal'
import { useDataStore } from '@/store/data-store'
import { DEFAULT_LIEU_RDV } from '@/lib/domain/constants'
import { getConflictMessage, isMoniteurAvailable, isVehiculeAvailable } from '@/lib/planning-utils'

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
  const seances = useDataStore((s) => s.seances)
  const appConfig = useDataStore((s) => s.appConfig)
  const lieuDefaut = appConfig['lieu_rdv_defaut'] ?? DEFAULT_LIEU_RDV

  const [eleveCode, setEleveCode] = useState('')
  const [moniteurId, setMoniteurId] = useState('')
  const [vehiculeId, setVehiculeId] = useState('')
  const [date, setDate] = useState('')
  const [heureDebut, setHeureDebut] = useState('')
  const [heureFin, setHeureFin] = useState('')
  const [lieuRdv, setLieuRdv] = useState(lieuDefaut)
  const [type, setType] = useState('Conduite')
  const [notes, setNotes] = useState('')

  const slotCheck = useMemo(
    () => ({ date, heureDebut, heureFin }),
    [date, heureDebut, heureFin],
  )

  const moniteursDisponibles = useMemo(() => {
    if (!date || !heureDebut || !heureFin) return moniteurs
    return moniteurs.filter((m) =>
      isMoniteurAvailable(seances, m.id, slotCheck),
    )
  }, [moniteurs, seances, slotCheck, date, heureDebut, heureFin])

  const vehiculesDisponibles = useMemo(() => {
    const base = vehicules.filter((v) => v.etat === 'Disponible')
    if (!date || !heureDebut || !heureFin) return base
    return base.filter((v) => isVehiculeAvailable(seances, v.id, slotCheck))
  }, [vehicules, seances, slotCheck, date, heureDebut, heureFin])

  const resetForm = () => {
    setEleveCode('')
    setMoniteurId('')
    setVehiculeId('')
    setDate('')
    setHeureDebut('')
    setHeureFin('')
    setLieuRdv(lieuDefaut)
    setType('Conduite')
    setNotes('')
  }

  const computeDureeMin = (debut: string, fin: string) => {
    if (!debut || !fin) return 0
    const [dh, dm] = debut.split(':').map(Number)
    const [fh, fm] = fin.split(':').map(Number)
    return Math.max(0, fh * 60 + fm - (dh * 60 + dm))
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
    const conflictMsg = getConflictMessage(seances, {
      date,
      heureDebut,
      heureFin,
      moniteurId,
      vehiculeId: vehiculeId || undefined,
    })
    if (conflictMsg) {
      toast.error(conflictMsg)
      return
    }
    const eleve = eleves.find((e) => e.code === eleveCode)
    const moniteur = moniteurs.find((m) => m.id === moniteurId)
    const vehicule = vehicules.find((v) => v.id === vehiculeId)
    if (!eleve || !moniteur) {
      toast.error('Élève ou moniteur introuvable')
      return
    }
    addSeance({
      eleve: `${eleve.prenom} ${eleve.nom}`,
      eleveCode,
      moniteur: `${moniteur.prenom} ${moniteur.nom}`,
      moniteurId,
      vehicule: vehicule
        ? `${vehicule.marque} ${vehicule.modele} (${vehicule.immatriculation})`
        : '—',
      vehiculeId: vehiculeId || '',
      lieuRdv: lieuRdv.trim() || lieuDefaut,
      date,
      heureDebut,
      heureFin,
      duree: computeDureeMin(heureDebut, heureFin),
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
          <ModalCancelButton onClick={() => onOpenChange(false)}>
            Annuler
          </ModalCancelButton>
          <ModalPrimaryButton onClick={handleSubmit}>
            <CalendarPlus className="h-4 w-4" />
            Planifier la séance
          </ModalPrimaryButton>
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
              {moniteursDisponibles.map((m) => (
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
          Moniteurs et véhicules filtrés selon disponibilité et conflits horaires
        </p>

        <Field label="Lieu de rendez-vous">
          <FormInput value={lieuRdv} onChange={(e) => setLieuRdv(e.target.value)} />
        </Field>

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
