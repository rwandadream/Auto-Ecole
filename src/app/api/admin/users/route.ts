import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { mapRoleFromDb, mapRoleToDb } from '@/lib/supabase/roles'

const ADMIN_ROLES = ['administrateur_principal', 'administrateur_secondaire']

async function requireAdminSession() {
  const serverClient = await createServerClient()
  const { data: { user: caller }, error: authError } = await serverClient.auth.getUser()
  if (authError || !caller) {
    return { response: NextResponse.json({ error: 'Non authentifié' }, { status: 401 }) }
  }

  const { data: callerProfile } = await serverClient
    .from('profiles')
    .select('role, actif')
    .eq('id', caller.id)
    .maybeSingle()

  if (!callerProfile?.actif || !ADMIN_ROLES.includes(callerProfile.role ?? '')) {
    return { response: NextResponse.json({ error: 'Réservé aux administrateurs' }, { status: 403 }) }
  }

  return { callerId: caller.id }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdminSession()
    if ('response' in auth) return auth.response

    const body = await request.json()
    const { email, password, name, role, actif } = body as {
      email?: string
      password?: string
      name?: string
      role?: string
      actif?: boolean
    }

    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: 'Champs requis: email, password, name, role' }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const trimmedName = name.trim()
    const adminClient = createAdminClient()

    const { data, error } = await adminClient.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,
      user_metadata: { name: trimmedName },
    })

    if (error || !data.user) {
      return NextResponse.json({ error: error?.message ?? 'Création impossible' }, { status: 400 })
    }

    // Update profile role/actif (handle_new_user trigger already created the row with name/email)
    await adminClient
      .from('profiles')
      .update({ role: mapRoleToDb(role), actif: actif ?? true })
      .eq('id', data.user.id)

    return NextResponse.json({
      id: data.user.id,
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
    const auth = await requireAdminSession()
    if ('response' in auth) return auth.response

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

    const adminClient = createAdminClient()
    const trimmedPassword = password?.trim()

    // Update password via Admin API if provided
    if (trimmedPassword) {
      const { error: pwError } = await adminClient.auth.admin.updateUserById(id, {
        password: trimmedPassword,
      })
      if (pwError) {
        return NextResponse.json({ error: pwError.message }, { status: 400 })
      }
    }

    // Update profile (name, role, actif)
    const { data, error } = await adminClient
      .from('profiles')
      .update({ name: name.trim(), role: mapRoleToDb(role), actif })
      .eq('id', id)
      .select('id, email, name, role, actif')
      .maybeSingle()

    if (error || !data) {
      return NextResponse.json({ error: error?.message ?? 'Mise à jour impossible' }, { status: 400 })
    }

    return NextResponse.json({
      id: data.id,
      email: data.email,
      name: data.name,
      role: mapRoleFromDb(data.role ?? ''),
      actif: data.actif,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur serveur'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await requireAdminSession()
    if ('response' in auth) return auth.response

    const id = new URL(request.url).searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Paramètre id requis' }, { status: 400 })
    }

    if (auth.callerId === id) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas supprimer votre propre compte' },
        { status: 400 },
      )
    }

    const adminClient = createAdminClient()
    const { error } = await adminClient.auth.admin.deleteUser(id)
    if (error) {
      return NextResponse.json({ error: error.message ?? 'Suppression impossible' }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur serveur'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
