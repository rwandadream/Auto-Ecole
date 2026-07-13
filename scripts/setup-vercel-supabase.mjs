#!/usr/bin/env node
/**
 * Configure Supabase Auth (redirect URLs + leaked password protection)
 * + variables Vercel canoniques.
 *
 * Usage :
 *   set SUPABASE_ACCESS_TOKEN=sbp_...
 *   node scripts/setup-vercel-supabase.mjs
 *
 * Le script charge automatiquement .env.local puis .env (sans écraser les vars déjà définies).
 */

import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

function loadEnvFile(path) {
  try {
    for (const line of readFileSync(path, 'utf8').split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq === -1) continue
      const key = trimmed.slice(0, eq).trim()
      let value = trimmed.slice(eq + 1).trim()
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      if (!(key in process.env) || process.env[key] === '') process.env[key] = value
    }
  } catch {
    /* optional */
  }
}

loadEnvFile(resolve(ROOT, '.env.local'))
loadEnvFile(resolve(ROOT, '.env'))

const PROJECT_REF = 'myzgspejgqzvmbuqqwks'
const SUPABASE_URL = `https://${PROJECT_REF}.supabase.co`
const PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.SUPABASE_PUBLISHABLE_KEY
const PRODUCTION_URL = (process.env.VERCEL_PRODUCTION_URL ?? 'https://auto-ecole-one-liart.vercel.app').replace(/\/$/, '')
const VERCEL_TEAM_SLUG = process.env.VERCEL_TEAM_SLUG ?? 'rwandadreams-projects'
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN

const VERCEL_ENVIRONMENTS = ['production', 'preview', 'development']

const REDIRECT_URLS = [
  `${PRODUCTION_URL}/**`,
  `${PRODUCTION_URL}/auth/callback`,
  `${PRODUCTION_URL}/auth/reset-password`,
  `https://*-${VERCEL_TEAM_SLUG}.vercel.app/**`,
  'http://localhost:3000/**',
  'http://localhost:3000/auth/callback',
  'http://localhost:3000/auth/reset-password',
].join(',')

if (!PUBLISHABLE_KEY) {
  console.error('❌ Clé publishable manquante.')
  console.error('   vercel env pull .env.local --yes')
  process.exit(1)
}

if (!ACCESS_TOKEN) {
  console.error('❌ SUPABASE_ACCESS_TOKEN manquant.')
  console.error('   https://supabase.com/dashboard/account/tokens')
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
    const msg = body.message ?? body.error ?? res.statusText
    throw new Error(`${res.status} ${msg}`)
  }
  return body
}

function vercelEnv(name, value, environment) {
  execSync(
    `vercel env add ${name} ${environment} --value "${value.replace(/"/g, '\\"')}" --yes --force`,
    { stdio: 'inherit', shell: true, cwd: ROOT },
  )
}

console.log('🔑 Récupération des clés API Supabase…')
const apiKeys = await mgmt('/api-keys')
const keys = Array.isArray(apiKeys) ? apiKeys : []
const serviceRole = keys.find((k) => k.name === 'service_role')?.api_key
if (!serviceRole) {
  throw new Error('Clé service_role introuvable')
}

console.log('🔐 Auth Supabase — Site URL, Redirect URLs, protection mots de passe…')
const authPayload = {
  site_url: PRODUCTION_URL,
  uri_allow_list: REDIRECT_URLS,
  password_hibp_enabled: true,
}

try {
  await mgmt('/config/auth', {
    method: 'PATCH',
    body: JSON.stringify(authPayload),
  })
} catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  if (/hibp|entitlement|402|403|Pro Plan/i.test(message)) {
    console.warn('⚠️  password_hibp_enabled indisponible (plan Pro requis). Configuration Auth sans HIBP…')
    await mgmt('/config/auth', {
      method: 'PATCH',
      body: JSON.stringify({
        site_url: PRODUCTION_URL,
        uri_allow_list: REDIRECT_URLS,
      }),
    })
  } else {
    throw error
  }
}

const authConfig = await mgmt('/config/auth')
console.log('✓ Auth vérifié :')
console.log(`   site_url           : ${authConfig.site_url ?? '(non renseigné)'}`)
console.log(`   password_hibp      : ${authConfig.password_hibp_enabled ?? false}`)
console.log(`   uri_allow_list     : ${String(authConfig.uri_allow_list ?? REDIRECT_URLS).slice(0, 120)}…`)

console.log('☁️  Variables Vercel (production + preview + development)…')
for (const env of VERCEL_ENVIRONMENTS) {
  vercelEnv('NEXT_PUBLIC_SUPABASE_URL', SUPABASE_URL, env)
  vercelEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', PUBLISHABLE_KEY, env)
  vercelEnv('SUPABASE_SERVICE_ROLE_KEY', serviceRole, env)
}

console.log('✅ Terminé.')
console.log(`   Site URL      : ${PRODUCTION_URL}`)
console.log('   Redéployez   : vercel deploy --prod')
