import { NextResponse } from 'next/server'
import { requireSuperAdminSession } from '@/lib/backup/require-super-admin'
import {
  BACKUP_TABLES,
  backupFilename,
  buildBackupPayload,
  type BackupTableName,
} from '@/lib/backup/platform-backup'

export const maxDuration = 60

export async function GET() {
  try {
    const auth = await requireSuperAdminSession()
    if ('response' in auth) return auth.response

    const tables: Partial<Record<BackupTableName, Record<string, unknown>[]>> = {}

    for (const name of BACKUP_TABLES) {
      const { data, error } = await auth.serverClient.from(name).select('*')
      if (error) {
        return NextResponse.json(
          { error: `Lecture « ${name} » impossible : ${error.message}` },
          { status: 400 },
        )
      }
      tables[name] = (data ?? []) as Record<string, unknown>[]
    }

    const payload = buildBackupPayload(tables)
    const body = JSON.stringify(payload, null, 2)
    const filename = backupFilename()

    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur serveur'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
