import { create } from 'zustand'

export type ViewKey =
  // Admin views
  | 'dashboard'
  | 'moniteur-dashboard'
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
  | 'parrainage'
  // Student portal views
  | 'student-dashboard'
  | 'student-planning'
  | 'student-factures'
  | 'student-profil'

export type ParametresTab = 'profil' | 'equipe' | 'catalogue' | 'assistance' | 'audit'

interface NavState {
  activeView: ViewKey
  collapsed: boolean
  mobileNavOpen: boolean
  selectedEleveCode: string | null
  parametresTab: ParametresTab
  setActiveView: (view: ViewKey) => void
  setSelectedEleveCode: (code: string | null) => void
  toggleCollapsed: () => void
  setMobileNavOpen: (open: boolean) => void
  closeMobileNav: () => void
  setParametresTab: (tab: ParametresTab) => void
  openParametres: (tab?: ParametresTab) => void
}

export const useNavStore = create<NavState>((set) => ({
  activeView: 'dashboard',
  collapsed: false,
  mobileNavOpen: false,
  selectedEleveCode: null,
  parametresTab: 'profil',
  setActiveView: (view) => set({ activeView: view, mobileNavOpen: false }),
  setSelectedEleveCode: (code) => set({ selectedEleveCode: code }),
  toggleCollapsed: () => set((s) => ({ collapsed: !s.collapsed })),
  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
  closeMobileNav: () => set({ mobileNavOpen: false }),
  setParametresTab: (tab) => set({ parametresTab: tab }),
  openParametres: (tab = 'profil') =>
    set({ activeView: 'parametres', parametresTab: tab, mobileNavOpen: false }),
}))
