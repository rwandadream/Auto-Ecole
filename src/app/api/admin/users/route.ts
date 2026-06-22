import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { mapRoleToDb } from '@/lib/supabase/roles'

const ADMIN_ROLES = ['administrateur_principal', 'administrateur_secondaire']

async function requireAdminClient() {
  const serverClient = await createServerClient()
  const { data: { user: caller }, error: authError } = await serverClient.auth.getUser()
  if (authError || !caller) {
    return { error: NextResponse.json({ error: 'Non authentifié' }, { status: 401 }) }
  }

  const { data: callerProfile, error: callerProfileError } = await serverClient
    .from('profiles')
    .select('role, actif')
    .eq('id', caller.id)
    .maybeSingle()

  if (callerProfileError || !callerProfile?.actif) {
    return { error: NextResponse.json({ error: 'Accès refusé' }, { status: 403 }) }
  }

  if (!ADMIN_ROLES.includes(callerProfile.role ?? '')) {
    return { error: NextResponse.json({ error: 'Réservé aux administrateurs' }, { status: 403 }) }
  }

  return { serverClient, caller }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdminClient()
    if ('error' in auth && auth.error) return auth.error

    const body = await request.json()
    const { email, password, name, role } = body as {
      email?: string
      password?: string
      name?: string
      role?: string
    }

    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: 'Champs requis: email, password, name, role' }, { status: 400 })
    }

    const admin = createAdminClient()
    const normalizedEmail = email.trim().toLowerCase()
    const trimmedName = name.trim()

    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,
      user_metadata: { name: trimmedName },
    })

    if (createError || !created.user) {
      return NextResponse.json(
        { error: createError?.message ?? 'Création impossible' },
        { status: 400 },
      )
    }

    const { error: profileError } = await admin
      .from('profiles')
      .update({
        name: trimmedName,
        role: mapRoleToDb(role),
        actif: true,
      })
      .eq('id', created.user.id)

    if (profileError) {
      await admin.auth.admin.deleteUser(created.user.id)
      return NextResponse.json({ error: profileError.message }, { status: 400 })
    }

    return NextResponse.json({
      id: created.user.id,
      email: normalizedEmail,
      name: trimmedName,
      role,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur serveur'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await requireAdminClient()
    if ('error' in auth && auth.error) return auth.error
    const { serverClient } = auth

    const body = await request.json()
    const { id, name, role, actif, password } = body as {
      id?: string
      name?: string
      role?: string
      actif?: boolean
      password?: string
    }

    if (!id || !name || !role || actif === undefined) {
      return NextResponse.json({ error: 'Champs requis: id, name, role, actif' }, { status: 400 })
    }

    const trimmedPassword = password?.trim()
    const { data, error } = await serverClient.rpc('update_staff_user', {
      p_id: id,
      p_name: name.trim(),
      p_role: mapRoleToDb(role),
      p_actif: actif,
      p_password: trimmedPassword || null,
    })

    const row = Array.isArray(data) ? data[0] : data
    if (error || !row) {
      return NextResponse.json({ error: error?.message ?? 'Mise à jour impossible' }, { status: 400 })
    }

    return NextResponse.json({
      id: row.id,
      email: row.email,
      name: row.name,
      role,
      actif: row.actif,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur serveur'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await requireAdminClient()
    if ('error' in auth && auth.error) return auth.error
    const { serverClient } = auth

    const id = new URL(request.url).searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Paramètre id requis' }, { status: 400 })
    }

    const admin = createAdminClient()
    await admin.auth.admin.signOut(id, 'global')

    const { error } = await serverClient.rpc('delete_staff_user', { p_id: id })
    if (error) {
      return NextResponse.json({ error: error.message ?? 'Suppression impossible' }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur serveur'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
