# Task 4-b — Missing CRUD Dialogs

**Agent**: full-stack-developer (missing CRUD dialogs)
**Task**: Create 6 missing CRUD dialogs wired to the Zustand data-store.

## Files created

All in `/home/z/my-project/src/components/dashboard/dialogs/`:

1. `nouveau-moniteur-dialog.tsx` → `NouveauMoniteurDialog({ open, onOpenChange })`
   - Size 'md'. Fields: Nom*, Prénom*, Téléphone*, Email, Spécialité* (Conduite/Code), Statut (Disponible/En mission/Absent, default Disponible).
   - Calls `addMoniteur({ nom, prenom, telephone, email, specialite, statut })` → `toast.success('Moniteur ajouté')`.

2. `nouveau-vehicule-dialog.tsx` → `NouveauVehiculeDialog({ open, onOpenChange })`
   - Size 'md'. Fields: Marque*, Modèle*, Immatriculation* (auto UPPER, mono), État (Disponible/En maintenance/En panne, default Disponible).
   - Calls `addVehicule({ marque, modele, immatriculation, etat })` → `toast.success('Véhicule ajouté')`.

3. `nouvelle-depense-dialog.tsx` → `NouvelleDepenseDialog({ open, onOpenChange })`
   - Size 'md'. Fields: Catégorie* (7 options), Mode de paiement (4 options), Montant* (number), Description* (input), Véhicule (only if catégorie ∈ Carburant/Entretien/Réparations), Date* (default today).
   - Véhicules loaded from `useDataStore(s => s.vehicules)`. Aperçu en direct formatXOF(montant).
   - Calls `addDepense({ categorie, montant, description, modePaiement, vehicule, date })` → `toast.success('Dépense enregistrée')`.

4. `nouveau-paiement-dialog.tsx` → `NouveauPaiementDialog({ factureId, open, onOpenChange })`
   - Size 'md'. Guard: `if (!factureId || !facture) return null`.
   - Bandeau info facture en haut (numéro mono, élève + code, montant total, reste à payer rose/emerald).
   - Fields: Montant* (default = reste via useEffect), Mode de paiement* (4 options), Référence* (mono), Date* (default today).
   - useEffect sur [open, factureId] pour reset et setMontant(facture.reste).
   - Calls `addPaiement({ factureId, eleve: facture.eleve, montant, modePaiement, reference, datePaiement })` → `toast.success('Paiement encaissé')`. Store auto-recomputes facture solde/statut.

5. `nouvel-examen-dialog.tsx` → `NouvelExamenDialog({ open, onOpenChange })`
   - Size 'md'. Fields: Élève* (select from store), Type d'examen* (Code/Conduite), Type de permis* (A/B/AB/C), Date*, Inspecteur (select from store inspecteurs actifs), Notes (textarea).
   - Resolves eleveCode → eleve name on submit, then `addExamen({ eleve, eleveCode, typeExamen, typePermis, dateExamen, inspecteur, resultat: 'En attente', notes })` → `toast.success('Examen planifié')`.

6. `nouvelle-session-dialog.tsx` → `NouvelleSessionDialog({ open, onOpenChange })`
   - Size 'lg'. Fields: Date*, Heure* (default 08:00), Centre* (input), Type d'examen* (Code/Conduite), Inspecteur (select), Véhicule (select from vehicules.filter(v => v.etat === 'Disponible'), only if Conduite, reset to '—' for Code).
   - Candidats*: multi-select checkbox list using shadcn `Checkbox`. Filter `eleves.filter(e => ['Inscrit', 'En formation', 'Examen'].includes(e.statut))`. `useState<string[]>` for selected codes. List scrollable max-h-72 with custom-scrollbar.
   - On submit: snapshots each selected eleve → `{ nomComplet: "Prénom Nom", identifiant: code, telephone, categoriePermis: eleve.typePermis, resultat: 'En attente' }` → `addExamenSession({ date, heure, centre, typeExamen, inspecteur, vehicule: type==='Conduite' ? vehicule : '—', candidats })` → `toast.success('Session créée')`. Store auto-génère le numeroBordereau.

## Patterns

- `'use client'` + NAMED export.
- Imports: `Modal, Field, FormInput, FormSelect, FormTextarea` from `@/components/dashboard/modal`, `useDataStore` from `@/store/data-store`, `toast` from `sonner`. Session also imports `Checkbox` from `@/components/ui/checkbox`. Depense/paiement import `formatXOF` from `@/components/dashboard/views/shared`.
- Footer à 2 boutons : Annuler (outline border-input bg-background) + Action primary (bg-primary text-primary-foreground, h-10 px-4 rounded-lg, with Lucide icon).
- Reset state on close via `handleOpenChange` wrapper (sauf paiement qui reset via useEffect à l'ouverture pour préserver l'animation).
- Grid responsive `grid-cols-1 → sm:grid-cols-2` (ou `lg:grid-cols-3` pour la session).
- Aperçus en direct bg-muted p-3 formatXOF() pour dépense + paiement.

## Notes

- Pas de lint/build lancé conformément aux consignes.
- Toutes les mutations passent par le data-store Zustand — 100% frontend, pas d'API ni DB.
- Les boutons "Ajouter/Nouveau" morts dans les vues admin peuvent maintenant être câblés vers ces dialogs par le task 4-c (orchestrateur).
