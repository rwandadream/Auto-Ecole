import { NextResponse } from 'next/server'
import { requireSuperAdminSession } from '@/lib/backup/require-super-admin'
import { assertValidBackup } from '@/lib/backup/platform-backup'
import type { Json } from '@/lib/supabase/database.types'

export const maxDuration = 60

const MAX_FILE_BYTES = 25 * 1024 * 1024 // 25 Mo

export async function POST(request: Request) {
  try {
    const auth = await requireSuperAdminSession()
    if ('response' in auth) return auth.response

    const form = await request.formData().catch(() => null)
    if (!form) {
      return NextResponse.json({ error: 'Formulaire invalide' }, { status: 400 })
    }

    const confirmation = String(form.get('confirmation') ?? '').trim()
    if (confirmation !== 'RESTAURER') {
      return NextResponse.json(
        { error: 'Confirmation invalide. Tapez RESTAURER pour confirmer.' },
        { status: 400 },
      )
    }

    const file = form.get('file')
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Fichier de sauvegarde requis' }, { status: 400 })
    }
    if (file.size === 0) {
      return NextResponse.json({ error: 'Fichier vide' }, { status: 400 })
    }
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: 'Fichier trop volumineux (max. 25 Mo)' },
        { status: 400 },
      )
    }

    let parsed: unknown
    try {
      const text = await file.text()
      parsed = JSON.parse(text)
    } catch {
      return NextResponse.json({ error: 'JSON illisible' }, { status: 400 })
    }

    let backup
    try {
      backup = assertValidBackup(parsed)
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : 'Sauvegarde invalide' },
        { status: 400 },
      )
    }

    const { data, error } = await auth.serverClient.rpc('import_platform_backup', {
      p_payload: backup as unknown as Json,
    })

    if (error) {
      return NextResponse.json(
        { error: error.message ?? 'Échec de la restauration' },
        { status: 400 },
      )
    }

    const imported =
      data && typeof data === 'object' && !Array.isArray(data)
        ? (data as Record<string, number>)
        : {}

    return NextResponse.json({ ok: true, imported })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur serveur'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
