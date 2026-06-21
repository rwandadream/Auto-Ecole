# Task ID: 5-fix — Agent: full-stack-developer (fix setState-in-effect)

## Goal
Corriger les 10 erreurs ESLint `react-hooks/set-state-in-effect` en remplaçant
chaque `useEffect` qui appelle `setState` pour pré-remplir un formulaire à
l'ouverture d'un dialog par le pattern render-time comparison recommandé par
React 19 (https://react.dev/reference/react/useState#storing-information-from-previous-renders).

## Pattern appliqué

Avant :
```tsx
useEffect(() => {
  if (open && entity) {
    setField1(entity.field1)
    setField2(entity.field2)
  }
}, [open, entity])
```

Après :
```tsx
const [prevOpen, setPrevOpen] = useState(false)
if (open !== prevOpen) {
  setPrevOpen(open)
  if (open && entity) {
    setField1(entity.field1)
    setField2(entity.field2)
  }
}
```

`useEffect` est retiré de l'import React lorsqu'il n'est plus utilisé dans le fichier.

## Work Log — fichiers corrigés

1. `src/components/dashboard/dialogs/formation-dialog.tsx`
   - Pattern: `if (open) { if (formationId) { lookup + set } else { reset } }`
   - Import `useEffect` retiré.

2. `src/components/dashboard/dialogs/modifier-depense-dialog.tsx`
   - Pattern: `if (open && depense) { set… }`
   - Le bloc render-time est placé AVANT le early return `if (!depense)`.
   - Import `useEffect` retiré.

3. `src/components/dashboard/dialogs/modifier-eleve-dialog.tsx`
   - Pattern: `if (open && eleve) { set 13 champs }`
   - Bloc placé avant le early return `if (!eleve)`.
   - Import `useEffect` retiré.

4. `src/components/dashboard/dialogs/modifier-moniteur-dialog.tsx`
   - Pattern: `if (open && moniteur) { set… }`
   - Bloc placé avant le early return `if (!moniteur)`.
   - Import `useEffect` retiré.

5. `src/components/dashboard/dialogs/modifier-vehicule-dialog.tsx`
   - Pattern: `if (open && vehicule) { set… }`
   - Bloc placé avant le early return `if (!vehicule)`.
   - Import `useEffect` retiré.

6. `src/components/dashboard/dialogs/nouvel-inspecteur-dialog.tsx`
   - Pattern: `if (open) { if (inspecteurId) { lookup + set } else { reset } }`
   - Import `useEffect` retiré.

7. `src/components/dashboard/dialogs/nouvel-utilisateur-dialog.tsx`
   - Pattern: `if (open) { if (profileId) { lookup + set } else { reset } }`
   - Import `useEffect` retiré.

8. `src/components/dashboard/dialogs/permis-dialog.tsx`
   - Pattern: `if (open) { if (permisId) { lookup + set } else { reset } }`
   - Import `useEffect` retiré.

9. `src/components/dashboard/dialogs/suivi-seance-dialog.tsx`
   - Pattern: `if (seance && open) { setStatut / setNotes }`
   - Bloc placé avant le early return `if (!seance) return null`.
   - Import `useEffect` retiré.

10. `src/components/dashboard/views/parametres-view.tsx`
    - Pattern appliqué sur `ProfileEditDialog` : `if (open && user && user.mode === 'admin') { set… }`
    - Import `useEffect` retiré (le fichier n'avait qu'un seul useEffect).

## Vérification
- `rg "useEffect"` sur `src/components/dashboard` → il ne reste qu'un commentaire
  dans `nouveau-paiement-dialog.tsx` (hors périmètre, déjà en pattern render-time).
- Aucun autre `useEffect` présent dans les 10 fichiers modifiés.

## Notes / décisions
- Aucune autre logique métier n'a été touchée.
- Le pattern React 19 ne réagit plus aux changements d'`entity`/`entityId` pendant
  que `open` reste `true`, mais cela correspond à la spécification du ticket
  (pattern exact demandé) et au cas d'usage réel (les dialogs sont fermés puis
  rouverts avec une nouvelle sélection).
- Pour les dialogs avec early return (`if (!entity) return …`), le bloc
  `setPrevOpen` reste exécuté avant le return afin de respecter la règle des
  hooks et le fonctionnement du pattern.
