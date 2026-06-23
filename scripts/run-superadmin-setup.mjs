#!/usr/bin/env node
/**
 * Applique la migration super_admin + seed superadmin@sarahauto.ci
 *
 * Méthode 1 (recommandée) — Management API, sans mot de passe DB :
 *   set SUPABASE_ACCESS_TOKEN=sbp_...
 *   node scripts/run-superadmin-setup.mjs
 *
 * Méthode 2 — SQL Editor Supabase (manuel) :
 *   1. supabase/20260630000001_super_admin_role.sql
 *   2. supabase/seed_superadmin.sql
 */

import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

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
      if (!(key in process.env)) process.env[key] = value
    }
  } catch {
    /* .env optional */
  }
}

loadEnvFile(resolve(ROOT, '.env'))

const PROJECT_REF = 'myzgspejgqzvmbuqqwks'
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const MIGRATION = resolve(ROOT, 'supabase/20260630000001_super_admin_role.sql')
const SEED = resolve(ROOT, 'supabase/seed_superadmin.sql')

async function runSqlViaMgmt(sql, label) {
  console.log(`\n▶ ${label}…`)
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  })
  const text = await res.text()
  let body
  try {
    body = JSON.parse(text)
  } catch {
    body = text
  }
  if (!res.ok) {
    throw new Error(typeof body === 'object' ? (body.message ?? JSON.stringify(body)) : body)
  }
  console.log(`✓ ${label}`)
  if (Array.isArray(body) && body.length) {
    console.table(body)
  } else if (body && typeof body === 'object' && !Array.isArray(body)) {
    console.log(body)
  }
  return body
}

async function verifyWithServiceRole() {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.warn('⚠ Variables Supabase manquantes pour la vérification.')
    return
  }
  const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const { data, error } = await admin
    .from('profiles')
    .select('id, email, name, role, actif')
    .eq('role', 'super_administrateur')

  if (error) {
    console.warn('⚠ Vérification profiles:', error.message)
    return
  }
  if (data?.length) {
    console.log('\n✓ Super administrateur(s) en base :')
    console.table(data)
  } else {
    console.log('\n⚠ Aucun profil super_administrateur trouvé.')
  }
}

async function main() {
  if (!ACCESS_TOKEN) {
    console.error('❌ SUPABASE_ACCESS_TOKEN manquant.')
    console.error('')
    console.error('Créez un token : https://supabase.com/dashboard/account/tokens')
    console.error('Puis :')
    console.error('  set SUPABASE_ACCESS_TOKEN=sbp_votre_token')
    console.error('  node scripts/run-superadmin-setup.mjs')
    console.error('')
    console.error('Ou exécutez manuellement dans le SQL Editor Supabase :')
    console.error(`  1. ${MIGRATION}`)
    console.error(`  2. ${SEED}`)
    await verifyWithServiceRole()
    process.exit(1)
  }

  const migrationSql = readFileSync(MIGRATION, 'utf8')
  const seedSql = readFileSync(SEED, 'utf8')

  await runSqlViaMgmt(migrationSql, 'Migration super_admin_role')
  await runSqlViaMgmt(seedSql, 'Seed super administrateur')
  await verifyWithServiceRole()
  console.log('\n✅ Terminé. Connexion : onglet Administration → superadmin@sarahauto.ci / SuperAdmin2026!')
}

main().catch((err) => {
  console.error('\n❌', err.message ?? err)
  process.exit(1)
})
