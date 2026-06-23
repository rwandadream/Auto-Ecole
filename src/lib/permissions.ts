import type { ViewKey, ParametresTab } from '@/store/nav-store'
import { mapRoleFromDb } from '@/lib/supabase/roles'

export type AppRole =
  | 'Super Administrateur'
  | 'Directeur'
  | 'Responsable adjoint'
  | 'Comptable'
  | 'Moniteur'
  | 'Secrétaire'
  // Alias legacy (rétrocompatibilité pendant transition)
  | 'Administrateur'
  | 'Administrateur principal'
  | 'Administrateur secondaire'
  | 'Conseiller'

export type AppAction =
  | 'delete_eleve'
  | 'delete_facture'
  | 'delete_depense'
  | 'delete_moniteur'
  | 'delete_vehicule'
  | 'manage_users'
  | 'manage_formations'

// ─────────────────────────────────────────────────────────────────────────────
// Matrice d'accès aux vues
// ─────────────────────────────────────────────────────────────────────────────
const VIEW_ACCESS: Record<ViewKey, AppRole[]> = {
  // Tableau de bord : tout le monde
  dashboard: ['Super Administrateur', 'Directeur', 'Responsable adjoint', 'Comptable', 'Moniteur', 'Secrétaire'],
  // Dashboard moniteur : super admin + moniteur uniquement
  'moniteur-dashboard': ['Super Administrateur', 'Moniteur'],
  // Élèves : tout le monde sauf comptable
  eleves: ['Super Administrateur', 'Directeur', 'Responsable adjoint', 'Moniteur', 'Secrétaire'],
  'eleve-detail': ['Super Administrateur', 'Directeur', 'Responsable adjoint', 'Moniteur', 'Secrétaire'],
  'eleve-edit': ['Super Administrateur', 'Directeur', 'Responsable adjoint', 'Moniteur', 'Secrétaire'],
  'eleve-create': ['Super Administrateur', 'Directeur', 'Responsable adjoint', 'Moniteur', 'Secrétaire'],
  scanner: ['Super Administrateur', 'Directeur', 'Responsable adjoint', 'Moniteur', 'Secrétaire'],
  // Moniteurs / Véhicules / Inspecteurs : direction + moniteur
  moniteurs: ['Super Administrateur', 'Directeur', 'Responsable adjoint', 'Moniteur'],
  vehicules: ['Super Administrateur', 'Directeur', 'Responsable adjoint', 'Moniteur'],
  inspecteurs: ['Super Administrateur', 'Directeur', 'Responsable adjoint', 'Moniteur'],
  // Activité : direction + moniteur (pas secrétaire ni comptable)
  planning: ['Super Administrateur', 'Directeur', 'Responsable adjoint', 'Moniteur'],
  examens: ['Super Administrateur', 'Directeur', 'Responsable adjoint', 'Moniteur'],
  // Finances : direction + comptable
  bordereaux: ['Super Administrateur', 'Directeur', 'Responsable adjoint', 'Comptable', 'Moniteur'],
  facturation: ['Super Administrateur', 'Directeur', 'Responsable adjoint', 'Comptable'],
  comptabilite: ['Super Administrateur', 'Directeur', 'Responsable adjoint', 'Comptable'],
  // Parrainage : direction seulement
  parrainage: ['Super Administrateur', 'Directeur', 'Responsable adjoint'],
  // Paramètres : tout le monde (onglets filtrés ensuite)
  parametres: ['Super Administrateur', 'Directeur', 'Responsable adjoint', 'Comptable', 'Moniteur', 'Secrétaire'],
  // Portail élève (simulation) : super admin + directeur
  'student-dashboard': ['Super Administrateur', 'Directeur'],
  'student-planning': ['Super Administrateur', 'Directeur'],
  'student-factures': ['Super Administrateur', 'Directeur'],
  'student-profil': ['Super Administrateur', 'Directeur'],
}

// ─────────────────────────────────────────────────────────────────────────────
// Actions destructives : SUPER ADMIN EXCLUSIVEMENT
// ─────────────────────────────────────────────────────────────────────────────
const ACTION_ACCESS: Record<AppAction, AppRole[]> = {
  delete_eleve: ['Super Administrateur'],
  delete_facture: ['Super Administrateur'],
  delete_depense: ['Super Administrateur'],
  delete_moniteur: ['Super Administrateur'],
  delete_vehicule: ['Super Administrateur'],
  manage_users: ['Super Administrateur'],
  manage_formations: ['Super Administrateur'],
}

export function normalizeRole(role: string): AppRole {
  return mapRoleFromDb(role) as AppRole
}

export function isSuperAdmin(role: string): boolean {
  return role === 'Super Administrateur'
}

export function isDirecteurOrAbove(role: string): boolean {
  const r = normalizeRole(role)
  return ['Super Administrateur', 'Directeur', 'Responsable adjoint'].includes(r)
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
  if (r === 'Secrétaire') return 'eleves'
  return 'dashboard'
}

const ADMIN_PARAMETRES_TABS: ParametresTab[] = ['profil', 'equipe', 'catalogue', 'assistance', 'audit']
const STAFF_PARAMETRES_TABS: ParametresTab[] = ['profil', 'assistance']

export function canAccessParametresTab(role: string, tab: ParametresTab): boolean {
  const r = normalizeRole(role)
  if (tab === 'assistance' || tab === 'profil') return canAccessView(role, 'parametres')
  if (tab === 'audit') {
    return ['Super Administrateur', 'Directeur', 'Responsable adjoint'].includes(r)
  }
  // equipe, catalogue → direction uniquement
  return ['Super Administrateur', 'Directeur', 'Responsable adjoint'].includes(r)
}

export function getParametresTabsForRole(role: string): ParametresTab[] {
  const r = normalizeRole(role)
  if (['Super Administrateur', 'Directeur', 'Responsable adjoint'].includes(r)) return ADMIN_PARAMETRES_TABS
  if (canAccessView(role, 'parametres')) return STAFF_PARAMETRES_TABS
  return []
}

export function getDefaultParametresTabForRole(role: string): ParametresTab {
  const tabs = getParametresTabsForRole(role)
  return tabs[0] ?? 'assistance'
}
