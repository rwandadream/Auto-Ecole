import { create } from 'zustand'

export type ViewKey =
  // Admin views
  | 'dashboard'
  | 'eleves'
  | 'scanner'
  | 'moniteurs'
  | 'vehicules'
  | 'inspecteurs'
  | 'planning'
  | 'examens'
  | 'bordereaux'
  | 'facturation'
  | 'comptabilite'
  | 'parametres'
  | 'audit'
  | 'assistance'
  | 'deconnexion'
  // Student portal views
  | 'student-dashboard'
  | 'student-planning'
  | 'student-factures'
  | 'student-profil'

interface NavState {
  activeView: ViewKey
  collapsed: boolean
  setActiveView: (view: ViewKey) => void
  toggleCollapsed: () => void
}

export const useNavStore = create<NavState>((set) => ({
  activeView: 'dashboard',
  collapsed: false,
  setActiveView: (view) => set({ activeView: view }),
  toggleCollapsed: () => set((s) => ({ collapsed: !s.collapsed })),
}))
