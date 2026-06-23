import type { StateCreator } from 'zustand'
import type { DataState } from '../store-types'
import {
  makeEntityId,
  persistDepense,
  persistFacture,
  persistPaiement,
} from '@/lib/supabase/store-bridge'
import { formatXOF } from '@/lib/format'
import { snapshotRecord } from '@/lib/snapshot'
import type { Depense, Facture, ModePaiement, Paiement, StatutFacture } from '@/lib/domain/types'

function uid(prefix: string) {
  return makeEntityId(prefix)
}

function genFactureNumero(existing: Facture[]) {
  const year = new Date().getFullYear()
  const max = existing
    .filter((f) => f.numero.startsWith(`FAC-${year}-`))
    .map((f) => parseInt(f.numero.split('-')[2] || '0', 10))
    .reduce((a, b) => Math.max(a, b), 0)
  return `FAC-${year}-${String(max + 1).padStart(4, '0')}`
}

function computeStatutFacture(paye: number, montant: number): StatutFacture {
  if (paye <= 0) return 'Non payée'
  if (paye >= montant) return 'Payée'
  return 'Partielle'
}

export type FinanceSlice = {
  factures: Facture[]
  paiements: Paiement[]
  depenses: Depense[]

  addFacture: (data: {
    eleve: string
    eleveCode: string
    formation: string
    montant: number
    dateEmission: string
    inscriptionId?: string
  }) => Facture
  updateFacture: (id: string, patch: Partial<Facture>) => void
  deleteFacture: (id: string) => void

  addPaiement: (data: {
    factureId: string
    eleve: string
    montant: number
    modePaiement: ModePaiement
    reference: string
    datePaiement: string
  }) => void

  addDepense: (data: Omit<Depense, 'id'>) => void
  updateDepense: (id: string, patch: Partial<Depense>) => void
  deleteDepense: (id: string) => void
}

export const createFinanceSlice: StateCreator<DataState, [], [], FinanceSlice> = (set, get) => ({
  factures: [],
  paiements: [],
  depenses: [],

  addFacture: (data) => {
    const numero = genFactureNumero(get().factures)
    const newF: Facture = {
      id: uid('fac'),
      numero,
      eleve: data.eleve,
      eleveCode: data.eleveCode,
      formation: data.formation,
      montant: data.montant,
      paye: 0,
      reste: data.montant,
      statut: 'Non payée',
      dateEmission: data.dateEmission,
      inscriptionId: data.inscriptionId ?? '',
    } as Facture
    set((s) => ({ factures: [newF, ...s.factures] }))
    get().logAction('INSERT', 'factures', newF.id, `Émission de la facture ${numero} pour ${data.eleve}`, undefined, snapshotRecord(newF))
    persistFacture(newF, get().eleves, 'create', () =>
      set((s) => ({ factures: s.factures.filter((f) => f.id !== newF.id) })),
    )
    return newF
  },

  updateFacture: (id, patch) => {
    const old = get().factures.find((f) => f.id === id)
    if (!old) return
    const updated = { ...old, ...patch }
    set((s) => ({ factures: s.factures.map((f) => (f.id === id ? updated : f)) }))
    get().logAction('UPDATE', 'factures', id, 'Modification de la facture', snapshotRecord(old), snapshotRecord(updated))
    persistFacture(updated, get().eleves, 'update', () =>
      set((s) => ({ factures: s.factures.map((f) => (f.id === id ? old : f)) })),
    )
  },

  deleteFacture: (id) => {
    const old = get().factures.find((f) => f.id === id)
    if (!old) return
    const removedPaiements = get().paiements.filter((p) => p.factureId === id)
    set((s) => ({
      factures: s.factures.filter((f) => f.id !== id),
      paiements: s.paiements.filter((p) => p.factureId !== id),
    }))
    get().logAction('DELETE', 'factures', id, 'Suppression de la facture', snapshotRecord(old))
    persistFacture(old, get().eleves, 'delete', () =>
      set((s) => ({
        factures: [...s.factures, old],
        paiements: [...s.paiements, ...removedPaiements],
      })),
    )
  },

  addPaiement: (data) => {
    const factureRecord = get().factures.find((f) => f.id === data.factureId)
    const newP: Paiement = {
      ...data,
      factureId: data.factureId,
      facture: factureRecord?.numero ?? data.factureId,
      id: uid('pa'),
    } as Paiement
    set((s) => {
      const factures = s.factures.map((f) => {
        if (f.id === data.factureId) {
          const nouveauPaye = f.paye + data.montant
          const nouveauReste = Math.max(0, f.montant - nouveauPaye)
          return { ...f, paye: nouveauPaye, reste: nouveauReste, statut: computeStatutFacture(nouveauPaye, f.montant) }
        }
        return f
      })
      return { paiements: [newP, ...s.paiements], factures }
    })
    get().logAction('INSERT', 'paiements', newP.id, `Encaissement de ${formatXOF(data.montant)} pour ${data.eleve}`, undefined, snapshotRecord(newP))
    persistPaiement(data.factureId, data.montant, data.modePaiement, data.reference, () => {
      set((s) => ({
        paiements: s.paiements.filter((p) => p.id !== newP.id),
        factures: s.factures.map((f) => (f.id === data.factureId ? factureRecord ?? f : f)),
      }))
    })
  },

  addDepense: (data) => {
    const newD: Depense = { ...data, id: uid('d'), justificatif: data.justificatif ?? '' } as Depense
    set((s) => ({ depenses: [newD, ...s.depenses] }))
    get().logAction('INSERT', 'depenses', newD.id, `Dépense ${data.categorie}: ${data.description}`, undefined, snapshotRecord(newD))
    persistDepense(newD, get().vehicules, 'create', () =>
      set((s) => ({ depenses: s.depenses.filter((d) => d.id !== newD.id) })),
    )
  },

  updateDepense: (id, patch) => {
    const old = get().depenses.find((d) => d.id === id)
    if (!old) return
    const updated = { ...old, ...patch }
    set((s) => ({ depenses: s.depenses.map((d) => (d.id === id ? updated : d)) }))
    get().logAction('UPDATE', 'depenses', id, 'Modification de la dépense', snapshotRecord(old), snapshotRecord(updated))
    persistDepense(updated, get().vehicules, 'update', () =>
      set((s) => ({ depenses: s.depenses.map((d) => (d.id === id ? old : d)) })),
    )
  },

  deleteDepense: (id) => {
    const old = get().depenses.find((d) => d.id === id)
    if (!old) return
    set((s) => ({ depenses: s.depenses.filter((d) => d.id !== id) }))
    get().logAction('DELETE', 'depenses', id, 'Suppression de la dépense', snapshotRecord(old))
    persistDepense(old, get().vehicules, 'delete', () =>
      set((s) => ({ depenses: [...s.depenses, old] })),
    )
  },
})
