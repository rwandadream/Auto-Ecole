# Checklist avant chaque déploiement Vercel — SARAH AUTO

## Variables d'environnement (Vercel Dashboard → Settings → Environment Variables)

- [ ] `NEXT_PUBLIC_SUPABASE_URL` — Production, Preview, Development
- [ ] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — Production, Preview, Development
- [ ] `SUPABASE_SERVICE_ROLE_KEY` — Production, Preview (jamais de préfixe `NEXT_PUBLIC_`)

## Supabase Auth (Dashboard → Authentication → URL Configuration)

- [ ] Site URL : `https://auto-ecole-pi.vercel.app`
- [ ] Redirect URLs : `/auth/callback`, `/auth/reset-password`

## Avant le push / deploy

- [ ] `npm run build` — build local sans erreur
- [ ] `npm run lint` — aucune erreur bloquante
- [ ] Pas de fichier `.env` uploadé (`.vercelignore` actif)

## Après le déploiement

- [ ] Hard refresh `Ctrl+Shift+R` (service worker — purger l'ancien cache)
- [ ] Page login admin accessible
- [ ] Tableau de bord + page Paramètres sans erreur React #185
- [ ] `GET /api/health` retourne `{ "status": "ok" }`
- [ ] CRUD `/api/admin/users` (super administrateur connecté)

## Commandes utiles

```bash
vercel env ls
vercel deploy --prod
vercel logs auto-ecole-pi.vercel.app
```
