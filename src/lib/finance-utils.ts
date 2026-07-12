import type { Facture } from '@/lib/domain/types'

/** Élève soldé = aucune facture avec reste > 0. */
export function isEleveSolde(eleveCode: string, factures: Facture[]): boolean {
  const related = factures.filter((f) => f.eleveCode === eleveCode)
  if (related.length === 0) return true
  return related.every((f) => f.reste <= 0)
}

/** Solde restant total pour un élève. */
export function soldeEleve(eleveCode: string, factures: Facture[]): number {
  return factures
    .filter((f) => f.eleveCode === eleveCode)
    .reduce((sum, f) => sum + Math.max(0, f.reste), 0)
}
