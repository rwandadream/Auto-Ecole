import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const SUPER_ADMIN_ROLE = 'super_administrateur'

const MEDIA_BUCKETS = ['justificatifs', 'avatars', 'cni'] as const

const bodySchema = z.object({
  confirmation: z.literal('SUPPRIMER'),
})

export const maxDuration = 60

async function requireSuperAdminSession() {
  const serverClient = await createServerClient()
  const {
    data: { user: caller },
    error: authError,
  } = await serverClient.auth.getUser()

  if (authError || !caller) {
    return { response: NextResponse.json({ error: 'Non authentifié' }, { status: 401 }) }
  }

  const { data: callerProfile } = await serverClient
    .from('profiles')
    .select('role, actif')
    .eq('id', caller.id)
    .maybeSingle()

  if (!callerProfile?.actif || callerProfile.role !== SUPER_ADMIN_ROLE) {
    return {
      response: NextResponse.json(
        { error: 'Réservé au super administrateur' },
        { status: 403 },
      ),
    }
  }

  return { callerId: caller.id, serverClient }
}

type AdminClient = ReturnType<typeof createAdminClient>

/** Collecte récursive des chemins fichiers d'un bucket, puis suppression par lots. */
async function emptyStorageBucket(admin: AdminClient, bucket: string): Promise<number> {
  const paths: string[] = []
  await collectStoragePaths(admin, bucket, '', paths)

  let removed = 0
  const batchSize = 100
  for (let i = 0; i < paths.length; i += batchSize) {
    const batch = paths.slice(i, i + batchSize)
    const { error } = await admin.storage.from(bucket).remove(batch)
    if (error) {
      throw new Error(`Storage ${bucket}: ${error.message}`)
    }
    removed += batch.length
  }
  return removed
}

async function collectStoragePaths(
  admin: AdminClient,
  bucket: string,
  prefix: string,
  out: string[],
): Promise<void> {
  const pageSize = 100
  let offset = 0

  for (;;) {
    const { data: objects, error } = await admin.storage.from(bucket).list(prefix || undefined, {
      limit: pageSize,
      offset,
      sortBy: { column: 'name', order: 'asc' },
    })

    if (error) {
      throw new Error(`Storage ${bucket}${prefix ? `/${prefix}` : ''}: ${error.message}`)
    }
    if (!objects || objects.length === 0) break

    for (const obj of objects) {
      const path = prefix ? `${prefix}/${obj.name}` : obj.name
      // Dossier = entrée sans id (convention Storage API)
      if (obj.id === null) {
        await collectStoragePaths(admin, bucket, path, out)
      } else {
        out.push(path)
      }
    }

    if (objects.length < pageSize) break
    offset += pageSize
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireSuperAdminSession()
    if ('response' in auth) return auth.response

    const body = await request.json().catch(() => null)
    const parsed = bodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Confirmation invalide. Tapez SUPPRIMER pour confirmer.' },
        { status: 400 },
      )
    }

    const { data, error } = await auth.serverClient.rpc('reset_platform_business_data')
    if (error) {
      return NextResponse.json(
        { error: error.message ?? 'Échec de la purge des données' },
        { status: 400 },
      )
    }

    const deleted =
      data && typeof data === 'object' && !Array.isArray(data)
        ? (data as Record<string, number>)
        : {}

    let storageRemoved = 0
    const storageErrors: string[] = []

    try {
      const admin = createAdminClient()
      for (const bucket of MEDIA_BUCKETS) {
        try {
          storageRemoved += await emptyStorageBucket(admin, bucket)
        } catch (err) {
          storageErrors.push(err instanceof Error ? err.message : String(err))
        }
      }
    } catch (err) {
      storageErrors.push(err instanceof Error ? err.message : String(err))
    }

    return NextResponse.json({
      ok: true,
      deleted,
      storageRemoved,
      ...(storageErrors.length > 0 ? { storageWarnings: storageErrors } : {}),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur serveur'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
