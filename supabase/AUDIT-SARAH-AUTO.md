# Audit Supabase — SARAH AUTO

**Projet** : `myzgspejgqzvmbuqqwks`  
**Date** : 22 juin 2026  
**Méthode** : skills `supabase` + `supabase-postgres-best-practices`, MCP `get_advisors`, `list_tables`, `get_logs`, revue statique SQL + couche Next.js  
**Périmètre** : rapport initial ; correctifs appliqués via migrations 017–018 (juin 2026)

---

## 1. Résumé exécutif

| Indicateur | Valeur |
|---|---|
| Tables `public` avec RLS | **17/17** (100 %) |
| Findings MCP sécurité ERROR | **1** |
| Findings MCP sécurité WARN | **~35** (RPC DEFINER + search_path + Auth) |
| Score global estimé | **Moyen** — base saine pour un ERP interne, mais plusieurs écarts skill Supabase |

### Top 3 risques

1. **Vue `eleves_solde` en SECURITY DEFINER** — bypass RLS confirmé par le linter Supabase (ERROR).
2. **RPC sensibles appelables en `anon`** — `create_staff_user`, `delete_eleve`, etc. exposées via `/rest/v1/rpc/*` sans `REVOKE` explicite du rôle `anon` (WARN MCP × 14).
3. **RLS trop permissive + audit log falsifiable** — tout staff authentifié lit factures/paiements ; tout authentifié peut INSERT dans `audit_log` sans contrôle `user_id`.

---

## 2. Findings MCP (production)

### 2.1 Sécurité — ERROR

| Lint | Détail | Remédiation |
|---|---|---|
| [security_definer_view](https://supabase.com/docs/guides/database/database-linter?lint=0010_security_definer_view) | Vue `public.eleves_solde` définie avec SECURITY DEFINER (bypass RLS des tables sous-jacentes) | Recréer avec `CREATE VIEW ... WITH (security_invoker = true)` |

### 2.2 Sécurité — WARN (sélection)

| Lint | Détail | Remédiation |
|---|---|---|
| [function_search_path_mutable](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable) | `is_admin()`, `handle_new_user()` sans `SET search_path` | Ajouter `SET search_path = public` (ou schéma privé) |
| [anon_security_definer_function_executable](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable) | 14 fonctions DEFINER appelables par `anon` | `REVOKE EXECUTE ON FUNCTION ... FROM anon` + ne garder que les RPC publiques voulues |
| [authenticated_security_definer_function_executable](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable) | Mêmes RPC aussi pour `authenticated` (attendu, mais à durcir) | Vérifier garde `is_admin()` dans le corps ; restreindre EXECUTE si possible |
| [auth_leaked_password_protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection) | Protection mots de passe compromis (HaveIBeenPwned) désactivée | Activer dans Dashboard Auth |

**Fonctions DEFINER signalées (anon + authenticated)** :  
`create_staff_user`, `delete_eleve`, `delete_staff_user`, `enregistrer_paiement`, `get_eleve_portail_data`, `handle_new_user`, `inscrire_eleve`, `is_admin`, `is_comptable_or_admin`, `login_eleve_portail`, `update_eleve_seances_count`, `update_facture_statut_after_paiement`, `update_staff_user`.

### 2.3 Performance — WARN / INFO

| Catégorie | Count | Exemples |
|---|---|---|
| [auth_rls_initplan](https://supabase.com/docs/guides/database/database-linter?lint=0003_auth_rls_initplan) | ~18 policies | `auth.uid()` / `auth.role()` sans `(select ...)` |
| [multiple_permissive_policies](https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies) | ~60 | Doublon « Staff can view » + « Admins can manage » sur SELECT |
| [unindexed_foreign_keys](https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys) | 9 FK | `depenses.utilisateur_id`, `eleves.permis_id`, `seances.vehicule_id`, etc. |
| [unused_index](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index) | ~15 | Index migration 006 pas encore utilisés (normal en dev) |

### 2.4 Logs Auth (24 h)

| Sévérité | Observation |
|---|---|
| ERROR | `confirmation_token: converting NULL to string is unsupported` sur `/token` — utilisateurs Auth insérés manuellement avec champs NULL (seed / RPC `create_staff_user`) |
| INFO | Tentatives login échouées (`invalid_credentials`) — comportement normal |
| INFO | Logins/logouts réussis depuis `localhost:3000` |

---

## 3. Schéma live vs migrations

`list_tables` confirme **17 tables** `public` avec **RLS activé** :

`profiles`, `permis`, `inspecteurs`, `moniteurs`, `vehicules`, `eleves`, `formations`, `inscriptions`, `examens`, `seances`, `factures`, `paiements`, `depenses`, `audit_log`, `examen_sessions`, `examen_session_eleves`, `faq_items`

Vue (non listée comme table) : `eleves_solde` — présente en SQL migration 003.

Alignement avec [`supabase/README.md`](README.md) : **OK** (ordre migrations 1–16 cohérent avec le schéma distant).

---

## 4. Sécurité — revue statique SQL

### 4.1 Critique

| ID | Finding | Fichier | Recommandation |
|---|---|---|---|
| C1 | Vue `eleves_solde` sans `security_invoker` | `20260621000003_audit_fixes.sql` L45 | `CREATE OR REPLACE VIEW public.eleves_solde WITH (security_invoker = true) AS ...` |
| C2 | RPC DEFINER exposées à `anon` (MCP confirmé) | Plusieurs migrations | `REVOKE EXECUTE FROM anon` sur toutes les RPC sauf `login_eleve_portail` / `get_eleve_portail_data` ; pour celles-ci, ajouter rate limiting côté Supabase |

**Note skill** : `REVOKE ALL FROM PUBLIC` ne suffit pas toujours — Supabase expose les RPC via PostgREST ; le linter détecte que `anon` peut encore invoquer les endpoints. Révoquer explicitement `anon` sur les RPC admin.

### 4.2 Haute

| ID | Finding | Fichier | Recommandation |
|---|---|---|---|
| H1 | SELECT `factures` / `paiements` ouvert à **tout** staff authentifié | `20260621000006_security_rls_perf_fixes.sql` | Policy par rôle (`is_comptable_or_admin()` ou liste de rôles) si moniteurs/conseillers ne doivent pas voir les finances |
| H2 | INSERT `audit_log` sans restriction | migration 006 L15–17 | `WITH CHECK (user_id = (select auth.uid()) AND ...)` ou réservé aux rôles autorisés |
| H3 | Portail élève : auth par code + téléphone (pas JWT) | `login_eleve_portail`, `get_eleve_portail_data` | Rate limit, lockout après N essais ; éviter brute-force sur `anon` |
| H4 | `create_staff_user` insère dans `auth.users` | `20260622000007_create_staff_user_rpc.sql` | Utiliser l'API Admin Auth ou garantir tous les champs non-NULL requis par GoTrue (cf. logs ERROR) |
| H5 | Mots de passe seed documentés (`Sarah2026!`) | `README.md`, seeds | Rotation obligatoire avant production ; hors scope correction auto |

### 4.3 Moyenne

| ID | Finding | Fichier | Recommandation |
|---|---|---|---|
| M1 | `auth.role() = 'authenticated'` (déprécié skill) | `20240615000000_init.sql`, migrations 003/006 | Remplacer par `TO authenticated` + prédicat métier |
| M2 | `TO authenticated` sans autorisation par rôle (BOLA interne) | Policies « Staff can view * » | Modèle ERP : acceptable si **tout le staff** doit tout lire ; sinon policies par `profiles.role` |
| M3 | Policies UPDATE sans `WITH CHECK` explicite | `profiles`, `storage.objects` (UPDATE OK) | Vérifier qu'aucun UPDATE ne permet de réassigner `user_id` / ownership |
| M4 | `is_admin()` SECURITY DEFINER sans `search_path` | `20240615000000_init.sql` L524 | `SET search_path = public` |
| M5 | `handle_new_user` lit `raw_user_meta_data` pour le nom | init L628 | **OK** pour affichage ; ne **jamais** utiliser pour autorisation (skill respecté) |
| M6 | Triggers internes (`update_eleve_seances_count`) exposés comme RPC | init / fixes | `REVOKE EXECUTE` — ne doivent pas être appelables via API |

### 4.4 Basse

| ID | Finding | Recommandation |
|---|---|---|
| B1 | Storage : pas de restriction par dossier utilisateur | Acceptable ERP (staff partagé) ; isoler par préfixe path si besoin |
| B2 | Realtime sur `seances`, `factures`, `paiements` | Vérifier que RLS filtre bien les événements par rôle |
| B3 | Doublons policies SELECT (perf) | Fusionner en une policy par action avec `OR` |

---

## 5. Couche application (Next.js)

| Check | Statut | Détail |
|---|---|---|
| Pas de `service_role` côté client | **OK** | Seulement `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` |
| API admin users | **OK** | [`src/app/api/admin/users/route.ts`](../src/app/api/admin/users/route.ts) — `getUser()` + vérif profil admin avant RPC |
| Client browser | **OK** | `@supabase/ssr` + publishable key |
| `restoreSupabaseSession` | **WARN** | [`auth-store.ts`](../src/store/auth-store.ts) L131 — `getSession()` au lieu de `getUser()` (skill : session locale non validée serveur) |
| Repositories | **MIXTE** | Mutations directes `.from().insert/update/delete` pour entités métier ; RPC pour transactions (`inscrire_eleve`, `enregistrer_paiement`, `delete_eleve`) — cohérent mais dépend fortement de RLS |
| Portail élève | **OK** | Pas de session Supabase Auth ; RPC `login_eleve_portail` + state Zustand local |

**Mutations directes sensibles** (repos) : suppression élève/moniteur/véhicule/facture via `.delete()` — protégées par RLS admin-only en théorie, mais un compte staff compromis avec policy « view all » ne devrait pas pouvoir DELETE sauf si policy admin l'autorise.

---

## 6. Performance Postgres

### 6.1 Index FK manquants (MCP + skill `schema-foreign-key-indexes`)

| Table | FK non indexée |
|---|---|
| `depenses` | `utilisateur_id` |
| `eleves` | `inspecteur_id`, `permis_id` |
| `examen_sessions` | `created_by`, `inspecteur_id`, `vehicule_id` |
| `examens` | `formation_id` |
| `factures` | `inscription_id` |
| `seances` | `vehicule_id` |

Migration 006 a ajouté plusieurs index ; ceux-ci restent ouverts.

### 6.2 RLS performance (skill `security-rls-performance`)

- Remplacer `auth.uid()` par `(select auth.uid())` dans toutes les policies.
- Remplacer `auth.role()` par `(select auth.role())` ou supprimer au profit de `TO authenticated`.
- Réduire le nombre de policies permissives dupliquées (admin + staff sur même action).

### 6.3 Connexions

- Pas de pool custom côté app (client Supabase JS direct) — **OK** pour ce volume ; Supabase gère le pooling (pgBouncer visible dans les logs).

---

## 7. Checklist skill Supabase

| Règle | Statut |
|---|---|
| RLS activé sur tables exposées | **OK** |
| Pas de `user_metadata` pour autorisation | **OK** |
| Pas de `service_role` en client | **OK** |
| Vues avec `security_invoker` | **NON** |
| UPDATE policies avec `WITH CHECK` | **Partiel** |
| `auth.role()` évité | **NON** |
| RPC DEFINER : REVOKE + garde auth | **Partiel** (garde OK, REVOKE anon incomplet) |
| Storage upsert = INSERT+SELECT+UPDATE | **OK** |
| Leaked password protection Auth | **NON** |
| Advisors relancés après DDL | **OK** (cet audit) |

---

## 8. Recommandations priorisées (sans implémentation)

### Priorité 1 — Avant production

1. Corriger `eleves_solde` → `security_invoker = true`.
2. `REVOKE EXECUTE FROM anon` sur toutes les RPC admin ; ne laisser `anon` que sur `login_eleve_portail` (+ éventuellement `get_eleve_portail_data`).
3. Restreindre INSERT `audit_log` (user_id = auth.uid(), rôles autorisés).
4. Activer leaked password protection dans Auth.
5. Corriger les inserts `auth.users` (tokens NULL) dans seeds et `create_staff_user`.
6. Rotation des mots de passe seed.

### Priorité 2 — Durcissement ERP

7. Policies factures/paiements par rôle métier (admin + comptable seulement en écriture ; lecture selon besoin métier).
8. Remplacer `auth.role()` par `TO authenticated` + helpers `(select auth.uid())`.
9. `SET search_path` sur `is_admin()` et `handle_new_user()`.

### Priorité 3 — Performance / maintenance

10. Index FK restants (9 colonnes MCP).
11. Fusion policies SELECT dupliquées.
12. Remplacer `getSession()` par `getUser()` dans `auth-store.ts`.

---

## 9. Conformité globale

| Domaine | Note |
|---|---|
| RLS présence | Bon |
| RLS granularité | Moyen (ERP « tout staff voit tout ») |
| RPC / DEFINER | Moyen-faible (exposition anon) |
| Auth / secrets | Bon côté app ; faible côté seeds |
| Performance | Bon à ce volume ; optimisations RLS/index à prévoir à l'échelle |

**Conclusion** : L'architecture Supabase-first est cohérente pour SARAH AUTO. Les écarts principaux sont documentés par le linter Supabase et alignés avec la checklist du skill officiel. Les corrections prioritaires sont ciblées (vue, REVOKE anon, audit log, Auth hardening) et n'impliquent pas de refonte applicative.
