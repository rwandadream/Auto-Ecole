# Task ID: 5-b — Planning + Workflows (Scanner CNI, Session résultats, Suivi pédagogique)

**Agent**: full-stack-developer (planning + workflows)
**Task**: Migrer planning + scanner CNI + workflow session résultats + suivi pédagogique

## Contexte lu
- `worklog.md` (Task 1 → 5) : store Zustand `data-store.ts` expose toutes les entités + actions CRUD. `nav-store.ts` expose `setActiveView(view: ViewKey)`.
- `agent-ctx/4-b` + `4-c` : 6 dialogs CRUD créés + 7 vues migrées vers le store.
- Vues cibles encore sur mock-data : `planning-view.tsx` (importait `seances` directement).
- Boutons morts identifiés : "Créer l'élève" du scanner CNI (pas de onClick), "Actions" du planning (no-op), saisie des résultats qui ne cascade pas vers `eleves.statut` ni `examens`.

## Files modified/created

### 1. CREATED — `/src/components/dashboard/dialogs/suivi-seance-dialog.tsx`
- `SuiviSeanceDialog({ seance, open, onOpenChange })` — guard `if (!seance) return null`.
- Bandeau infos séance (élève / moniteur / véhicule / horaire) + FormSelect Statut (Effectué / Absent élève / Annulé / Planifié) + FormTextarea Notes.
- `useEffect` sur `[seance, open]` sync le formulaire avec les valeurs courantes (statut + notes).
- Submit : `updateSeance(seance.id, { statut, notes })` puis, si `statut === 'Effectué'` et `previousStatut !== 'Effectué'`, lookup `eleves.find(e => e.code === seance.eleveCode)` → `updateEleve(eleve.id, { seancesFaites: eleve.seancesFaites + 1 })`. Décrémente symétriquement si on quitte "Effectué".
- Toast `success('Suivi enregistré')` puis fermeture.

### 2. MODIFIED — `/src/components/dashboard/views/planning-view.tsx`
- Remplacé `import { seances }` par `const seances = useDataStore(s => s.seances)`. Type `StatutSeance` conservé depuis `@/lib/mock-data`, type `Seance` depuis `@/store/data-store`.
- KPIs dynamiques : Total = `seances.length` ; Effectuées = `filter('Effectué').length` ; Planifiées = `filter('Planifié').length` ; Annulées/Absences = `filter(s => s.statut === 'Annulé' || s.statut === 'Absent élève').length`.
- Bouton "Actions" par ligne → `DropdownMenu` (shadcn) avec 2 `DropdownMenuItem` :
  - "Suivi pédagogique" (ClipboardCheck) → `setSuiviSeance(s); setShowSuivi(true)`.
  - "Supprimer" (Trash2, classe `text-rose-600`) → `setToDelete(s)`.
- `AlertDialog` de confirmation : titre + description contextuelle (date + horaire + élève), `AlertDialogCancel` + `AlertDialogAction` (bg-rose-600) → `deleteSeance(toDelete.id); setToDelete(null)`.
- State local : `suiviSeance`, `showSuivi`, `toDelete`.
- Imports ajoutés : `useDataStore`, `type Seance`, `SuiviSeanceDialog`, `DropdownMenu*`, `AlertDialog*`, icônes `ClipboardCheck`, `Trash2`.

### 3. MODIFIED — `/src/components/dashboard/views/scanner-cni-view.tsx`
- Imports : `toast` (sonner), `useDataStore`, `useNavStore`.
- Hooks : `addEleve`, `setActiveView`.
- `resetScan()` étendu pour remettre à zéro telephone/email/nationalite/typePermis/typePiece.
- `handleCreerEleve` :
  - Validation : si `!nom || !prenom || !telephone` → `toast.error('Veuillez renseigner au moins le nom, le prénom et le téléphone')`.
  - `addEleve({ nom, prenom, telephone, email, dateNaissance, nationalite: nationalite || 'Ivoirienne', typePiece, numPiece, typePermis })`.
  - `toast.success('Élève créé avec succès')` → `resetScan()` → `setActiveView('eleves')`.
- Bouton "Créer l'élève" : `onClick={handleCreerEleve}` (était no-op avant).

### 4. MODIFIED — `/src/components/dashboard/dialogs/saisie-resultats-dialog.tsx`
- Imports étendus : `type Eleve`, `type Examen` depuis `@/store/data-store`.
- Hooks supplémentaires : `updateEleve`, `addExamen`, `eleves` depuis `useDataStore`.
- `handleSave` conserve `updateSessionResultats(session.id, candidats)` puis boucle sur chaque candidat dont `resultat !== 'En attente'` :
  - `const eleve = eleves.find(e => e.code === c.identifiant)`.
  - `updateEleve(eleve.id, { statut: c.resultat === 'Admis' ? 'Admis' : 'Ajourné' })`.
  - `addExamen({ eleve: c.nomComplet, eleveCode: c.identifiant, typeExamen: session.typeExamen, typePermis: c.categoriePermis, dateExamen: session.date, inspecteur: session.inspecteur, resultat: c.resultat, notes: c.notes || '' })`.
  - Compteur `updatedCount` incrémenté.
- Toast final : `Résultats enregistrés — N élève(s) mis à jour` (singulier/pluriel gérés).

## Patterns respectés
- `'use client'` + NAMED export.
- `Modal` / `Field` / `FormSelect` / `FormTextarea` depuis `@/components/dashboard/modal`.
- `toast` depuis `sonner`. `useDataStore(s => s.X)` pour abonnement réactif.
- Footer 2 boutons : Annuler (outline) + Action primary (bg-primary text-primary-foreground).
- shadcn `DropdownMenu` + `AlertDialog` (composants radix existants dans `/src/components/ui/`).
- Design system : primary orange (`bg-primary`, `text-primary`), pas d'indigo/blue.

## Notes
- Pas de lint/build lancé conformément aux consignes.
- Dev server compile proprement (dev.log : `✓ Compiled in Xms` récurrents, `GET / 200`).
- Toutes les mutations passent par le store Zustand — l'UI se rafraîchit automatiquement (KPIs, listes, badges de statut).
- Le workflow session résultats cascade désormais vers 2 entités : `eleves.statut` (Admis/Ajourné) + `examens` (enregistrement individuel visible dans la vue Examens).
