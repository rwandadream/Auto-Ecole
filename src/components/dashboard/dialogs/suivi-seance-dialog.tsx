'use client'

import { useState } from 'react'
import { ClipboardCheck, Calendar, Clock, User, Car } from 'lucide-react'
import { toast } from 'sonner'
import { Modal, ModalCancelButton, ModalPrimaryButton, Field, FormSelect, FormTextarea } from '@/components/dashboard/modal'
import { useDataStore, type Seance } from '@/store/data-store'
import { useDialogReset } from '@/hooks/use-dialog-reset'

export function SuiviSeanceDialog({
  seance,
  open,
  onOpenChange,
}: {
  seance: Seance | null
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const updateSeance = useDataStore((s) => s.updateSeance)
  const updateEleve = useDataStore((s) => s.updateEleve)
  const eleves = useDataStore((s) => s.eleves)

  const [statut, setStatut] = useState<Seance['statut']>('Planifié')
  const [notes, setNotes] = useState('')

  const seedForm = () => {
    if (!seance) return
    setStatut(seance.statut)
    setNotes(seance.notes ?? '')
  }

  useDialogReset(open, seedForm)

  if (!seance) return null

  const handleSubmit = () => {
    const previousStatut = seance.statut
    updateSeance(seance.id, { statut, notes: notes.trim() })

    // Si on marque la séance comme Effectué (et qu'elle ne l'était pas avant),
    // on incrémente le compteur de séances faites de l'élève.
    if (statut === 'Effectué' && previousStatut !== 'Effectué') {
      const eleve = eleves.find((e) => e.code === seance.eleveCode)
      if (eleve) {
        updateEleve(eleve.id, { seancesFaites: eleve.seancesFaites + 1 })
      }
    }
    // Si la séance était Effectué et qu'on la repasse à un autre statut,
    // on décrémente le compteur pour garder la cohérence.
    if (previousStatut === 'Effectué' && statut !== 'Effectué') {
      const eleve = eleves.find((e) => e.code === seance.eleveCode)
      if (eleve) {
        updateEleve(eleve.id, { seancesFaites: Math.max(0, eleve.seancesFaites - 1) })
      }
    }

    toast.success('Suivi enregistré')
    onOpenChange(false)
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={`Suivi pédagogique — ${seance.eleve}`}
      description={`${seance.date} à ${seance.heureDebut}`}
      size="md"
      footer={
        <>
          <ModalCancelButton onClick={() => onOpenChange(false)}>
            Annuler
          </ModalCancelButton>
          <ModalPrimaryButton onClick={handleSubmit}>
            <ClipboardCheck className="h-4 w-4" />
            Enregistrer
          </ModalPrimaryButton>
        </>
      }
    >
      <div className="space-y-4">
        {/* Infos séance */}
        <div className="grid grid-cols-2 gap-3 rounded-lg bg-muted p-3 sm:grid-cols-2">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Élève</p>
              <p className="truncate text-sm font-medium text-foreground">{seance.eleve}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Moniteur</p>
              <p className="truncate text-sm font-medium text-foreground">{seance.moniteur}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Car className="h-4 w-4 text-primary" />
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Véhicule</p>
              <p className="truncate text-sm font-medium text-foreground">{seance.vehicule}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Horaire</p>
              <p className="text-sm font-medium text-foreground">
                {seance.date} · {seance.heureDebut}–{seance.heureFin}
              </p>
            </div>
          </div>
        </div>

        {/* Statut */}
        <Field label="Statut de la séance" required>
          <FormSelect
            value={statut}
            onChange={(e) => setStatut(e.target.value as Seance['statut'])}
          >
            <option value="Effectué">Effectué</option>
            <option value="Absent élève">Absent élève</option>
            <option value="Annulé">Annulé</option>
            <option value="Planifié">Planifié</option>
          </FormSelect>
        </Field>

        {/* Notes pédagogiques */}
        <Field label="Notes pédagogiques">
          <FormTextarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Observations du moniteur : progression, points à travailler, comportement…"
          />
        </Field>

        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          Si la séance est marquée <span className="font-semibold text-foreground">Effectué</span>, le
          compteur de séances de l&apos;élève sera incrémenté automatiquement.
        </p>
      </div>
    </Modal>
  )
}
