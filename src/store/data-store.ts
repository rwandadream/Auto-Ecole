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
