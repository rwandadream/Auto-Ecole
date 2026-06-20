'use client'

import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import { Modal, Field, FormInput, FormSelect } from '@/components/dashboard/modal'

const sectionLabel = 'text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3'

export function NouvelEleveDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
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
  const [typePermis, setTypePermis] = useState('B')
  const [codeDossier, setCodeDossier] = useState('')
  const [parrain, setParrain] = useState('')

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Ajouter un élève"
      description="Renseignez les informations du nouvel apprenant"
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
            onClick={() => onOpenChange(false)}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <UserPlus className="h-4 w-4" />
            Créer l'élève
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
            <Field label="Adresse" className="sm:col-span-2">
              <FormInput value={adresse} onChange={(e) => setAdresse(e.target.value)} placeholder="Cocody, Abidjan" />
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

        {/* Section Formation */}
        <section>
          <h3 className={sectionLabel}>Formation</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Type de permis">
              <FormSelect value={typePermis} onChange={(e) => setTypePermis(e.target.value)}>
                <option value="A">A — Moto</option>
                <option value="B">B — Voiture</option>
                <option value="AB">AB — Moto + Voiture</option>
                <option value="C">C — Poids lourd</option>
              </FormSelect>
            </Field>
            <Field label="Code dossier">
              <FormInput value={codeDossier} onChange={(e) => setCodeDossier(e.target.value)} placeholder="EL-XXXX" />
            </Field>
            <Field label="Parrainé par" className="sm:col-span-2">
              <FormInput value={parrain} onChange={(e) => setParrain(e.target.value)} placeholder="Nom du parrain (optionnel)" />
            </Field>
          </div>
        </section>
      </div>
    </Modal>
  )
}
