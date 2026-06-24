import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { mapRoleFromDb, mapRoleToDb } from '@/lib/supabase/roles'

const ASSIGNABLE_ROLES = [
  'Directeur',
  'Responsable adjoint',
  'Comptable',
  'Moniteur',
  'Secrétaire',
] as const

const createUserSchema = z.object({
  email: z.string().email('Email invalide').max(254),
  password: z.string().min(8, 'Le mot de passe doit comporter au moins 8 caractères').max(128),
  name: z.string().min(1, 'Nom requis').max(100),
  role: z.enum(ASSIGNABLE_ROLES, { error: 'Rôle invalide' }),
  actif: z.boolean().optional(),
})

const updateUserSchema = z.object({
  id: z.string().uuid('ID invalide'),
  name: z.string().min(1, 'Nom requis').max(100),
  role: z.enum(ASSIGNABLE_ROLES, { error: 'Rôle invalide' }),
  actif: z.boolean(),
  password: z.string().min(8, 'Le mot de passe doit comporter au moins 8 caractères').max(128).optional(),
})

const SUPER_ADMIN_ROLE = 'super_administrateur'

export const maxDuration = 10

async function requireSuperAdminSession() {
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

  if (!callerProfile?.actif || callerProfile.role !== SUPER_ADMIN_ROLE) {
    return { response: NextResponse.json({ error: 'Réservé au super administrateur' }, { status: 403 }) }
  }

  return { callerId: caller.id }
}

export async function POST(request: Request) {
  try {
    const auth = await requireSuperAdminSession()
    if ('response' in auth) return auth.response

    const body = await request.json()
    const parsed = createUserSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Données invalides' }, { status: 400 })
    }
    const { email, password, name, role, actif } = parsed.data

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
    const auth = await requireSuperAdminSession()
    if ('response' in auth) return auth.response

    const body = await request.json()
    const parsed = updateUserSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Données invalides' }, { status: 400 })
    }
    const { id, name, role, actif, password } = parsed.data

    const adminClient = createAdminClient()

    // Vérifier que la cible n'est pas un super admin (ne peut pas être modifié ici)
    const { data: targetProfile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', id)
      .maybeSingle()
    if (targetProfile?.role === SUPER_ADMIN_ROLE) {
      return NextResponse.json({ error: 'Le compte super administrateur ne peut pas être modifié via cette interface' }, { status: 403 })
    }
    const trimmedPassword = password?.trim()

    // Update password via Admin API if provided
    if (trimmedPassword) {
      if (trimmedPassword.length < 8) {
        return NextResponse.json(
          { error: 'Le mot de passe doit comporter au moins 8 caractères' },
          { status: 400 },
        )
      }
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
    const auth = await requireSuperAdminSession()
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

    // Refuser la suppression d'un autre super admin
    const { data: targetProfile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', id)
      .maybeSingle()
    if (targetProfile?.role === SUPER_ADMIN_ROLE) {
      return NextResponse.json({ error: 'Le compte super administrateur ne peut pas être supprimé via cette interface' }, { status: 403 })
    }

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
