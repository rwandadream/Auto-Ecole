import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient as createServerClient } from '@/lib/supabase/server'
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
const USER_MANAGER_ROLES = new Set(['super_administrateur', 'directeur'])

export const maxDuration = 10

async function requireUserManagerSession() {
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

  if (!callerProfile?.actif || !USER_MANAGER_ROLES.has(callerProfile.role)) {
    return { response: NextResponse.json({ error: 'Réservé à la direction' }, { status: 403 }) }
  }

  return { callerId: caller.id, serverClient }
}

export async function POST(request: Request) {
  try {
    const auth = await requireUserManagerSession()
    if ('response' in auth) return auth.response

    const body = await request.json()
    const parsed = createUserSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Données invalides' }, { status: 400 })
    }
    const { email, password, name, role, actif } = parsed.data

    const normalizedEmail = email.trim().toLowerCase()
    const trimmedName = name.trim()
    const dbRole = mapRoleToDb(role)

    const { data, error } = await auth.serverClient.rpc('create_staff_user', {
      p_email: normalizedEmail,
      p_password: password,
      p_name: trimmedName,
      p_role: dbRole,
    })

    if (error) {
      return NextResponse.json({ error: error.message ?? 'Création impossible' }, { status: 400 })
    }

    const created = Array.isArray(data) ? data[0] : data
    if (!created?.id) {
      return NextResponse.json({ error: 'Création impossible' }, { status: 400 })
    }

    if (actif === false) {
      const { error: actifError } = await auth.serverClient.rpc('update_staff_user', {
        p_id: created.id,
        p_name: trimmedName,
        p_role: dbRole,
        p_actif: false,
      })
      if (actifError) {
        return NextResponse.json({ error: actifError.message ?? 'Création partielle : actif non mis à jour' }, { status: 400 })
      }
    }

    return NextResponse.json({
      id: created.id,
      email: created.email ?? normalizedEmail,
      name: created.name ?? trimmedName,
      role: mapRoleFromDb(created.role ?? dbRole),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur serveur'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await requireUserManagerSession()
    if ('response' in auth) return auth.response

    const body = await request.json()
    const parsed = updateUserSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Données invalides' }, { status: 400 })
    }
    const { id, name, role, actif, password } = parsed.data

    const { data: targetProfile } = await auth.serverClient
      .from('profiles')
      .select('role')
      .eq('id', id)
      .maybeSingle()

    if (!targetProfile) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
    }
    if (targetProfile.role === SUPER_ADMIN_ROLE) {
      return NextResponse.json(
        { error: 'Le compte super administrateur ne peut pas être modifié via cette interface' },
        { status: 403 },
      )
    }

    const trimmedPassword = password?.trim()
    if (trimmedPassword && trimmedPassword.length < 8) {
      return NextResponse.json(
        { error: 'Le mot de passe doit comporter au moins 8 caractères' },
        { status: 400 },
      )
    }

    const dbRole = mapRoleToDb(role)
    const { data, error } = await auth.serverClient.rpc('update_staff_user', {
      p_id: id,
      p_name: name.trim(),
      p_role: dbRole,
      p_actif: actif,
      ...(trimmedPassword ? { p_password: trimmedPassword } : {}),
    })

    if (error) {
      return NextResponse.json({ error: error.message ?? 'Mise à jour impossible' }, { status: 400 })
    }

    const updated = Array.isArray(data) ? data[0] : data
    if (!updated) {
      return NextResponse.json({ error: 'Mise à jour impossible' }, { status: 400 })
    }

    return NextResponse.json({
      id: updated.id,
      email: updated.email,
      name: updated.name,
      role: mapRoleFromDb(updated.role ?? ''),
      actif: updated.actif,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur serveur'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await requireUserManagerSession()
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

    const { data: targetProfile } = await auth.serverClient
      .from('profiles')
      .select('role')
      .eq('id', id)
      .maybeSingle()

    if (!targetProfile) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
    }
    if (targetProfile.role === SUPER_ADMIN_ROLE) {
      return NextResponse.json(
        { error: 'Le compte super administrateur ne peut pas être supprimé via cette interface' },
        { status: 403 },
      )
    }

    const { error } = await auth.serverClient.rpc('delete_staff_user', { p_id: id })
    if (error) {
      return NextResponse.json({ error: error.message ?? 'Suppression impossible' }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur serveur'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
