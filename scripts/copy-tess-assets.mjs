import { copyFileSync, mkdirSync, readdirSync, existsSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'public', 'tess')

mkdirSync(outDir, { recursive: true })

function copyOne(from, toName) {
  if (!existsSync(from)) {
    throw new Error(`[copy-tess-assets] Fichier manquant: ${from}`)
  }
  copyFileSync(from, join(outDir, toName))
  console.log(`  ✓ ${toName}`)
}

console.log('[copy-tess-assets] Copie vers public/tess…')

// Worker
const workerPath = join(root, 'node_modules', 'tesseract.js', 'dist', 'worker.min.js')
copyOne(workerPath, 'worker.min.js')

// Cores WASM (tous les builds pour que Tesseract choisisse le bon)
const coreDir = join(root, 'node_modules', 'tesseract.js-core')
for (const name of readdirSync(coreDir)) {
  if (name.endsWith('.wasm') || name.endsWith('.wasm.js') || (name.startsWith('tesseract-core') && name.endsWith('.js'))) {
    copyOne(join(coreDir, name), name)
  }
}

// Langue FR — package @tesseract.js-data/fra
let fraGz = null
try {
  const pkgJson = require.resolve('@tesseract.js-data/fra/package.json')
  const fraRoot = dirname(pkgJson)
  const candidates = [
    join(fraRoot, '4.0.0_best_int', 'fra.traineddata.gz'),
    join(fraRoot, '4.0.0', 'fra.traineddata.gz'),
    join(fraRoot, 'fra.traineddata.gz'),
  ]
  for (const c of candidates) {
    if (existsSync(c)) {
      fraGz = c
      break
    }
  }
  if (!fraGz) {
    // chercher récursivement un niveau
    for (const entry of readdirSync(fraRoot, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue
      const nested = join(fraRoot, entry.name, 'fra.traineddata.gz')
      if (existsSync(nested)) {
        fraGz = nested
        break
      }
    }
  }
} catch {
  throw new Error(
    '[copy-tess-assets] @tesseract.js-data/fra introuvable. Exécutez: npm install @tesseract.js-data/fra',
  )
}

if (!fraGz) {
  throw new Error('[copy-tess-assets] fra.traineddata.gz introuvable dans @tesseract.js-data/fra')
}
copyOne(fraGz, 'fra.traineddata.gz')

writeFileSync(
  join(outDir, 'README.md'),
  '# Assets Tesseract (OCR CNI)\n\nGénérés par `node scripts/copy-tess-assets.mjs` (postinstall).\nNe pas éditer à la main.\n',
  'utf8',
)

console.log('[copy-tess-assets] Terminé.')
