import { describe, expect, it } from 'vitest'
import type { Facture } from '@/lib/domain/types'
import {
  canInscrireExamen,
  computeReste,
  computeStatutFacture,
  formatSolde,
  isElevePartiellementPaye,
  isEleveSolde,
  MSG_SOLDE_CONDUITE,
  soldeEleve,
  statutPaiementEleve,
} from '@/lib/finance-utils'

function fac(partial: Partial<Facture> & Pick<Facture, 'eleveCode' | 'montant' | 'paye'>): Facture {
  const reste = computeReste(partial.montant, partial.paye)
  return {
    id: partial.id ?? 'f1',
    numero: partial.numero ?? 'FAC-1',
    eleve: partial.eleve ?? 'Test',
    eleveCode: partial.eleveCode,
    formation: partial.formation ?? 'Pack B',
    inscriptionId: partial.inscriptionId ?? '',
    montant: partial.montant,
    paye: partial.paye,
    reste: partial.reste ?? reste,
    statut: partial.statut ?? computeStatutFacture(partial.paye, partial.montant),
    dateEmission: partial.dateEmission ?? '2026-01-01',
  }
}

describe('computeStatutFacture', () => {
  it('Non payée si payé == 0', () => {
    expect(computeStatutFacture(0, 350_000)).toBe('Non payée')
  })

  it('Partielle si 0 < payé < montant', () => {
    expect(computeStatutFacture(50_000, 350_000)).toBe('Partielle')
  })

  it('Payée si payé == montant (exact)', () => {
    expect(computeStatutFacture(350_000, 350_000)).toBe('Payée')
  })

  it('Payée si paiement en trop', () => {
    expect(computeStatutFacture(400_000, 350_000)).toBe('Payée')
  })

  it('gère les arrondis flottants proches de zéro', () => {
    expect(computeStatutFacture(0.2, 100)).toBe('Non payée')
    expect(computeStatutFacture(99.7, 100)).toBe('Payée')
  })
})

describe('computeReste', () => {
  it('ne descend jamais sous zéro', () => {
    expect(computeReste(100, 150)).toBe(0)
  })

  it('calcule le reste classique', () => {
    expect(computeReste(350_000, 50_000)).toBe(300_000)
  })
})

describe('formatSolde', () => {
  it('affiche "Soldé" quand le solde est nul (montant dû == payé)', () => {
    expect(formatSolde(computeReste(100_000, 100_000))).toBe('Soldé')
    expect(formatSolde(0)).toBe('Soldé')
  })

  it('affiche le montant restant en FCFA pour un paiement partiel', () => {
    expect(formatSolde(computeReste(100_000, 50_000))).toBe(`50${' '}000 F CFA`)
  })

  it('affiche le montant total en FCFA quand aucun paiement n\'a été fait', () => {
    expect(formatSolde(computeReste(100_000, 0))).toBe(`100${' '}000 F CFA`)
  })
})

describe('éligibilité élève / examens', () => {
  const code = 'EL-1'

  it('sans facture → non soldé, non partiel', () => {
    expect(isEleveSolde(code, [])).toBe(false)
    expect(isElevePartiellementPaye(code, [])).toBe(false)
    expect(canInscrireExamen('Code', code, []).ok).toBe(false)
    expect(canInscrireExamen('Conduite', code, []).ok).toBe(false)
  })

  it('impayé → ni code ni conduite', () => {
    const factures = [fac({ eleveCode: code, montant: 280_000, paye: 0 })]
    expect(statutPaiementEleve(code, factures)).toBe('Non payée')
    expect(canInscrireExamen('Code', code, factures).ok).toBe(false)
    expect(canInscrireExamen('Conduite', code, factures).ok).toBe(false)
  })

  it('partiellement payé → code OK, conduite refusée', () => {
    const factures = [fac({ eleveCode: code, montant: 280_000, paye: 50_000 })]
    expect(statutPaiementEleve(code, factures)).toBe('Partielle')
    expect(canInscrireExamen('Code', code, factures).ok).toBe(true)
    const conduite = canInscrireExamen('Conduite', code, factures)
    expect(conduite.ok).toBe(false)
    expect(conduite.message).toContain(MSG_SOLDE_CONDUITE)
  })

  it('soldé → code et conduite OK', () => {
    const factures = [fac({ eleveCode: code, montant: 280_000, paye: 280_000 })]
    expect(isEleveSolde(code, factures)).toBe(true)
    expect(soldeEleve(code, factures)).toBe(0)
    expect(canInscrireExamen('Code', code, factures).ok).toBe(true)
    expect(canInscrireExamen('Conduite', code, factures).ok).toBe(true)
  })

  it('agrège plusieurs factures pour le solde', () => {
    const factures = [
      fac({ id: 'a', eleveCode: code, montant: 100_000, paye: 100_000 }),
      fac({ id: 'b', eleveCode: code, montant: 50_000, paye: 20_000 }),
    ]
    expect(soldeEleve(code, factures)).toBe(30_000)
    expect(statutPaiementEleve(code, factures)).toBe('Partielle')
    expect(canInscrireExamen('Conduite', code, factures).ok).toBe(false)
  })
})
