# Supabase — SARAH AUTO

Projet : **myzgspejgqzvmbuqqwks**

## Fichiers SQL (sans dossier migrations)

Exécutez **dans cet ordre** via le SQL Editor Supabase ou le MCP :

| Ordre | Fichier | Contenu |
|-------|---------|---------|
| 1 | `20240615000000_init.sql` | Schéma complet + RLS + trigger auth |
| 2 | `20240615000001_fixes.sql` | Colonnes UI + RPC portail élève |
| 3 | `20260615000002_bordereaux.sql` | Sessions d'examen & bordereaux |
| 4 | `20260621000003_audit_fixes.sql` | Colonnes élèves, index, RLS bordereaux, RPCs transactionnelles |
| 5 | `20260621000005_seed_reference_data.sql` | Jeu de données métier de référence (élèves EL-2401→2410, factures, séances, etc.) |
| 6 | `20260621000006_security_rls_perf_fixes.sql` | Correctifs RLS et performance |
| 7 | `seed_admin.sql` | Compte admin `admin@sarahauto.ci` (si absent) |
| 8 | `20260622000007_create_staff_user_rpc.sql` | RPC `create_staff_user` (création utilisateurs sans service role) |
| 9 | `20260622100001_seed_staff_auth.sql` | 6 comptes staff Auth (`Sarah2026!`) |
| 10 | `20260623000001_staff_user_management_rpc.sql` | RPC `update_staff_user` + `delete_staff_user` |
| 11 | `20260623000002_audit_log_description.sql` | Colonne `description` sur `audit_log` |
| 12 | `20260624000001_storage_buckets.sql` | Buckets Storage (`justificatifs`, `avatars`, `cni`) + policies RLS |
| 13 | `20260625000001_phase3_faq_realtime.sql` | Table `faq_items` + Realtime séances/factures/paiements |
| 14 | `20260626000001_inspecteur_fk_set_null.sql` | FK `examens` / `examen_sessions` → `ON DELETE SET NULL` (suppression inspecteur) |
| 15 | `20260626000002_fk_delete_policies.sql` | FK catalogue (moniteur, véhicule, permis, formation, staff) → `ON DELETE SET NULL` |
| 16 | `20260626000003_delete_eleve_rpc.sql` | RPC `delete_eleve` (suppression transactionnelle élève + factures/paiements) |
| 17 | `20260627000001_audit_remediation.sql` | Correctifs audit : vue `security_invoker`, REVOKE anon RPC, RLS audit_log, index FK, perf RLS |
| 18 | `20260627000002_rpc_revoke_public.sql` | REVOKE PUBLIC sur RPC admin (complément — anon hérite de PUBLIC par défaut) |
| 19 | `20260627000003_rls_policy_consolidation.sql` | Fusion policies SELECT + WITH CHECK admin (perf RLS) |
| 20 | `20260627000004_portail_rate_limit.sql` | Rate limiting `login_eleve_portail` (5 essais / 15 min) |
| 21 | `20260628000001_reference_tables_dynamic.sql` | Tables `modes_paiement`, `categories_depense`, `app_config` + seed FAQ |

> L'ancien `20260621000004_seed_demo.sql` et `seed_full_mock.sql` ont été remplacés par `seed_reference_data.sql`.

## Déploiement Vercel + Supabase Auth

**Production :** https://auto-ecole-pi.vercel.app

### Variables Vercel (Production + Development)

| Variable | Valeur |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://myzgspejgqzvmbuqqwks.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | clé `sb_publishable_…` (Dashboard → API Keys) |
| `SUPABASE_SERVICE_ROLE_KEY` | clé `service_role` (Dashboard → API Keys, **serveur uniquement**) |

Automatisation (token Supabase requis) :

```bash
set SUPABASE_ACCESS_TOKEN=sbp_votre_token
node scripts/setup-vercel-supabase.mjs
```

### Supabase → Authentication → URL Configuration

Ajouter dans **Redirect URLs** :

- `https://auto-ecole-pi.vercel.app/**`
- `https://auto-ecole-pi.vercel.app/auth/callback`
- `https://auto-ecole-pi.vercel.app/auth/reset-password`
- `http://localhost:3000/**` (dev local)

**Site URL :** `https://auto-ecole-pi.vercel.app`

## Variables d'environnement

```env
NEXT_PUBLIC_SUPABASE_URL=https://myzgspejgqzvmbuqqwks.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...   # serveur uniquement (Vercel Production/Development)
```

Supabase est **obligatoire** : l'application ne démarre pas sans ces variables.

> **Sécurité Auth (Dashboard)** : activer *Leaked password protection* dans Authentication → Settings (cf. audit `AUDIT-SARAH-AUTO.md`).

## Comptes de test

| Email | Rôle | Mot de passe |
|-------|------|--------------|
| `admin@sarahauto.ci` | Admin principal | `Sarah2026!` |
| `a.diallo@sarahauto.ci` | Admin principal | `Sarah2026!` |
| `l.kouame@sarahauto.ci` | Admin secondaire (inactif) | `Sarah2026!` |
| `jm.koffi@sarahauto.ci` | Moniteur | `Sarah2026!` |
| `f.brou@sarahauto.ci` | Moniteur | `Sarah2026!` |
| `e.tanoh@sarahauto.ci` | Comptable | `Sarah2026!` |
| `s.aya@sarahauto.ci` | Conseiller | `Sarah2026!` |

Portail élève : code `EL-2401` + téléphone `+225 07 12 34 56`

Création d'utilisateurs supplémentaires : UI **Paramètres → Utilisateurs** (API `/api/admin/users` + RPC `create_staff_user`).

Réinitialisation mot de passe staff : lien **Mot de passe oublié ?** sur l'écran de connexion admin (redirect `/auth/reset-password`).

FAQ éditable : **Paramètres → Assistance** (admins) — table `faq_items`.

Realtime : séances, factures et paiements se resynchronisent automatiquement (debounce 2 s) pour les admins connectés.

## Architecture données

- **Supabase = source de vérité** : toutes les mutations UI écrivent en base via `src/lib/supabase/repositories/`
- **localStorage désactivé** pour les données métier
- **Sync lecture** : `syncDataFromSupabase()` au login admin
- **Portail élève** : RPC `login_eleve_portail` + `get_eleve_portail_data`

## RPCs disponibles

| RPC | Usage |
|-----|-------|
| `login_eleve_portail` | Auth portail élève |
| `get_eleve_portail_data` | Séances, factures, paiements élève |
| `inscrire_eleve` | Inscription + facture (transaction) |
| `enregistrer_paiement` | Paiement + recalcul statut facture |
| `create_staff_user` | Création compte staff (admin connecté, sans service role) |
| `update_staff_user` | Mise à jour profil staff (+ mot de passe Auth optionnel) |
| `delete_staff_user` | Suppression compte staff (Auth + profile) |
| `delete_eleve` | Suppression élève + factures/paiements/bordereaux (admin, transaction) |

## Tables

`profiles`, `permis`, `eleves`, `formations`, `inscriptions`, `moniteurs`, `vehicules`, `inspecteurs`, `seances`, `examens`, `factures`, `paiements`, `depenses`, `audit_log`, `examen_sessions`, `examen_session_eleves`, `faq_items`, `modes_paiement`, `categories_depense`, `app_config`

Vue : `eleves_solde` (solde calculé depuis factures/paiements)
