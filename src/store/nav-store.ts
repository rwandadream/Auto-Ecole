import { create } from 'zustand'

export type ViewKey =
  // Admin views
  | 'dashboard'
  | 'eleves'
  | 'eleve-detail'
  | 'eleve-edit'
  | 'eleve-create'
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
  // Student portal views
  | 'student-dashboard'
  | 'student-planning'
  | 'student-factures'
  | 'student-profil'

interface NavState {
  activeView: ViewKey
  collapsed: boolean
  mobileNavOpen: boolean
  selectedEleveCode: string | null
  setActiveView: (view: ViewKey) => void
  setselectedEleveCode: (code: string | null) => void
  toggleCollapsed: () => void
  setMobileNavOpen: (open: boolean) => void
  closeMobileNav: () => void
}

export const useNavStore = create<NavState>((set) => ({
  activeView: 'dashboard',
  collapsed: false,
  mobileNavOpen: false,
  selectedEleveCode: null,
  setActiveView: (view) => set({ activeView: view, mobileNavOpen: false }),
  setselectedEleveCode: (code) => set({ selectedEleveCode: code }),
  toggleCollapsed: () => set((s) => ({ collapsed: !s.collapsed })),
  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
  closeMobileNav: () => set({ mobileNavOpen: false }),
}))
