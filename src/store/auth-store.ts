import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { createClient } from '@/lib/supabase/client'
import { assertSupabaseConfigured } from '@/lib/supabase/config'
import { mapEleveStatutFromDb } from '@/lib/supabase/mappers'
import { mapRoleFromDb } from '@/lib/supabase/roles'
import { syncDataFromSupabase, syncDataForEleve } from '@/lib/supabase/sync-data'
import { setCurrentAuditUser } from '@/lib/audit-user'
import { AUTH_STORE_KEY } from '@/store/persist-config'

export type UserMode = 'admin' | 'eleve'

export type AdminUser = {
  mode: 'admin'
  id: string
  name: string
  email: string
  role: string
}

export type EleveUser = {
  mode: 'eleve'
  code: string
  nomComplet: string
  telephone: string
  email: string
  typePermis: string
  statut: string
}

export type AuthUser = AdminUser | EleveUser

interface AuthState {
  isAuthenticated: boolean
  user: AuthUser | null
  loginAdmin: (email: string, password: string) => Promise<boolean>
  loginEleve: (code: string, telephone: string) => Promise<boolean>
  restoreSupabaseSession: () => Promise<boolean>
  logout: () => Promise<void>
}

function syncAuditUser(user: AuthUser | null) {
  if (!user) {
    setCurrentAuditUser('Système')
    return
  }
  if (user.mode === 'admin') {
    setCurrentAuditUser(user.name)
  } else {
    setCurrentAuditUser(user.nomComplet)
  }
}

function setAdminUser(user: AdminUser) {
  syncAuditUser(user)
  return { isAuthenticated: true, user }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,

      loginAdmin: async (email, password) => {
        assertSupabaseConfigured()
        const supabase = createClient()
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })

        if (error || !data.user) {
          return false
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id,name,email,role,actif')
          .eq('id', data.user.id)
          .maybeSingle()

        if (profileError || !profile || profile.actif === false) {
          await supabase.auth.signOut()
          return false
        }

        const user: AdminUser = {
          mode: 'admin',
          id: profile.id,
          name: profile.name ?? '',
          email: profile.email,
          role: mapRoleFromDb(profile.role ?? ''),
        }
        set(setAdminUser(user))
        await syncDataFromSupabase()
        return true
      },

      loginEleve: async (code, telephone) => {
        assertSupabaseConfigured()
        const supabase = createClient()
        const { data, error } = await supabase.rpc('login_eleve_portail', {
          p_code: code.trim(),
          p_telephone: telephone.trim(),
        })

        const row = Array.isArray(data) ? data[0] : data
        if (error || !row) {
          return false
        }

        const user: EleveUser = {
          mode: 'eleve',
          code: row.code,
          nomComplet: `${row.prenom} ${row.nom}`,
          telephone: row.telephone,
          email: row.email ?? '',
          typePermis: row.type_permis,
          statut: mapEleveStatutFromDb(row.statut),
        }
        syncAuditUser(user)
        set({ isAuthenticated: true, user })
        await syncDataForEleve(row.code, row.telephone)
        return true
      },

      restoreSupabaseSession: async () => {
        assertSupabaseConfigured()
        const supabase = createClient()
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!authUser) return false

        const { data: profile } = await supabase
          .from('profiles')
          .select('id,name,email,role,actif')
          .eq('id', authUser.id)
          .maybeSingle()

        if (!profile || profile.actif === false) {
          await supabase.auth.signOut()
          return false
        }

        const user: AdminUser = {
          mode: 'admin',
          id: profile.id,
          name: profile.name ?? '',
          email: profile.email,
          role: mapRoleFromDb(profile.role ?? ''),
        }

        if (!get().isAuthenticated) {
          set(setAdminUser(user))
        }

        await syncDataFromSupabase()
        return true
      },

      logout: async () => {
        assertSupabaseConfigured()
        const supabase = createClient()
        await supabase.auth.signOut()
        syncAuditUser(null)
        set({ isAuthenticated: false, user: null })
      },
    }),
    {
      name: AUTH_STORE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.user?.mode === 'admin') {
          state.user.role = mapRoleFromDb(state.user.role)
        }
        if (state?.user) {
          syncAuditUser(state.user)
        }
      },
    },
  ),
)
