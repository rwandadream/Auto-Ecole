'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Modal, ModalCancelButton, ModalPrimaryButton, Field, FormInput, FormSelect } from '@/components/dashboard/modal'
import { useDataStore } from '@/store/data-store'
import { type ResultatExamen } from '@/lib/domain/types'
import { todayFrShort } from '@/lib/format'

export function NouvelleSessionDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const addExamenSession = useDataStore((s) => s.addExamenSession)
  const eleves = useDataStore((s) => s.eleves)
  const inspecteurs = useDataStore((s) => s.inspecteurs)
  const vehicules = useDataStore((s) => s.vehicules)

  const today = todayFrShort()

  const [date, setDate] = useState(today)
  const [heure, setHeure] = useState('08:00')
  const [centre, setCentre] = useState('ABIDJAN')
  const [lieu, setLieu] = useState('2 PLATEAUX')
  const [typeExamen, setTypeExamen] = useState<'Code' | 'Conduite'>('Code')
  const [inspecteur, setInspecteur] = useState('Aminata Coulibaly')
  const [vehicule, setVehicule] = useState('—')
  const [selectedEleves, setSelectedEleves] = useState<string[]>([])

  const reset = () => {
    setDate(today)
    setHeure('08:00')
    setCentre('ABIDJAN')
    setLieu('2 PLATEAUX')
    setTypeExamen('Code')
    setInspecteur('Aminata Coulibaly')
    setVehicule('—')
    setSelectedEleves([])
  }

  const handleCancel = () => {
    reset()
    onOpenChange(false)
  }

  const toggleEleve = (code: string) => {
    setSelectedEleves((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    )
  }

  const handleSubmit = () => {
    if (selectedEleves.length === 0) {
      toast.error('Veuillez sélectionner au moins un candidat.')
      return
    }
    const candidats = selectedEleves.map((code) => {
      const e = eleves.find((el) => el.code === code)!
      return {
        nomComplet: `${e.prenom} ${e.nom}`,
        identifiant: e.code,
        telephone: e.telephone,
        categoriePermis: e.typePermis,
        resultat: 'En attente' as ResultatExamen,
      }
    })
    addExamenSession({
      date,
      heure,
      centre,
      lieu,
      typeExamen,
      inspecteur,
      vehicule,
      candidats,
    })
    toast.success(`Session d'examen créée avec ${candidats.length} candidat(s).`)
    reset()
    onOpenChange(false)
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Nouvelle session d'examen"
      description="Planifiez une session collective d'examen"
      size="lg"
      footer={
        <>
          <ModalCancelButton onClick={handleCancel}>
            Annuler
          </ModalCancelButton>
          <ModalPrimaryButton onClick={handleSubmit}>
            <Plus className="h-4 w-4" />
            Créer la session
          </ModalPrimaryButton>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Date" required>
            <FormInput value={date} onChange={(e) => setDate(e.target.value)} placeholder="05 Déc 2026" />
          </Field>
          <Field label="Heure" required>
            <FormInput type="time" value={heure} onChange={(e) => setHeure(e.target.value)} />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Centre (ville)" required>
            <FormInput value={centre} onChange={(e) => setCentre(e.target.value)} placeholder="ABIDJAN" />
          </Field>
          <Field label="Lieu précis">
            <FormInput value={lieu} onChange={(e) => setLieu(e.target.value)} placeholder="2 PLATEAUX" />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Type d'examen">
            <FormSelect value={typeExamen} onChange={(e) => setTypeExamen(e.target.value as 'Code' | 'Conduite')}>
              <option value="Code">Code</option>
              <option value="Conduite">Conduite</option>
            </FormSelect>
          </Field>
          <Field label="Inspecteur">
            <FormSelect value={inspecteur} onChange={(e) => setInspecteur(e.target.value)}>
              {inspecteurs.filter((i) => i.actif).map((i) => (
                <option key={i.id} value={`${i.prenom} ${i.nom}`}>
                  {i.prenom} {i.nom}
                </option>
              ))}
            </FormSelect>
          </Field>
          <Field label="Véhicule">
            <FormSelect value={vehicule} onChange={(e) => setVehicule(e.target.value)} disabled={typeExamen === 'Code'}>
              <option value="—">—</option>
              {vehicules.filter((v) => v.etat === 'Disponible').map((v) => (
                <option key={v.id} value={`${v.marque} ${v.modele} (${v.immatriculation})`}>
                  {v.marque} {v.modele}
                </option>
              ))}
            </FormSelect>
          </Field>
        </div>

        <Field label={`Candidats (${selectedEleves.length} sélectionné${selectedEleves.length > 1 ? 's' : ''})`} required>
          <div className="max-h-56 space-y-1.5 overflow-y-auto rounded-lg border border-border p-2">
            {eleves.map((e) => {
              const checked = selectedEleves.includes(e.code)
              return (
                <label
                  key={e.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors ${
                    checked ? 'bg-primary/10 text-foreground' : 'hover:bg-muted'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleEleve(e.code)}
                    className="h-4 w-4 accent-primary"
                  />
                  <span className="font-medium text-foreground">
                    {e.prenom} {e.nom}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">{e.code}</span>
                  <span className="ml-auto inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-semibold text-foreground">
                    {e.typePermis}
                  </span>
                </label>
              )
            })}
          </div>
        </Field>
      </div>
    </Modal>
  )
}
