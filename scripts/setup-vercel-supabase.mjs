#!/usr/bin/env node
/**
 * Configure Supabase Auth (redirect URLs) + Vercel env vars for production.
 *
 * Prérequis :
 *   1. Token Supabase : https://supabase.com/dashboard/account/tokens
 *   2. Vercel CLI connecté : vercel login && vercel link
 *
 * Usage :
 *   set SUPABASE_ACCESS_TOKEN=sbp_...
 *   node scripts/setup-vercel-supabase.mjs
 *
 * Optionnel :
 *   set VERCEL_PRODUCTION_URL=https://auto-ecole-pi.vercel.app
 */

import { execSync } from 'node:child_process'

const PROJECT_REF = 'myzgspejgqzvmbuqqwks'
const SUPABASE_URL = `https://${PROJECT_REF}.supabase.co`
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ?? 'sb_publishable_yS_nyOgtCs_MWcXRiowAGQ_VYUxiexC'
const PRODUCTION_URL = (process.env.VERCEL_PRODUCTION_URL ?? 'https://auto-ecole-pi.vercel.app').replace(/\/$/, '')
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN

if (!ACCESS_TOKEN) {
  console.error('❌ SUPABASE_ACCESS_TOKEN manquant.')
  console.error('   Créez un token : https://supabase.com/dashboard/account/tokens')
  process.exit(1)
}

const headers = {
  Authorization: `Bearer ${ACCESS_TOKEN}`,
  'Content-Type': 'application/json',
}

async function mgmt(path, init = {}) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}${path}`, {
    ...init,
    headers: { ...headers, ...(init.headers ?? {}) },
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(body.message ?? body.error ?? res.statusText)
  }
  return body
}

function vercelEnv(name, value, environment = 'production') {
  execSync(
    `vercel env add ${name} ${environment} --value "${value.replace(/"/g, '\\"')}" --yes --force`,
    { stdio: 'inherit', shell: true },
  )
}

console.log('🔑 Récupération des clés API Supabase…')
const legacyKeys = await mgmt('/api-keys/legacy')
const serviceRole = legacyKeys.find((k) => k.name === 'service_role')?.api_key
if (!serviceRole) {
  throw new Error('Clé service_role introuvable dans la réponse Supabase')
}

console.log('🔐 Configuration Auth Supabase (redirect URLs)…')
const redirectUrls = [
  `${PRODUCTION_URL}/**`,
  `${PRODUCTION_URL}/auth/callback`,
  `${PRODUCTION_URL}/auth/reset-password`,
  'http://localhost:3000/**',
  'http://localhost:3000/auth/callback',
  'http://localhost:3000/auth/reset-password',
].join(',')

await mgmt('/config/auth', {
  method: 'PATCH',
  body: JSON.stringify({
    site_url: PRODUCTION_URL,
    uri_allow_list: redirectUrls,
  }),
})

console.log('☁️  Variables Vercel (production + development)…')
for (const env of ['production', 'development']) {
  vercelEnv('NEXT_PUBLIC_SUPABASE_URL', SUPABASE_URL, env)
  vercelEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', PUBLISHABLE_KEY, env)
  vercelEnv('SUPABASE_SERVICE_ROLE_KEY', serviceRole, env)
}

console.log('✅ Terminé.')
console.log(`   Site URL      : ${PRODUCTION_URL}`)
console.log(`   Redirect URLs : ${redirectUrls}`)
console.log('   Redéployez sur Vercel pour appliquer les nouvelles variables.')
