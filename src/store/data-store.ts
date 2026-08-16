import { create } from 'zustand'
import type { DataState } from './store-types'
import { createAdminSlice } from './slices/admin-slice'
import { createResourceSlice } from './slices/resource-slice'
import { createActivitySlice } from './slices/activity-slice'
import { createFinanceSlice } from './slices/finance-slice'

// Re-exports for backward compatibility — all existing imports continue to work
export type { AuditEntry, DataState } from './store-types'
export type {
  CandidatSession,
  Depense,
  Eleve,
  Examen,
  ExamenSession,
  Facture,
  Formation,
  Inspecteur,
  Inscription,
  ModePaiement,
  Moniteur,
  Paiement,
  Permis,
  Profile,
  Seance,
  StatutFacture,
  Vehicule,
  FaqItem,
} from '@/lib/domain/types'

export const useDataStore = create<DataState>()((...a) => ({
  ...createAdminSlice(...a),
  ...createResourceSlice(...a),
  ...createActivitySlice(...a),
  ...createFinanceSlice(...a),
}))

/**
 * Vide toutes les collections en mémoire. Appelé au logout pour éviter
 * qu'une donnée résiduelle (élèves, moniteurs, factures…) d'une session
 * précédente (admin ou portail élève) ne reste lisible dans le même onglet
 * navigateur après reconnexion sous une autre identité.
 */
export function resetDataStore() {
  useDataStore.setState({
    eleves: [],
    moniteurs: [],
    vehicules: [],
    inspecteurs: [],
    permis: [],
    formations: [],
    inscriptions: [],
    seances: [],
    examens: [],
    examenSessions: [],
    factures: [],
    paiements: [],
    depenses: [],
    auditLog: [],
    faq: [],
    profiles: [],
  })
}
