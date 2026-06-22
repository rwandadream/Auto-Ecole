import { cpSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const standalone = join(root, '.next', 'standalone')

if (!existsSync(standalone)) {
  console.error('Build standalone introuvable — lancez d’abord `next build`.')
  process.exit(1)
}

mkdirSync(join(standalone, '.next'), { recursive: true })
cpSync(join(root, '.next', 'static'), join(standalone, '.next', 'static'), { recursive: true })
cpSync(join(root, 'public'), join(standalone, 'public'), { recursive: true })
