import { create } from 'zustand'
import { eleves } from '@/lib/mock-data'

export type UserMode = 'admin' | 'eleve'

export type AdminUser = {
  mode: 'admin'
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
  loginAdmin: (email: string, _password: string) => boolean
  loginEleve: (code: string, telephone: string) => boolean
  logout: () => void
}

// Mock admin credentials — any email + password works, but map known team members
const adminProfiles: Record<string, { name: string; role: string }> = {
  'a.diallo@sarahauto.ci': { name: 'Aïcha Diallo', role: 'Administrateur principal' },
  'e.tanoh@sarahauto.ci': { name: 'Tanoh Estelle', role: 'Comptable' },
  'jm.koffi@sarahauto.ci': { name: 'Koffi Jean-Marc', role: 'Moniteur' },
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  loginAdmin: (email, _password) => {
    const profile = adminProfiles[email.toLowerCase()] ?? {
      name: email.split('@')[0],
      role: 'Administrateur',
    }
    set({
      isAuthenticated: true,
      user: {
        mode: 'admin',
        name: profile.name,
        email: email.toLowerCase(),
        role: profile.role,
      },
    })
    return true
  },
  loginEleve: (code, telephone) => {
    const eleve = eleves.find(
      (e) => e.code.toLowerCase() === code.toLowerCase() && e.telephone.replace(/\s/g, '') === telephone.replace(/\s/g, '')
    )
    if (!eleve) return false
    set({
      isAuthenticated: true,
      user: {
        mode: 'eleve',
        code: eleve.code,
        nomComplet: `${eleve.prenom} ${eleve.nom}`,
        telephone: eleve.telephone,
        email: eleve.email,
        typePermis: eleve.typePermis,
        statut: eleve.statut,
      },
    })
    return true
  },
  logout: () => set({ isAuthenticated: false, user: null }),
}))
