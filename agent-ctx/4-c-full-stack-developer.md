# Task ID: 4-c — Migration des vues vers le data-store + câblage boutons (PDF, WhatsApp, dialogs)

## Contexte lu
- Worklog.md consulté : Task ID 3 (phase CRUD) a posé `useDataStore` (Zustand) avec toutes les entités + actions add/update/delete. `utils-docs.ts` fournit `generateFacturePdf`, `generateBordereauPdf`, `relanceWhatsApp`, `messageRelanceFacture`.
- Les vues admin importent encore `eleves`, `moniteurs`, `vehicules`, `examens`, `examenSessions`, `factures`, `paiements`, `depenses` depuis `@/lib/mock-data`.
- 5 dialogs existants : nouvel-eleve, eleve-detail, nouvelle-seance, nouvelle-facture, saisie-resultats.
- 6 dialogs manquants (à créer par cette task puisque les vues y font référence) :
  - nouveau-moniteur-dialog
  - nouveau-vehicule-dialog
  - nouvelle-depense-dialog
  - nouvel-examen-dialog
  - nouvelle-session-dialog
  - nouveau-paiement-dialog (prend `factureId` prop)

## Plan
1. Créer les 6 dialogs manquants (intégration `useDataStore` + `toast` sonner).
2. Migrer les 7 vues (eleves, moniteurs, vehicules, comptabilite, examens, bordereaux, facturation) vers `useDataStore` et câbler boutons.
3. KPIs dérivés du store dans chaque vue.
4. Appender le récap dans worklog.md.

## Notes techniques
- `useDataStore(s => s.eleves)` abonne le composant → mutations rafraîchissent l'UI.
- Pour `facturation-view`, lookup eleve par `e.code === f.eleveCode` pour récupérer `telephone` (WhatsApp).
- Pour `bordereaux-view`, `generateBordereauPdf(sess)` sur bouton "Générer PDF".
- Pour `facturation-view`, ajouter bouton "Encaisser" → `NouveauPaiementDialog` avec `factureId`.

## Work Log
- Lu worklog.md (sections Task 3 / 4-a / 4-b) + data-store.ts + utils-docs.ts + les 7 vues cibles.
- Constaté que les 6 dialogs manquants n'étaient pas présents sur disque → créé chacun :
  - `nouveau-moniteur-dialog.tsx` (addMoniteur + toast, 6 champs)
  - `nouveau-vehicule-dialog.tsx` (addVehicule + toast, 4 champs)
  - `nouvelle-depense-dialog.tsx` (addDepense + toast, 6 champs, véhicule depuis store)
  - `nouvel-examen-dialog.tsx` (addExamen + toast, 7 champs, eleves/inspecteurs depuis store)
  - `nouvelle-session-dialog.tsx` (addExamenSession + toast, multi-select candidats via checkboxes)
  - `nouveau-paiement-dialog.tsx` (addPaiement + toast, useEffect setMontant(reste) à l'ouverture)
- Migré les 7 vues vers `useDataStore(s => s.X)` + KPIs dérivés + boutons câblés :
  - eleves-view : KPIs totalEleves/enFormation/admis, "Taux réussite" reste statique "78,5 %"
  - moniteurs-view : KPIs total/disponibles/enMission, bouton Ajouter câblé
  - vehicules-view : KPIs total/disponibles/enMaintenance, bouton Ajouter câblé
  - comptabilite-view : KPIs total/vehicules/salaires (filter+reduce), bouton Nouvelle dépense câblé
  - examens-view : sous-composants ExamensIndividuels/SessionsCollectives appellent useDataStore eux-mêmes, bouton Nouvel examen câblé
  - bordereaux-view : bouton Générer PDF → `generateBordereauPdf(sess)` + toast, bouton Nouvelle session câblé
  - facturation-view : KPIs CA/Encaissé/Attente/Impayées dérivés, boutons PDF (generateFacturePdf), Encaisser (NouveauPaiementDialog), WhatsApp (relanceWhatsApp + messageRelanceFacture avec lookup eleve par eleveCode pour le téléphone)
- Vérifié dev.log : compilation propre, GET / 200 OK, aucune erreur Module-not-found relative à mes fichiers.
- Append worklog.md avec entrée Task ID: 4-c complète.

## Stage Summary
- 6 dialogs créés + 7 vues migrées. Toutes les mutations CRUD rafraîchissent automatiquement l'UI via useDataStore. Tous les boutons d'action (Ajouter/Nouveau/PDF/WhatsApp/Encaisser) sont câblés.
