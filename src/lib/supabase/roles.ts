import type { Role } from '@/lib/domain/types'

const FROM_DB: Record<string, Role> = {
  administrateur_principal: 'Administrateur principal',
  administrateur_secondaire: 'Administrateur secondaire',
  comptable: 'Comptable',
  moniteur: 'Moniteur',
  conseiller: 'Conseiller',
}

export function mapRoleFromDb(role: string): Role {
  return FROM_DB[role] ?? 'Conseiller'
}

export function mapRoleToDb(role: string): string {
  const normalized = role
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '_')
  if (normalized === 'administrateur') return 'administrateur_principal'
  return normalized
}
