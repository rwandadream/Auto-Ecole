import { createClient } from '@/lib/supabase/client'
import { uploadMediaFromDataUrl, isInlineMedia } from '@/lib/supabase/storage'
import type { Depense, Eleve } from '@/lib/domain/types'

export type MediaMigrationResult = {
  depensesMigrated: number
  elevesMigrated: number
  errors: string[]
}

async function migrateDepenseJustificatif(d: Depense): Promise<string | null> {
  if (!d.justificatif || !isInlineMedia(d.justificatif) || !d.justificatif.startsWith('data:')) {
    return null
  }
  return uploadMediaFromDataUrl('justificatifs', `${d.id}/migrated.jpg`, d.justificatif)
}

async function migrateElevePhotos(e: Eleve): Promise<Partial<Eleve>> {
  const patch: Partial<Eleve> = {}
  if (e.photoCni?.startsWith('data:')) {
    patch.photoCni = await uploadMediaFromDataUrl('cni', `${e.id}/cni-migrated.jpg`, e.photoCni)
  }
  if (e.photoProfil?.startsWith('data:')) {
    patch.photoProfil = await uploadMediaFromDataUrl('avatars', `${e.id}/profile-migrated.jpg`, e.photoProfil)
  }
  return patch
}

/** Migre les justificatifs et photos encore en base64 vers Supabase Storage (staff authentifié). */
export async function migrateInlineMediaToStorage(
  depenses: Depense[],
  eleves: Eleve[],
  onDepenseUpdate: (id: string, justificatif: string) => void,
  onEleveUpdate: (id: string, patch: Partial<Eleve>) => void,
): Promise<MediaMigrationResult> {
  const { data: { user } } = await createClient().auth.getUser()
  if (!user) {
    throw new Error('AUTH_REQUIRED')
  }

  const result: MediaMigrationResult = {
    depensesMigrated: 0,
    elevesMigrated: 0,
    errors: [],
  }

  for (const d of depenses) {
    try {
      const ref = await migrateDepenseJustificatif(d)
      if (ref) {
        onDepenseUpdate(d.id, ref)
        result.depensesMigrated += 1
      }
    } catch (err) {
      result.errors.push(`Dépense ${d.id}: ${err instanceof Error ? err.message : 'erreur'}`)
    }
  }

  for (const e of eleves) {
    try {
      const patch = await migrateElevePhotos(e)
      if (Object.keys(patch).length > 0) {
        onEleveUpdate(e.id, patch)
        result.elevesMigrated += 1
      }
    } catch (err) {
      result.errors.push(`Élève ${e.code}: ${err instanceof Error ? err.message : 'erreur'}`)
    }
  }

  return result
}
