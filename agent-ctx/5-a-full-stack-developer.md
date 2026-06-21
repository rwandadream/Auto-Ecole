# Task ID: 5-a — Agent full-stack-developer (data migration + dashboard)

## Contexte
Voir `/home/z/my-project/worklog.md` (sections Task 1 et Task 5) pour le contexte global.
Le store Zustand `/src/store/data-store.ts` expose toutes les entités en state réactif et tous les CRUD (add/update/delete).
Beaucoup de fichiers continuaient à importer depuis `@/lib/mock-data` → les modifications ne se propageaient pas. Dashboard KPIs hardcoded. Portail élève non réactif.

## Périmètre (ownership strict — 12 fichiers)

### Portail élève (4)
- `src/components/dashboard/views/student-dashboard-view.tsx` — migré `seances`, `eleves` vers `useDataStore`. Hooks placés AVANT l'early-return.
- `src/components/dashboard/views/student-planning-view.tsx` — migré `seances`.
- `src/components/dashboard/views/student-factures-view.tsx` — migré `factures`, `paiements`. `DownloadButton` réécrit pour appeler réellement `generateFacturePdf(f)` / `generateRecuPdf(p)` + toast `sonner`.
- `src/components/dashboard/views/student-profil-view.tsx` — migré `eleves` + `updateEleve`. Bouton « Enregistrer » cablé sur `updateEleve(me.id, {telephone, email, nationalite})` + `toast.success('Profil mis à jour')`.

### Dialogs (3)
- `src/components/dashboard/dialogs/eleve-detail-dialog.tsx` — `eleves`, `seances`, `examens`, `factures` lus depuis le store.
- `src/components/dashboard/dialogs/nouvelle-seance-dialog.tsx` — dropdowns `eleves`, `moniteurs`, `vehicules` migrés. `addSeance` déjà câblé.
- `src/components/dashboard/dialogs/nouvelle-facture-dialog.tsx` — dropdowns `eleves`, `formations` migrés. `addFacture` déjà câblé.

### Dashboard réactif (5)
- `src/components/dashboard/metric-cards.tsx` — 6 KPIs calculés en `useMemo` depuis `factures`, `depenses`, `eleves`, `examens`. Taux de réussite = `admis / (examens non "En attente")` avec gestion div/0.
- `src/components/dashboard/unpaid-invoices.tsx` — factures filtrées (`statut === 'Impayée' || 'Non payée'`), téléphone résolu via `eleves.find(e => e.code === f.eleveCode)`. Bouton WhatsApp → `relanceWhatsApp(tel, messageRelanceFacture({...}))`. « Tout relancer » itère avec `setTimeout(idx * 400ms)`. Total dynamique.
- `src/components/dashboard/recent-orders.tsx` — `useDataStore(s => s.eleves)` mappé vers Row shape. Tri par `dateInscription` desc. Recherche par nom/code (toggle input). Tri toggle asc/desc. Pagination 7/page avec Précédent/Suivant + indicateur "Page X / Y".
- `src/components/dashboard/revenue-analytics.tsx` — fenêtre 7 derniers jours (TODAY=2026-12-02). Chaque jour → somme `paiements.montant` (date parsée FR). Peak indicator dynamique. Axe Y dynamique.
- `src/components/dashboard/total-income.tsx` — 12 mois pour 2026. `revenus` depuis `paiements`, `depenses` depuis `depenses`. Stacked bar chart conservé.

## Décisions techniques
- **Types StatutEleve etc.** : restent importés de `@/lib/mock-data` car le store ne les ré-exporte pas. Purement typographique, aucune valeur runtime.
- **Hooks avant early-return** : tous les `useDataStore` sont appelés avant `if (!user || user.mode !== 'eleve') return null` pour respecter les règles des hooks React.
- **Parsing dates FR** : fonction `parseFrDate` partagée (dans chaque fichier pour éviter d'ajouter une dépendance) — mappe "29 Nov 2026" → Date. Gestion des mois accentués ('Fév', 'Août', 'Déc').
- **TODAY = 2026-12-02** : aligné sur `student-dashboard-view.tsx` pour rester cohérent avec les données mock.
- **PDF try/catch** : `DownloadButton` wrap `generateFacturePdf` dans try/catch + toast erreur en cas d'échec.
- **Pagination recent-orders** : 7 par page (conserve la taille historique), `Math.min(page, totalPages - 1)` pour éviter page hors-borne après filtrage.
- **Pas de lint ni build** lancés (conforme aux consignes). `tail dev.log` → compilations OK.

## Reste à faire (hors périmètre 5-a)
- Les autres agents (5-b, 5-c, 5-d) traitent en parallèle : planning migration, scanner CNI wiring, edit/delete dropdowns, modules inspecteurs/audit/parametres/RBAC.
- Aucun conflit de fichier attendu car périmètres strictement partitionnés.
