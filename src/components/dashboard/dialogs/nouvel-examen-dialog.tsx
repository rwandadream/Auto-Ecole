'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Modal, Field, FormInput, FormSelect, FormTextarea } from '@/components/dashboard/modal'
import { useDataStore } from '@/store/data-store'
import { type ResultatExamen } from '@/lib/mock-data'

export function NouvelExamenDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const addExamen = useDataStore((s) => s.addExamen)
  const eleves = useDataStore((s) => s.eleves)
  const inspecteurs = useDataStore((s) => s.inspecteurs)

  const today = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })

  const [eleveCode, setEleveCode] = useState('')
  const [typeExamen, setTypeExamen] = useState<'Code' | 'Conduite'>('Conduite')
  const [typePermis, setTypePermis] = useState('B')
  const [dateExamen, setDateExamen] = useState(today)
  const [inspecteur, setInspecteur] = useState('—')
  const [resultat, setResultat] = useState<ResultatExamen>('En attente')
  const [notes, setNotes] = useState('')

  const reset = () => {
    setEleveCode('')
    setTypeExamen('Conduite')
    setTypePermis('B')
    setDateExamen(today)
    setInspecteur('—')
    setResultat('En attente')
    setNotes('')
  }

  const handleCancel = () => {
    reset()
    onOpenChange(false)
  }

  const handleSubmit = () => {
    const eleve = eleves.find((e) => e.code === eleveCode)
    if (!eleve) {
      toast.error('Veuillez sélectionner un élève.')
      return
    }
    addExamen({
      eleve: `${eleve.prenom} ${eleve.nom}`,
      eleveCode: eleve.code,
      typeExamen,
      typePermis,
      dateExamen,
      inspecteur,
      resultat,
      notes: notes.trim(),
    })
    toast.success(`Examen ${typeExamen} planifié pour ${eleve.prenom} ${eleve.nom}.`)
    reset()
    onOpenChange(false)
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Nouvel examen"
      description="Planifiez un examen individuel pour un élève"
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
            Planifier l'examen
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
          <Field label="Type d'examen">
            <FormSelect value={typeExamen} onChange={(e) => setTypeExamen(e.target.value as 'Code' | 'Conduite')}>
              <option value="Conduite">Conduite</option>
              <option value="Code">Code</option>
            </FormSelect>
          </Field>
          <Field label="Type de permis">
            <FormSelect value={typePermis} onChange={(e) => setTypePermis(e.target.value)}>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="AB">AB</option>
              <option value="C">C</option>
            </FormSelect>
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Date" required>
            <FormInput value={dateExamen} onChange={(e) => setDateExamen(e.target.value)} placeholder="05 Déc 2026" />
          </Field>
          <Field label="Inspecteur">
            <FormSelect value={inspecteur} onChange={(e) => setInspecteur(e.target.value)}>
              <option value="—">— Code (pas d'inspecteur) —</option>
              {inspecteurs.filter((i) => i.actif).map((i) => (
                <option key={i.id} value={`${i.prenom} ${i.nom}`}>
                  {i.prenom} {i.nom}
                </option>
              ))}
            </FormSelect>
          </Field>
        </div>

        <Field label="Résultat">
          <FormSelect value={resultat} onChange={(e) => setResultat(e.target.value as ResultatExamen)}>
            <option value="En attente">En attente</option>
            <option value="Admis">Admis</option>
            <option value="Échec">Échec</option>
          </FormSelect>
        </Field>

        <Field label="Notes">
          <FormTextarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Observations (optionnel)"
          />
        </Field>
      </div>
    </Modal>
  )
}
