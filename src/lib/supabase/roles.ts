import type { Role } from '@/lib/domain/types'

const FROM_DB: Record<string, Role> = {
  super_administrateur: 'Super Administrateur',
  directeur: 'Directeur',
  responsable_adjoint: 'Responsable adjoint',
  comptable: 'Comptable',
  moniteur: 'Moniteur',
  secretaire: 'Secrétaire',
  // Anciens noms conservés pour rétrocompatibilité pendant la transition
  administrateur: 'Directeur',
  administrateur_principal: 'Directeur',
  administrateur_secondaire: 'Responsable adjoint',
  conseiller: 'Secrétaire',
}

const DISPLAY_NAMES: Record<string, Role> = {
  'Super Administrateur': 'Super Administrateur',
  Directeur: 'Directeur',
  'Responsable adjoint': 'Responsable adjoint',
  Comptable: 'Comptable',
  Moniteur: 'Moniteur',
  Secrétaire: 'Secrétaire',
  Administrateur: 'Directeur',
  'Administrateur principal': 'Directeur',
  'Administrateur Principal': 'Directeur',
  'Administrateur secondaire': 'Responsable adjoint',
  Conseiller: 'Secrétaire',
}

export function mapRoleFromDb(role: string | null | undefined): Role {
  const trimmed = (role ?? '').trim()
  if (!trimmed) return 'Secrétaire'
  return FROM_DB[trimmed] ?? DISPLAY_NAMES[trimmed] ?? 'Secrétaire'
}

export function mapRoleToDb(role: string): string {
  const map: Record<string, string> = {
    'Super Administrateur': 'super_administrateur',
    'Directeur': 'directeur',
    'Responsable adjoint': 'responsable_adjoint',
    'Comptable': 'comptable',
    'Moniteur': 'moniteur',
    'Secrétaire': 'secretaire',
    // Anciens noms (rétrocompatibilité)
    'Administrateur principal': 'directeur',
    'Administrateur secondaire': 'responsable_adjoint',
    'Conseiller': 'secretaire',
    'Administrateur': 'directeur',
  }
  return map[role] ?? role.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, '_')
}
