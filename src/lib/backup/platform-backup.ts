/** Format de sauvegarde plateforme SARAH AUTO (v1). */

export const BACKUP_FORMAT = 'sarah-auto-backup' as const
export const BACKUP_VERSION = 1 as const
export const BACKUP_APP = 'SARAH AUTO' as const

/**
 * Ordre d'INSERT (parents → enfants).
 * L'ordre inverse sert à la purge avant restauration.
 */
export const BACKUP_TABLES = [
  'modes_paiement',
  'categories_depense',
  'app_config',
  'permis',
  'formations',
  'moniteurs',
  'vehicules',
  'inspecteurs',
  'eleves',
  'inscriptions',
  'seances',
  'examens',
  'examen_sessions',
  'examen_session_eleves',
  'factures',
  'paiements',
  'depenses',
  'faq_items',
  'audit_log',
] as const

export type BackupTableName = (typeof BACKUP_TABLES)[number]

export type PlatformBackupV1 = {
  format: typeof BACKUP_FORMAT
  version: typeof BACKUP_VERSION
  exportedAt: string
  app: typeof BACKUP_APP
  tables: Record<BackupTableName, Record<string, unknown>[]>
}

export function isBackupTableName(value: string): value is BackupTableName {
  return (BACKUP_TABLES as readonly string[]).includes(value)
}

export function buildBackupPayload(
  tables: Partial<Record<BackupTableName, Record<string, unknown>[]>>,
): PlatformBackupV1 {
  const normalized = {} as Record<BackupTableName, Record<string, unknown>[]>
  for (const name of BACKUP_TABLES) {
    normalized[name] = Array.isArray(tables[name]) ? tables[name]! : []
  }
  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    app: BACKUP_APP,
    tables: normalized,
  }
}

export function assertValidBackup(data: unknown): PlatformBackupV1 {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('Fichier de sauvegarde invalide (JSON objet attendu).')
  }
  const obj = data as Record<string, unknown>

  if (obj.format !== BACKUP_FORMAT) {
    throw new Error(`Format non reconnu (attendu : ${BACKUP_FORMAT}).`)
  }
  if (obj.version !== BACKUP_VERSION) {
    throw new Error(
      `Version de sauvegarde non supportée (${String(obj.version)}). Version attendue : ${BACKUP_VERSION}.`,
    )
  }
  if (!obj.tables || typeof obj.tables !== 'object' || Array.isArray(obj.tables)) {
    throw new Error('Fichier de sauvegarde invalide (clé tables manquante).')
  }

  const tablesIn = obj.tables as Record<string, unknown>
  const tables = {} as Record<BackupTableName, Record<string, unknown>[]>

  for (const name of BACKUP_TABLES) {
    const rows = tablesIn[name]
    if (rows === undefined) {
      tables[name] = []
      continue
    }
    if (!Array.isArray(rows)) {
      throw new Error(`Table « ${name} » invalide : un tableau est attendu.`)
    }
    for (const row of rows) {
      if (!row || typeof row !== 'object' || Array.isArray(row)) {
        throw new Error(`Table « ${name} » : ligne invalide.`)
      }
    }
    tables[name] = rows as Record<string, unknown>[]
  }

  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: typeof obj.exportedAt === 'string' ? obj.exportedAt : new Date().toISOString(),
    app: BACKUP_APP,
    tables,
  }
}

export function backupFilename(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  const stamp =
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
    `-${pad(date.getHours())}${pad(date.getMinutes())}`
  return `sarah-auto-backup-${stamp}.json`
}
