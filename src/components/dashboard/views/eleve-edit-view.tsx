'use client'

import { useState } from 'react'
import { ArrowLeft, Save, User, Phone, Mail, CreditCard, Car, Calendar, MapPin, Award } from 'lucide-react'
import { toast } from 'sonner'
import { useDataStore } from '@/store/data-store'
import { useNavStore } from '@/store/nav-store'
import { ViewHeader, ActionButton, Card, StatusBadge, initials, statutEleveTone } from './shared'
import { Field, FormInput, FormSelect } from '@/components/dashboard/modal'
import type { StatutEleve } from '@/lib/mock-data'

const sectionLabel = 'text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4'

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

export function EleveEditView({ eleveCode }: { eleveCode: string }) {
  const setActiveView = useNavStore((s) => s.setActiveView)
  const eleve = useDataStore((s) => s.eleves).find((e) => e.code === eleveCode)
  const updateEleve = useDataStore((s) => s.updateEleve)

  const [nom, setNom] = useState(eleve?.nom ?? '')
  const [prenom, setPrenom] = useState(eleve?.prenom ?? '')
  const [dateNaissance, setDateNaissance] = useState(eleve?.dateNaissance ?? '')
  const [lieuNaissance, setLieuNaissance] = useState(eleve?.lieuNaissance ?? '')
  const [sexe, setSexe] = useState(eleve?.sexe ?? 'M')
  const [nationalite, setNationalite] = useState(eleve?.nationalite ?? 'Ivoirienne')
  const [telephone, setTelephone] = useState(eleve?.telephone ?? '')
  const [email, setEmail] = useState(eleve?.email ?? '')
  const [typePiece, setTypePiece] = useState(eleve?.typePiece ?? 'CNI')
  const [numPiece, setNumPiece] = useState(eleve?.numPiece ?? '')
  const [typePermis, setTypePermis] = useState(eleve?.typePermis ?? 'B')
  const [statut, setStatut] = useState<StatutEleve>(eleve?.statut ?? 'Prospect')
  const [moniteur, setMoniteur] = useState(eleve?.moniteur ?? 'Non assigné')

  if (!eleve) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-sm text-muted-foreground">Aucun élève trouvé.</p>
        <ActionButton variant="outline" onClick={() => setActiveView('eleves')}>
          <ArrowLeft className="h-4 w-4" />
          Retour à la liste
        </ActionButton>
      </div>
    )
  }

  const nomComplet = `${eleve.prenom} ${eleve.nom}`

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
    setActiveView('eleve-detail')
  }

  return (
    <div>
      {/* Back + actions */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => setActiveView('eleve-detail')}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-input bg-background px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la fiche
        </button>
        <ActionButton variant="primary" onClick={handleSubmit}>
          <Save className="h-4 w-4" />
          Enregistrer
        </ActionButton>
      </div>

      {/* En-tête */}
      <Card className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-2xl font-bold text-primary">
            {initials(nomComplet)}
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">Modifier l&apos;élève</h1>
              <StatusBadge label={eleve.statut} tone={statutEleveTone[eleve.statut]} />
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="font-mono text-foreground">{eleve.code}</span>
              <span>·</span>
              <span>{nomComplet}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Formulaire */}
      <div className="space-y-6">
        {/* Section Identité */}
        <Card>
          <h3 className={sectionLabel}>Identité</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
        </Card>

        {/* Section Coordonnées */}
        <Card>
          <h3 className={sectionLabel}>Coordonnées</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Téléphone" required>
              <FormInput value={telephone} onChange={(e) => setTelephone(e.target.value)} placeholder="+225 07 12 34 56" />
            </Field>
            <Field label="Email">
              <FormInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="aminata.kone@email.com" />
            </Field>
          </div>
        </Card>

        {/* Section Pièce d'identité */}
        <Card>
          <h3 className={sectionLabel}>Pièce d&apos;identité</h3>
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
        </Card>

        {/* Section Formation & cycle de vie */}
        <Card>
          <h3 className={sectionLabel}>Formation &amp; cycle de vie</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
            <Field label="Moniteur assigné">
              <FormInput value={moniteur} onChange={(e) => setMoniteur(e.target.value)} placeholder="Non assigné" />
            </Field>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Le statut permet de faire avancer l&apos;élève dans son cycle : Prospect → Inscrit → En formation → Examen → Admis/Ajourné → Terminé.
          </p>
        </Card>

        {/* Actions footer */}
        <div className="flex items-center justify-end gap-3">
          <ActionButton variant="outline" onClick={() => setActiveView('eleve-detail')}>
            Annuler
          </ActionButton>
          <ActionButton variant="primary" onClick={handleSubmit}>
            <Save className="h-4 w-4" />
            Enregistrer les modifications
          </ActionButton>
        </div>
      </div>
    </div>
  )
}
