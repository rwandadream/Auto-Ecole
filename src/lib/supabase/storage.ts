import { createClient } from '@/lib/supabase/client'
import { MAX_IMAGE_BYTES } from '@/lib/image-utils'

export type MediaBucket = 'justificatifs' | 'avatars' | 'cni'

const BUCKET_SET = new Set<string>(['justificatifs', 'avatars', 'cni'])

/** Référence stockée en base : `{bucket}/{path}` */
export function formatStorageRef(bucket: MediaBucket, path: string): string {
  return `${bucket}/${path}`
}

export function parseStorageRef(stored: string): { bucket: MediaBucket; path: string } | null {
  const slash = stored.indexOf('/')
  if (slash <= 0) return null
  const bucket = stored.slice(0, slash)
  const path = stored.slice(slash + 1)
  if (!BUCKET_SET.has(bucket) || !path) return null
  return { bucket: bucket as MediaBucket, path }
}

export function isInlineMedia(stored: string): boolean {
  return !stored || stored.startsWith('data:') || stored.startsWith('http://') || stored.startsWith('https://')
}

export async function uploadMedia(
  bucket: MediaBucket,
  path: string,
  file: File | Blob,
): Promise<string> {
  if (file instanceof File && file.size > MAX_IMAGE_BYTES) {
    throw new Error('FILE_TOO_LARGE')
  }
  if (file instanceof Blob && file.size > MAX_IMAGE_BYTES) {
    throw new Error('FILE_TOO_LARGE')
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('AUTH_REQUIRED')
  }

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
    contentType: file instanceof File ? file.type || undefined : undefined,
  })

  if (error) throw error
  return formatStorageRef(bucket, path)
}

/** Téléverse une image data URL (aperçu scanner, base64) vers Storage. */
export async function uploadMediaFromDataUrl(
  bucket: MediaBucket,
  path: string,
  dataUrl: string,
): Promise<string> {
  const res = await fetch(dataUrl)
  const blob = await res.blob()
  if (blob.size > MAX_IMAGE_BYTES) {
    throw new Error('FILE_TOO_LARGE')
  }
  return uploadMedia(bucket, path, blob)
}

export async function resolveMediaUrl(stored: string): Promise<string> {
  if (!stored) return ''
  if (isInlineMedia(stored)) return stored

  const ref = parseStorageRef(stored)
  if (!ref) return stored

  const supabase = createClient()
  // CNI = national ID scan — shorter TTL for sensitive documents; others 1 h
  const ttl = ref.bucket === 'cni' ? 600 : 3600
  const { data, error } = await supabase.storage.from(ref.bucket).createSignedUrl(ref.path, ttl)
  if (error || !data?.signedUrl) return ''
  return data.signedUrl
}
