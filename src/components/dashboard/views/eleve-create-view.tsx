'use client'

import { useState } from 'react'
import { ArrowLeft, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { useDataStore } from '@/store/data-store'
import { useNavStore } from '@/store/nav-store'
import { inscrireEleveAvecFacture } from '@/lib/inscription'
import { parsePrixFcfa } from '@/lib/finance-utils'
import { ActionButton, Card } from './shared'
import { Field, FormInput, FormSelect } from '@/components/dashboard/modal'

const sectionLabel = 'text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4'

export function EleveCreateView() {
  const setActiveView = useNavStore((s) => s.setActiveView)
  const addEleve = useDataStore((s) => s.addEleve)
  const formations = useDataStore((s) => s.formations)
  const permis = useDataStore((s) => s.permis)

  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [dateNaissance, setDateNaissance] = useState('')
  const [lieuNaissance, setLieuNaissance] = useState('')
  const [sexe, setSexe] = useState('M')
  const [nationalite, setNationalite] = useState('Ivoirienne')
  const [telephone, setTelephone] = useState('')
  const [email, setEmail] = useState('')
  const [adresse, setAdresse] = useState('')
  const [typePiece, setTypePiece] = useState('CNI')
  const [numPiece, setNumPiece] = useState('')
  const [typePermis, setTypePermis] = useState('')
  const [formationId, setFormationId] = useState('')
  const [prixPermis, setPrixPermis] = useState('')
  const [parrain, setParrain] = useState('')

  const formationsActives = formations.filter((f) => f.actif)

  const handleSubmit = async () => {
    if (!nom.trim() || !prenom.trim() || !telephone.trim()) {
      toast.error('Veuillez renseigner le nom, le prénom et le téléphone')
      return
    }
    if (!typePermis) {
      toast.error('Veuillez sélectionner le type de permis de l\'élève')
      return
    }
    if (!formationId) {
      toast.error('Veuillez sélectionner une formation pour inscrire l\'élève')
      return
    }
    const tarif = parsePrixFcfa(prixPermis)
    if (tarif == null) {
      toast.error('Veuillez saisir le prix du permis (montant entier positif en FCFA)')
      return
    }
    const estParraine = parrain.trim() !== ''
    const newEleve = addEleve({
      nom: nom.trim(),
      prenom: prenom.trim(),
      telephone: telephone.trim(),
      email: email.trim(),
      adresse: adresse.trim(),
      dateNaissance,
      lieuNaissance: lieuNaissance.trim(),
      sexe,
      nationalite: nationalite.trim(),
      typePiece,
      numPiece: numPiece.trim(),
      typePermis,
      estParraine,
      parrainNom: parrain.trim(),
    })
    try {
      await inscrireEleveAvecFacture(useDataStore.getState(), newEleve.id, formationId, tarif)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Impossible de créer l\'élève')
      return
    }
    toast.success('Élève créé et facture émise automatiquement')
    // Naviguer vers la fiche du nouvel élève
    if (newEleve?.code) {
      useNavStore.getState().setSelectedEleveCode(newEleve.code)
      setActiveView('eleve-detail')
    } else {
      setActiveView('eleves')
    }
  }

  return (
    <div>
      {/* Back + actions */}
      <div className="mb-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={() => setActiveView('eleves')}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-input bg-background px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la liste
        </button>
        <ActionButton variant="primary" onClick={handleSubmit}>
          <UserPlus className="h-4 w-4" />
          Créer l&apos;élève
        </ActionButton>
      </div>

      {/* En-tête */}
      <Card className="mb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
            <UserPlus className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Ajouter un élève</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Renseignez les informations du nouvel apprenant
            </p>
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Téléphone" required>
              <FormInput value={telephone} onChange={(e) => setTelephone(e.target.value)} placeholder="+225 07 12 34 56" />
            </Field>
            <Field label="Email (optionnel)">
              <FormInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="aminata.kone@email.com" />
            </Field>
            <Field label="Adresse (optionnel)">
              <FormInput value={adresse} onChange={(e) => setAdresse(e.target.value)} placeholder="Cocody, Abidjan" />
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
                <option value="Consulaire">Carte consulaire</option>
              </FormSelect>
            </Field>
            <Field label="Numéro de pièce">
              <FormInput value={numPiece} onChange={(e) => setNumPiece(e.target.value)} placeholder="CNI-998877" />
            </Field>
          </div>
        </Card>

        {/* Section Formation */}
        <Card>
          <h3 className={sectionLabel}>Formation</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Type de permis" required>
              <FormSelect value={typePermis} onChange={(e) => setTypePermis(e.target.value)}>
                <option value="">Sélectionner un type de permis</option>
                {permis.map((p) => (
                  <option key={p.id} value={p.code}>{p.code} — {p.libelle}</option>
                ))}
              </FormSelect>
              {permis.length === 0 && (
                <p className="mt-1 text-xs text-warning">Aucun type de permis — créez-en dans Paramètres → Catalogue.</p>
              )}
            </Field>
            <Field label="Formation" required>
              <FormSelect value={formationId} onChange={(e) => setFormationId(e.target.value)}>
                <option value="">Sélectionner une formation</option>
                {formationsActives.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nom}
                  </option>
                ))}
              </FormSelect>
            </Field>
            <Field label="Prix du permis (FCFA)" required>
              <FormInput
                type="text"
                inputMode="numeric"
                value={prixPermis}
                onChange={(e) => setPrixPermis(e.target.value)}
                placeholder="150000"
              />
            </Field>
            <Field label="Parrainé par (optionnel)">
              <FormInput value={parrain} onChange={(e) => setParrain(e.target.value)} placeholder="Nom du parrain" />
            </Field>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Le code dossier est généré automatiquement. Le prix saisi est celui réellement facturé à cet élève ; le nombre de séances totales est calculé à partir du type de permis choisi.
          </p>
        </Card>

        {/* Actions footer */}
        <div className="flex items-center justify-end gap-3">
          <ActionButton variant="outline" onClick={() => setActiveView('eleves')}>
            Annuler
          </ActionButton>
          <ActionButton variant="primary" onClick={handleSubmit}>
            <UserPlus className="h-4 w-4" />
            Créer l&apos;élève
          </ActionButton>
        </div>
      </div>
    </div>
  )
}
