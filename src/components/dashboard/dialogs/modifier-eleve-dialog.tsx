'use client'

import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { Modal, Field, FormInput, FormSelect } from '@/components/dashboard/modal'
import { useDataStore } from '@/store/data-store'
import type { StatutEleve } from '@/lib/mock-data'

const sectionLabel = 'text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3'

const STATUTS: StatutEleve[] = [
  'Prospect',
  'Inscrit',
  'En formation',
  'Examen',
  'Admis',
  'Ajourné',
  'Terminé',
  'Abandon',
]

export function ModifierEleveDialog({
  eleveCode,
  open,
  onOpenChange,
}: {
  eleveCode: string | null
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const eleve = useDataStore((s) => s.eleves).find((e) => e.code === eleveCode)
  const updateEleve = useDataStore((s) => s.updateEleve)

  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [dateNaissance, setDateNaissance] = useState('')
  const [lieuNaissance, setLieuNaissance] = useState('')
  const [sexe, setSexe] = useState('M')
  const [nationalite, setNationalite] = useState('Ivoirienne')
  const [telephone, setTelephone] = useState('')
  const [email, setEmail] = useState('')
  const [typePiece, setTypePiece] = useState('CNI')
  const [numPiece, setNumPiece] = useState('')
  const [typePermis, setTypePermis] = useState('B')
  const [statut, setStatut] = useState<StatutEleve>('Prospect')
  const [moniteur, setMoniteur] = useState('Non assigné')

  // Pré-remplir le formulaire à l'ouverture (ou quand l'élève change)
  const [prevOpen, setPrevOpen] = useState(false)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open && eleve) {
      setNom(eleve.nom)
      setPrenom(eleve.prenom)
      setDateNaissance(eleve.dateNaissance)
      setLieuNaissance(eleve.lieuNaissance)
      setSexe(eleve.sexe)
      setNationalite(eleve.nationalite)
      setTelephone(eleve.telephone)
      setEmail(eleve.email)
      setTypePiece(eleve.typePiece)
      setNumPiece(eleve.numPiece)
      setTypePermis(eleve.typePermis)
      setStatut(eleve.statut)
      setMoniteur(eleve.moniteur)
    }
  }

  if (!eleve) {
    return (
      <Modal open={open} onOpenChange={onOpenChange} title="Modifier l'élève" size="lg">
        <div className="py-12 text-center text-sm text-muted-foreground">
          Aucun élève sélectionné.
        </div>
      </Modal>
    )
  }

  const handleSubmit = () => {
    if (!nom.trim() || !prenom.trim() || !telephone.trim()) {
      toast.error('Veuillez renseigner le nom, le prénom et le téléphone')
      return
    }
    updateEleve(eleve.id, {
      nom: nom.trim(),
      prenom: prenom.trim(),
      telephone: telephone.trim(),
      email: email.trim(),
      dateNaissance,
      lieuNaissance: lieuNaissance.trim(),
      sexe,
      nationalite: nationalite.trim(),
      typePiece,
      numPiece: numPiece.trim(),
      typePermis,
      statut,
      moniteur,
    })
    toast.success('Élève modifié avec succès')
    onOpenChange(false)
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Modifier l'élève"
      description={`Mise à jour de la fiche ${eleve.code} — ${eleve.prenom} ${eleve.nom}`}
      size="lg"
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
      <div className="space-y-6">
        {/* Section Identité */}
        <section>
          <h3 className={sectionLabel}>Identité</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Nom" required>
              <FormInput value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Koné" />
            </Field>
            <Field label="Prénom" required>
              <FormInput value={prenom} onChange={(e) => setPrenom(e.target.value)} placeholder="Aminata" />
            </Field>
            <Field label="Date de naissance">
              <FormInput type="date" value={dateNaissance} onChange={(e) => setDateNaissance(e.target.value)} />
            </Field>
            <Field label="Lieu de naissance">
              <FormInput value={lieuNaissance} onChange={(e) => setLieuNaissance(e.target.value)} placeholder="Bouaké" />
            </Field>
            <Field label="Sexe">
              <FormSelect value={sexe} onChange={(e) => setSexe(e.target.value)}>
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
              </FormSelect>
            </Field>
            <Field label="Nationalité">
              <FormInput value={nationalite} onChange={(e) => setNationalite(e.target.value)} placeholder="Ivoirienne" />
            </Field>
          </div>
        </section>

        {/* Section Coordonnées */}
        <section>
          <h3 className={sectionLabel}>Coordonnées</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Téléphone" required>
              <FormInput value={telephone} onChange={(e) => setTelephone(e.target.value)} placeholder="+225 07 12 34 56" />
            </Field>
            <Field label="Email">
              <FormInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="aminata.kone@email.com" />
            </Field>
          </div>
        </section>

        {/* Section Pièce d'identité */}
        <section>
          <h3 className={sectionLabel}>Pièce d'identité</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Type de pièce">
              <FormSelect value={typePiece} onChange={(e) => setTypePiece(e.target.value)}>
                <option value="CNI">CNI</option>
                <option value="Passeport">Passeport</option>
              </FormSelect>
            </Field>
            <Field label="Numéro de pièce">
              <FormInput value={numPiece} onChange={(e) => setNumPiece(e.target.value)} placeholder="CNI-998877" />
            </Field>
          </div>
        </section>

        {/* Section Formation & cycle de vie */}
        <section>
          <h3 className={sectionLabel}>Formation & cycle de vie</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Type de permis">
              <FormSelect value={typePermis} onChange={(e) => setTypePermis(e.target.value)}>
                <option value="A">A — Moto</option>
                <option value="B">B — Voiture</option>
                <option value="AB">AB — Moto + Voiture</option>
                <option value="C">C — Poids lourd</option>
              </FormSelect>
            </Field>
            <Field label="Statut" required>
              <FormSelect value={statut} onChange={(e) => setStatut(e.target.value as StatutEleve)}>
                {STATUTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </FormSelect>
            </Field>
            <Field label="Moniteur assigné" className="sm:col-span-2">
              <FormInput value={moniteur} onChange={(e) => setMoniteur(e.target.value)} placeholder="Non assigné" />
            </Field>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Le statut permet de faire avancer l&apos;élève dans son cycle : Prospect → Inscrit → En formation → Examen → Admis/Ajourné → Terminé.
          </p>
        </section>
      </div>
    </Modal>
  )
}
