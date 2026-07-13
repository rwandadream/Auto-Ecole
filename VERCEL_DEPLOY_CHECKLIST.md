# Checklist déploiement Vercel + Supabase — SARAH AUTO

## Compte Vercel (rwandadreams-projects uniquement)

- **Équipe :** [rwandadreams-projects](https://vercel.com/rwandadreams-projects)
- **Projet :** `auto-ecole`
- **URL production :** https://auto-ecole-one-liart.vercel.app
- **Repo GitHub :** https://github.com/rwandadream/Auto-Ecole.git

### Bootstrap local (skill Vercel env-vars)

```bash
vercel link --yes --project auto-ecole --scope rwandadreams-projects
vercel env pull .env.local --yes
```

> Ne commitez jamais `.env.local`. Les secrets serveur restent sans préfixe `NEXT_PUBLIC_`.

## Variables canoniques (3 seules lues par l'app)

| Variable | Environnements Vercel | Exposée au client ? |
|----------|----------------------|---------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview, Development | Oui |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Production, Preview, Development | Oui |
| `SUPABASE_SERVICE_ROLE_KEY` | Production, Preview | **Non** (serveur uniquement) |

> L'intégration Supabase peut ajouter `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, etc. L'app Next.js n'utilise **que** les 3 variables ci-dessus. Vérifiez que `NEXT_PUBLIC_*` sont bien renseignées.

Automatisation complète (Auth + env + protection mots de passe) :

```bash
# Token : https://supabase.com/dashboard/account/tokens
set SUPABASE_ACCESS_TOKEN=sbp_votre_token
node scripts/setup-vercel-supabase.mjs
vercel deploy --prod
```

Le script charge `.env.local` automatiquement si la clé publishable y est déjà définie.

## Supabase Auth — URL Configuration

Dashboard → [Authentication → URL Configuration](https://supabase.com/dashboard/project/myzgspejgqzvmbuqqwks/auth/url-configuration)

- [ ] **Site URL :** `https://auto-ecole-one-liart.vercel.app`
- [ ] **Redirect URLs :**
  - `https://auto-ecole-one-liart.vercel.app/**`
  - `https://*-rwandadreams-projects.vercel.app/**` (previews Vercel)
  - `http://localhost:3000/**` (dev local)

## Avant le push / deploy

- [ ] `npm run build` — build local sans erreur
- [ ] `npm run lint` — aucune erreur bloquante
- [ ] Pas de fichier `.env` uploadé (`.vercelignore` actif)

## Après le déploiement

- [ ] Hard refresh `Ctrl+Shift+R` (service worker)
- [ ] Page login admin accessible
- [ ] `GET /api/health` → `{ "status": "ok" }`
- [ ] Réinitialisation mot de passe (email → callback)
- [ ] CRUD `/api/admin/users` (super administrateur)

## Commandes utiles

```bash
vercel env ls production
vercel deploy --prod
vercel logs auto-ecole-one-liart.vercel.app
vercel inspect auto-ecole-one-liart.vercel.app
```

## Sécurité Supabase (audit MCP)

- [ ] Activer *Leaked password protection* (Auth → Settings)
- [ ] Ne jamais exposer `SUPABASE_SERVICE_ROLE_KEY` côté client
- [ ] Utiliser la clé **publishable** (`sb_publishable_…`), pas `service_role` dans le navigateur
