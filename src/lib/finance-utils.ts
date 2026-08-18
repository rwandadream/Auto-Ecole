import type { Facture, Paiement, StatutFacture } from '@/lib/domain/types'
import { formatXOFFcfa } from '@/lib/format'

/** Tolérance pour arrondis monétaires (F CFA entiers → 0,5 F). */
const MONEY_EPS = 0.5

export function normalizeMoney(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.round(value * 100) / 100
}

/**
 * Statut facture unique :
 * - Non payée  = payé == 0
 * - Partielle  = 0 < payé < montant
 * - Payée      = payé >= montant
 */
export function computeStatutFacture(paye: number, montant: number): StatutFacture {
  const p = normalizeMoney(paye)
  const m = normalizeMoney(montant)
  if (p <= MONEY_EPS) return 'Non payée'
  if (p + MONEY_EPS >= m) return 'Payée'
  return 'Partielle'
}

export function computeReste(montant: number, paye: number): number {
  return Math.max(0, normalizeMoney(montant) - normalizeMoney(paye))
}

/** Référence de paiement séquentielle et croissante : PAY-AAAA-0001, PAY-AAAA-0002, ... */
export function genPaiementReference(existing: Paiement[]): string {
  const year = new Date().getFullYear()
  const prefix = `PAY-${year}-`
  const max = existing
    .filter((p) => p.reference.startsWith(prefix))
    .map((p) => parseInt(p.reference.slice(prefix.length), 10))
    .filter((n) => !isNaN(n))
    .reduce((a, b) => Math.max(a, b), 0)
  return `${prefix}${String(max + 1).padStart(4, '0')}`
}

/** Factures liées à un élève. */
export function facturesEleve(eleveCode: string, factures: Facture[]): Facture[] {
  return factures.filter((f) => f.eleveCode === eleveCode)
}

/** Total dû (somme des montants facture). */
export function montantDuEleve(eleveCode: string, factures: Facture[]): number {
  return facturesEleve(eleveCode, factures).reduce((sum, f) => sum + normalizeMoney(f.montant), 0)
}

/** Total déjà payé (somme des payé facture). */
export function montantPayeEleve(eleveCode: string, factures: Facture[]): number {
  return facturesEleve(eleveCode, factures).reduce((sum, f) => sum + normalizeMoney(f.paye), 0)
}

/** Solde restant total pour un élève (basé sur reste déjà calculé, sinon montant−payé). */
export function soldeEleve(eleveCode: string, factures: Facture[]): number {
  return facturesEleve(eleveCode, factures).reduce((sum, f) => {
    const reste =
      typeof f.reste === 'number' ? Math.max(0, normalizeMoney(f.reste)) : computeReste(f.montant, f.paye)
    return sum + reste
  }, 0)
}

/**
 * Formatage unique du solde élève, utilisé partout (Élèves, Facturation,
 * Paiements, espace Directeur, portail Élève, bordereaux) pour éviter tout
 * désaccord entre espaces : "Soldé" si le reste est nul, sinon le montant
 * en FCFA.
 */
export function formatSolde(value: number): string {
  const v = normalizeMoney(value)
  if (v <= MONEY_EPS) return 'Soldé'
  return formatXOFFcfa(v)
}

/**
 * Élève soldé = au moins une facture ET aucune avec reste > 0.
 * Sans facture → non soldé (non éligible examens).
 */
export function isEleveSolde(eleveCode: string, factures: Facture[]): boolean {
  const related = facturesEleve(eleveCode, factures)
  if (related.length === 0) return false
  return soldeEleve(eleveCode, factures) <= MONEY_EPS
}

/** Au moins un versement encaissé (partiel ou total). */
export function isElevePartiellementPaye(eleveCode: string, factures: Facture[]): boolean {
  return montantPayeEleve(eleveCode, factures) > MONEY_EPS
}

export type TypeExamenPaiement = 'Code' | 'Conduite'

export const MSG_SOLDE_CONDUITE =
  "Solde non réglé — impossible d'inscrire à l'examen de conduite"

/**
 * - Code : autorisé dès qu'un paiement > 0 (partiel ou soldé)
 * - Conduite : autorisé seulement si soldé (reste == 0)
 *
 * Duplique volontairement la règle du trigger DB assert_examen_paiement()
 * (supabase/20260728000002_examen_paiement_guards.sql) pour un feedback UI
 * immédiat — la DB reste le vrai garde-fou. Les deux utilisent désormais le
 * même clamp par facture (voir eleves_solde / eleve_solde_restant()) : garder
 * les deux synchronisés si la formule change un jour.
 */
export function canInscrireExamen(
  type: TypeExamenPaiement,
  eleveCode: string,
  factures: Facture[],
): { ok: boolean; message?: string } {
  if (type === 'Code') {
    if (!isElevePartiellementPaye(eleveCode, factures)) {
      return {
        ok: false,
        message: "Aucun paiement enregistré — impossible d'inscrire à l'examen du code.",
      }
    }
    return { ok: true }
  }

  if (!isEleveSolde(eleveCode, factures)) {
    const reste = soldeEleve(eleveCode, factures)
    return {
      ok: false,
      message: reste > 0 ? `${MSG_SOLDE_CONDUITE} (reste ${Math.round(reste)} FCFA).` : MSG_SOLDE_CONDUITE,
    }
  }
  return { ok: true }
}

/** Statut agrégé élève pour affichage (liste / fiche). */
export function statutPaiementEleve(eleveCode: string, factures: Facture[]): StatutFacture {
  const related = facturesEleve(eleveCode, factures)
  if (related.length === 0) return 'Non payée'
  const paye = montantPayeEleve(eleveCode, factures)
  const du = montantDuEleve(eleveCode, factures)
  return computeStatutFacture(paye, du)
}
