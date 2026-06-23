import type { ViewKey, ParametresTab } from '@/store/nav-store'

export type AppRole =
  | 'Administrateur principal'
  | 'Administrateur secondaire'
  | 'Comptable'
  | 'Moniteur'
  | 'Conseiller'
  | 'Administrateur'

export type AppAction =
  | 'delete_eleve'
  | 'delete_facture'
  | 'delete_depense'
  | 'delete_moniteur'
  | 'delete_vehicule'
  | 'manage_users'
  | 'manage_formations'

const VIEW_ACCESS: Record<ViewKey, AppRole[]> = {
  'moniteur-dashboard': ['Moniteur'],
  dashboard: ['Administrateur principal', 'Administrateur secondaire', 'Comptable', 'Moniteur', 'Conseiller', 'Administrateur'],
  eleves: ['Administrateur principal', 'Administrateur secondaire', 'Moniteur', 'Conseiller', 'Administrateur'],
  'eleve-detail': ['Administrateur principal', 'Administrateur secondaire', 'Moniteur', 'Conseiller', 'Administrateur'],
  'eleve-edit': ['Administrateur principal', 'Administrateur secondaire', 'Moniteur', 'Conseiller', 'Administrateur'],
  'eleve-create': ['Administrateur principal', 'Administrateur secondaire', 'Moniteur', 'Conseiller', 'Administrateur'],
  scanner: ['Administrateur principal', 'Administrateur secondaire', 'Moniteur', 'Conseiller', 'Administrateur'],
  moniteurs: ['Administrateur principal', 'Administrateur secondaire', 'Moniteur', 'Administrateur'],
  vehicules: ['Administrateur principal', 'Administrateur secondaire', 'Moniteur', 'Administrateur'],
  inspecteurs: ['Administrateur principal', 'Administrateur secondaire', 'Moniteur', 'Administrateur'],
  planning: ['Administrateur principal', 'Administrateur secondaire', 'Moniteur', 'Administrateur'],
  examens: ['Administrateur principal', 'Administrateur secondaire', 'Moniteur', 'Administrateur'],
  bordereaux: ['Administrateur principal', 'Administrateur secondaire', 'Comptable', 'Moniteur', 'Administrateur'],
  facturation: ['Administrateur principal', 'Administrateur secondaire', 'Comptable', 'Administrateur'],
  comptabilite: ['Administrateur principal', 'Administrateur secondaire', 'Comptable', 'Administrateur'],
  parametres: ['Administrateur principal', 'Administrateur secondaire', 'Comptable', 'Moniteur', 'Conseiller', 'Administrateur'],
  parrainage: ['Administrateur principal', 'Administrateur secondaire', 'Administrateur'],
  'student-dashboard': ['Administrateur principal'],
  'student-planning': ['Administrateur principal'],
  'student-factures': ['Administrateur principal'],
  'student-profil': ['Administrateur principal'],
}

const ACTION_ACCESS: Record<AppAction, AppRole[]> = {
  delete_eleve: ['Administrateur principal', 'Administrateur secondaire', 'Administrateur'],
  delete_facture: ['Administrateur principal', 'Administrateur secondaire', 'Administrateur'],
  delete_depense: ['Administrateur principal', 'Administrateur secondaire', 'Comptable', 'Administrateur'],
  delete_moniteur: ['Administrateur principal', 'Administrateur secondaire', 'Administrateur'],
  delete_vehicule: ['Administrateur principal', 'Administrateur secondaire', 'Administrateur'],
  manage_users: ['Administrateur principal', 'Administrateur secondaire', 'Administrateur'],
  manage_formations: ['Administrateur principal', 'Administrateur secondaire', 'Administrateur'],
}

function normalizeRole(role: string): AppRole {
  if (role === 'Administrateur') return 'Administrateur principal'
  return role as AppRole
}

export function canAccessView(role: string, view: ViewKey): boolean {
  const r = normalizeRole(role)
  const allowed = VIEW_ACCESS[view]
  return allowed ? allowed.includes(r) : false
}

export function canPerformAction(role: string, action: AppAction): boolean {
  const r = normalizeRole(role)
  return ACTION_ACCESS[action].includes(r)
}

export function getDefaultViewForRole(role: string): ViewKey {
  const r = normalizeRole(role)
  if (r === 'Comptable') return 'facturation'
  if (r === 'Moniteur') return 'moniteur-dashboard'
  if (r === 'Conseiller') return 'eleves'
  return 'dashboard'
}

const ADMIN_PARAMETRES_TABS: ParametresTab[] = ['profil', 'equipe', 'catalogue', 'assistance', 'audit']
const STAFF_PARAMETRES_TABS: ParametresTab[] = ['assistance']

export function canAccessParametresTab(role: string, tab: ParametresTab): boolean {
  const r = normalizeRole(role)
  if (tab === 'assistance') {
    return canAccessView(role, 'parametres')
  }
  if (tab === 'audit') {
    return ['Administrateur principal', 'Administrateur secondaire', 'Administrateur'].includes(r)
  }
  return ['Administrateur principal', 'Administrateur secondaire', 'Administrateur'].includes(r)
}

export function getParametresTabsForRole(role: string): ParametresTab[] {
  const r = normalizeRole(role)
  if (['Administrateur principal', 'Administrateur secondaire', 'Administrateur'].includes(r)) {
    return ADMIN_PARAMETRES_TABS
  }
  if (canAccessView(role, 'parametres')) {
    return STAFF_PARAMETRES_TABS
  }
  return []
}

export function getDefaultParametresTabForRole(role: string): ParametresTab {
  const tabs = getParametresTabsForRole(role)
  return tabs[0] ?? 'assistance'
}
