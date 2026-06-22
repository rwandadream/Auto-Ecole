import { getSupabaseErrorMessage } from '@/lib/supabase/errors'
import { toast } from 'sonner'

export async function persistRemote(
  label: string,
  operation: () => Promise<void>,
  rollback?: () => void,
): Promise<void> {
  try {
    await operation()
  } catch (error) {
    rollback?.()
    toast.error(`${label} : ${getSupabaseErrorMessage(error)}`)
    throw error
  }
}

export async function persistRemoteAwait(
  operation: () => Promise<void>,
  rollback?: () => void,
): Promise<void> {
  try {
    await operation()
  } catch (error) {
    rollback?.()
    throw error
  }
}

export function persistRemoteSilent(
  operation: () => Promise<void>,
  rollback?: () => void,
  label = 'Synchronisation',
) {
  void operation().catch((error) => {
    rollback?.()
    toast.error(`${label} : ${getSupabaseErrorMessage(error)}`)
  })
}
