import type { Role } from '@/lib/domain/types'

const FROM_DB: Record<string, Role> = {
  super_administrateur: 'Super Administrateur',
  directeur: 'Directeur',
  responsable_adjoint: 'Responsable adjoint',
  comptable: 'Comptable',
  moniteur: 'Moniteur',
  secretaire: 'Secrétaire',
  // Anciens noms conservés pour rétrocompatibilité pendant la transition
  administrateur_principal: 'Directeur',
  administrateur_secondaire: 'Responsable adjoint',
  conseiller: 'Secrétaire',
}

export function mapRoleFromDb(role: string): Role {
  const mapped = FROM_DB[role]
  if (!mapped) console.warn(`[roles] Rôle inconnu en BDD : "${role}" — fallback Secrétaire`)
  return mapped ?? 'Secrétaire'
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
