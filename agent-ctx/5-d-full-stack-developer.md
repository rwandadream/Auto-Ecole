# Task ID: 5-d — New modules (Inspecteurs + Audit log) + Paramètres CRUD + RBAC sidebar/header

## Contexte lu
- Worklog.md consulté (sections Task 1, 3, 4-c, 5). Le store Zustand `data-store.ts` a déjà le CRUD complet pour TOUS les entités (eleves, moniteurs, vehicules, formations, permis, inspecteurs, seances, examens, examenSessions, factures, paiements, depenses, profiles) + un `auditLog` auto-populé à chaque mutation (INSERT/UPDATE/DELETE, cap 200 entrées).
- `auth-store.ts` : admin login mappe 3 emails connus vers name/role ; fallback `name: email.split('@')[0], role: 'Administrateur'`.
- `parametres-view.tsx` importait statiquement `profiles, permis, formations` depuis mock-data et tous les boutons étaient no-ops.
- `sidebar.tsx` et `header.tsx` ne lisaient pas l'auth store → tous les items visibles par tous + hardcoded "Aïcha Diallo / Admin Principal / AD".
- `nav-store.ts` ViewKey n'incluait pas `inspecteurs` ni `audit`.

## Plan
1. Créer 4 nouveaux dialogs (nouvel-inspecteur, nouvel-utilisateur, formation, permis) — tous dual-purpose (create + edit) via prop id optionnelle.
2. Créer 2 nouvelles vues (inspecteurs-view, audit-log-view).
3. Migrer parametres-view vers le store + wire CRUD complet (DropdownMenu edit/delete + AlertDialog confirmation + inline ProfileEditDialog pour "Mon profil").
4. Ajouter RBAC au sidebar (propriété `roles?: string[]` par NavItem + filtrage par rôle du user courant) + ajouter les entrées Inspecteurs et Journal d'audit.
5. Câbler header au auth store (nom, rôle, initiales dynamiques).
6. Étendre ViewKey avec 'inspecteurs' | 'audit' + viewMap dans page.tsx.
7. Append worklog.md.

## Work Log
- Créé `nouvel-inspecteur-dialog.tsx` (dual-purpose via `inspecteurId?`, 5 champs, Switch pour actif).
- Créé `inspecteurs-view.tsx` : KPI row (Total/Actifs/Inactifs) + recherche + filtres statut + table avec DropdownMenu Modifier/Supprimer + AlertDialog.
- Créé `audit-log-view.tsx` : filtres (entité + action + recherche) + table avec badges colorés par action + `max-h-96 overflow-y-auto custom-scrollbar` + sticky header + état vide géré.
- Créé `nouvel-utilisateur-dialog.tsx` (dual-purpose via `profileId?`, 4 champs dont Rôle select).
- Créé `formation-dialog.tsx` (dual-purpose via `formationId?`, 4 champs, validation prix numérique).
- Créé `permis-dialog.tsx` (dual-purpose via `permisId?`, 2 champs, code select A/B/AB/C).
- Migré `parametres-view.tsx` vers le store. Ajout du composant inline `ProfileEditDialog` pour "Mon profil" (lit auth store, lookup profile par email → updateProfile ou addProfile). Alias `Field as ModalField` pour éviter le conflit avec le `ReadOnlyField` local. Tous les boutons CRUD câblés :
  - "Mon profil" Modifier → ProfileEditDialog → updateProfile/addProfile
  - "Équipe" Ajouter → NouvelUtilisateurDialog (create) ; DropdownMenu ligne → edit/delete
  - "Catalogue" Formations : bouton Nouvelle + Pencil/Trash par ligne → FormationDialog + AlertDialog
  - "Catalogue" Permis : bouton Nouveau + boutons edit/delete hover → PermisDialog + AlertDialog
- Mis à jour `sidebar.tsx` : import useAuthStore + Shield + History. Prop `roles?: string[]` sur NavItem. Entrées "Inspecteurs" (Shield) et "Journal d'audit" (History). Filtrage RBAC par rôle (normalisation 'Administrateur' → 'Administrateur principal'). Sections vides masquées.
- Mis à jour `header.tsx` : import useAuthStore + initials depuis shared. Nom/rôle/initiales dynamiques.
- Mis à jour `nav-store.ts` : ViewKey += 'inspecteurs' | 'audit'.
- Mis à jour `page.tsx` : imports + viewMap += inspecteurs, audit.
- Vérifié dev.log : compilation propre, GET / 200, aucune erreur.

## RBAC matrix implémentée
| Rôle | Items visibles |
|------|---------------|
| Administrateur principal | Tous (14) |
| Administrateur secondaire | Tous (14) |
| Comptable | Tableau de bord, Facturation, Comptabilité, Bordereaux, Assistance, Déconnexion (6) |
| Moniteur | Tableau de bord, Élèves, Scanner CNI, Moniteurs, Véhicules, Inspecteurs, Planning & Séances, Examens & Sessions, Bordereaux, Assistance, Déconnexion (11) |
| Conseiller | Tableau de bord, Élèves, Scanner CNI, Assistance, Déconnexion (5) |

## Stage Summary
- Files created: 6 (4 dialogs + 2 vues)
- Files modified: 5 (parametres-view, sidebar, header, nav-store, page.tsx)
- Tous les modules du cahier des charges désormais présents et câblés au store. RBAC opérationnel. Audit log se remplit automatiquement à chaque CRUD.
