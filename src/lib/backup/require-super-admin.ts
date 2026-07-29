import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'

const SUPER_ADMIN_ROLE = 'super_administrateur'

export async function requireSuperAdminSession(): Promise<
  | { response: NextResponse }
  | { callerId: string; serverClient: SupabaseClient<Database> }
> {
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
