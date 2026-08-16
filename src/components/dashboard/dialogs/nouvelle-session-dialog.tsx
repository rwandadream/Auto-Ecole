'use client'

import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Modal, ModalCancelButton, ModalPrimaryButton, Field, FormInput, FormSelect } from '@/components/dashboard/modal'
import { useDataStore } from '@/store/data-store'
import { type ResultatExamen } from '@/lib/domain/types'
import { todayFrShort } from '@/lib/format'
import { canInscrireExamen, soldeEleve, formatSolde } from '@/lib/finance-utils'

export function NouvelleSessionDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const addExamenSession = useDataStore((s) => s.addExamenSession)
  const eleves = useDataStore((s) => s.eleves)
  const factures = useDataStore((s) => s.factures)

  const today = todayFrShort()

  const [date, setDate] = useState(today)
  const [heure, setHeure] = useState('08:00')
  const [centre, setCentre] = useState('Abidjan')
  const [lieu, setLieu] = useState('')
  const [typeExamen, setTypeExamen] = useState<'Code' | 'Conduite'>('Code')
  const [selectedEleves, setSelectedEleves] = useState<string[]>([])

  const reset = () => {
    setDate(today)
    setHeure('08:00')
    setCentre('Abidjan')
    setLieu('')
    setTypeExamen('Code')
    setSelectedEleves([])
  }

  const handleCancel = () => {
    reset()
    onOpenChange(false)
  }

  const elevesEligibles = useMemo(
    () =>
      eleves.map((e) => {
        const check = canInscrireExamen(typeExamen, e.code, factures)
        return {
          ...e,
          eligible: check.ok,
          message: check.message,
          reste: soldeEleve(e.code, factures),
        }
      }),
    [eleves, factures, typeExamen],
  )

  const selectedEligibles = useMemo(
    () => selectedEleves.filter((code) => canInscrireExamen(typeExamen, code, factures).ok),
    [selectedEleves, typeExamen, factures],
  )

  const changeTypeExamen = (next: 'Code' | 'Conduite') => {
    setTypeExamen(next)
    setSelectedEleves((prev) =>
      prev.filter((code) => canInscrireExamen(next, code, factures).ok),
    )
  }

  const toggleEleve = (code: string) => {
    const check = canInscrireExamen(typeExamen, code, factures)
    if (!check.ok) {
      toast.error(check.message ?? 'Élève non éligible pour cet examen.')
      return
    }
    setSelectedEleves((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    )
  }

  const titreSession =
    typeExamen === 'Code' ? "Bordereau d'examen de code" : "Bordereau d'examen de conduite"

  const handleSubmit = () => {
    if (selectedEligibles.length === 0) {
      toast.error('Veuillez sélectionner au moins un candidat.')
      return
    }
    const nonEligibles = selectedEligibles
      .map((code) => ({ code, ...canInscrireExamen(typeExamen, code, factures) }))
      .filter((r) => !r.ok)
    if (nonEligibles.length > 0) {
      toast.error(nonEligibles[0]?.message ?? 'Un ou plusieurs candidats ne sont pas éligibles.')
      return
    }
    const candidats = selectedEligibles.map((code) => {
      const e = eleves.find((el) => el.code === code)!
      const numPiece = e.numPiece?.trim() || ''
      return {
        nomComplet: `${e.prenom} ${e.nom}`,
        identifiant: numPiece || '—',
        telephone: e.telephone || '',
        categoriePermis: e.typePermis,
        resultat: 'En attente' as ResultatExamen,
      }
    })
    const sansPiece = candidats.filter((c) => !c.identifiant || c.identifiant === '—')
    if (sansPiece.length > 0) {
      toast.error(
        `${sansPiece.length} candidat(s) sans n° de pièce (CNI / passeport / carte consulaire). Complétez le dossier élève avant de les inscrire.`,
      )
      return
    }
    addExamenSession({
      date,
      heure,
      centre: centre.trim() || 'Abidjan',
      lieu: lieu.trim(),
      typeExamen,
      titre: titreSession,
      inspecteur: '',
      vehicule: '—',
      candidats,
    })
    toast.success(`Session d'examen créée avec ${candidats.length} candidat(s).`)
    reset()
    onOpenChange(false)
  }

  const aideEligibilite =
    typeExamen === 'Code'
      ? 'Code : élèves avec au moins un paiement (partiel ou total).'
      : 'Conduite : élèves ayant soldé la totalité de leurs factures.'

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Nouvelle session d'examen"
      description={titreSession}
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
          <Field label="Centre" required>
            <FormInput value={centre} onChange={(e) => setCentre(e.target.value)} placeholder="Abidjan" />
          </Field>
          <Field label="Lieu">
            <FormInput value={lieu} onChange={(e) => setLieu(e.target.value)} placeholder="Vallon, Cocody…" />
          </Field>
        </div>

        <Field label="Type d'examen">
          <FormSelect
            value={typeExamen}
            onChange={(e) => changeTypeExamen(e.target.value as 'Code' | 'Conduite')}
          >
            <option value="Code">Code</option>
            <option value="Conduite">Conduite</option>
          </FormSelect>
        </Field>

        <Field label={`Candidats (${selectedEligibles.length} sélectionné${selectedEligibles.length > 1 ? 's' : ''})`} required>
          <div className="max-h-56 space-y-1.5 overflow-y-auto rounded-lg border border-border p-2">
            {elevesEligibles.map((e) => {
              const checked = selectedEligibles.includes(e.code)
              const numPiece = e.numPiece?.trim() || ''
              return (
                <label
                  key={e.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors ${
                    !e.eligible
                      ? 'cursor-not-allowed opacity-60'
                      : checked
                        ? 'bg-primary/10 text-foreground'
                        : 'hover:bg-muted'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleEleve(e.code)}
                    disabled={!e.eligible}
                    className="h-4 w-4 accent-primary"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="font-medium text-foreground">
                      {e.prenom} {e.nom}
                    </span>
                    <span className="mt-0.5 block font-mono text-xs text-muted-foreground">
                      {numPiece || 'Sans n° pièce'}
                    </span>
                  </span>
                  <span className="ml-auto inline-flex items-center gap-1.5">
                    {!e.eligible && (
                      <span className="rounded-md bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
                        {typeExamen === 'Conduite' ? `Solde ${formatSolde(e.reste)}` : 'Sans paiement'}
                      </span>
                    )}
                    <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-semibold text-foreground">
                      {e.typePermis || '—'}
                    </span>
                  </span>
                </label>
              )
            })}
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Liste : nom + n° CNI / passeport / carte consulaire. {aideEligibilite}
          </p>
        </Field>
      </div>
    </Modal>
  )
}
