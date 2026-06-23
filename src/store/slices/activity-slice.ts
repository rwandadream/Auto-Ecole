import type { StateCreator } from 'zustand'
import type { DataState } from '../store-types'
import {
  makeEntityId,
  persistExamen,
  persistExamenSession,
  persistSeance,
} from '@/lib/supabase/store-bridge'
import { snapshotRecord } from '@/lib/snapshot'
import { DEFAULT_LIEU_RDV } from '@/lib/domain/constants'
import type { CandidatSession, Examen, ExamenSession, Seance } from '@/lib/domain/types'

function uid(prefix: string) {
  return makeEntityId(prefix)
}

export type ActivitySlice = {
  seances: Seance[]
  examens: Examen[]
  examenSessions: ExamenSession[]

  addSeance: (data: Omit<Seance, 'id'>) => void
  updateSeance: (id: string, patch: Partial<Seance>) => void
  deleteSeance: (id: string) => void

  addExamen: (data: Omit<Examen, 'id'>) => void
  updateExamen: (id: string, patch: Partial<Examen>) => void
  deleteExamen: (id: string) => void

  addExamenSession: (data: Omit<ExamenSession, 'id' | 'numeroBordereau'>) => void
  updateSessionResultats: (sessionId: string, candidats: CandidatSession[]) => void
  deleteExamenSession: (id: string) => void
}

export const createActivitySlice: StateCreator<DataState, [], [], ActivitySlice> = (set, get) => ({
  seances: [],
  examens: [],
  examenSessions: [],

  addSeance: (data) => {
    const newS: Seance = {
      ...data,
      lieuRdv: data.lieuRdv ?? DEFAULT_LIEU_RDV,
      moniteurId: data.moniteurId ?? '',
      vehiculeId: data.vehiculeId ?? '',
      id: uid('s'),
    } as Seance
    set((s) => ({ seances: [newS, ...s.seances] }))
    get().logAction('INSERT', 'seances', newS.id, `Planification d'une séance pour ${newS.eleve}`, undefined, snapshotRecord(newS))
    const state = get()
    persistSeance(newS, state.eleves, state.moniteurs, state.vehicules, 'create', () =>
      set((s) => ({ seances: s.seances.filter((se) => se.id !== newS.id) })),
    )
  },

  updateSeance: (id, patch) => {
    const old = get().seances.find((se) => se.id === id)
    if (!old) return
    const updated = { ...old, ...patch }
    set((s) => ({ seances: s.seances.map((se) => (se.id === id ? updated : se)) }))
    get().logAction('UPDATE', 'seances', id, 'Mise à jour de la séance', snapshotRecord(old), snapshotRecord(updated))
    const state = get()
    persistSeance(updated, state.eleves, state.moniteurs, state.vehicules, 'update', () =>
      set((s) => ({ seances: s.seances.map((se) => (se.id === id ? old : se)) })),
    )
  },

  deleteSeance: (id) => {
    const old = get().seances.find((se) => se.id === id)
    if (!old) return
    set((s) => ({ seances: s.seances.filter((se) => se.id !== id) }))
    get().logAction('DELETE', 'seances', id, 'Suppression de la séance', snapshotRecord(old))
    const state = get()
    persistSeance(old, state.eleves, state.moniteurs, state.vehicules, 'delete', () =>
      set((s) => ({ seances: [...s.seances, old] })),
    )
  },

  addExamen: (data) => {
    const newE: Examen = { ...data, id: uid('x') } as Examen
    set((s) => ({ examens: [newE, ...s.examens] }))
    get().logAction('INSERT', 'examens', newE.id, `Planification d'un examen pour ${newE.eleve}`, undefined, snapshotRecord(newE))
    const state = get()
    persistExamen(newE, state.eleves, state.inspecteurs, 'create', () =>
      set((s) => ({ examens: s.examens.filter((ex) => ex.id !== newE.id) })),
    )
  },

  updateExamen: (id, patch) => {
    const old = get().examens.find((ex) => ex.id === id)
    if (!old) return
    const updated = { ...old, ...patch }
    set((s) => ({ examens: s.examens.map((ex) => (ex.id === id ? updated : ex)) }))
    get().logAction('UPDATE', 'examens', id, "Mise à jour de l'examen", snapshotRecord(old), snapshotRecord(updated))
    const state = get()
    persistExamen(updated, state.eleves, state.inspecteurs, 'update', () =>
      set((s) => ({ examens: s.examens.map((ex) => (ex.id === id ? old : ex)) })),
    )
  },

  deleteExamen: (id) => {
    const old = get().examens.find((x) => x.id === id)
    if (!old) return
    set((s) => ({ examens: s.examens.filter((x) => x.id !== id) }))
    get().logAction('DELETE', 'examens', id, "Suppression de l'examen", snapshotRecord(old))
    const state = get()
    persistExamen(old, state.eleves, state.inspecteurs, 'delete', () =>
      set((s) => ({ examens: [...s.examens, old] })),
    )
  },

  addExamenSession: (data) => {
    const year = new Date().getFullYear()
    const max = get()
      .examenSessions.map((s) => parseInt(s.numeroBordereau.split('-')[2] || '0', 10))
      .reduce((a, b) => Math.max(a, b), 17)
    const newSess: ExamenSession = {
      titre: `Session ${data.typeExamen}`,
      lieu: data.lieu || data.centre,
      categorie: 'B',
      statut: 'brouillon',
      observations: '',
      ...data,
      id: uid('sess'),
      numeroBordereau: `BORD-${year}-${String(max + 1).padStart(3, '0')}`,
    } as ExamenSession
    set((s) => ({ examenSessions: [newSess, ...s.examenSessions] }))
    get().logAction('INSERT', 'examen_sessions', newSess.id, `Création de la session ${newSess.numeroBordereau}`, undefined, snapshotRecord(newSess))
    const state = get()
    persistExamenSession(newSess, state.eleves, state.inspecteurs, state.vehicules, 'create', () =>
      set((s) => ({ examenSessions: s.examenSessions.filter((sess) => sess.id !== newSess.id) })),
    )
  },

  updateSessionResultats: (sessionId, candidats) => {
    const old = get().examenSessions.find((sess) => sess.id === sessionId)
    if (!old) return
    const updated = { ...old, candidats }
    set((s) => ({
      examenSessions: s.examenSessions.map((sess) => (sess.id === sessionId ? updated : sess)),
    }))
    get().logAction('UPDATE', 'examen_sessions', sessionId, 'Saisie des résultats de session', snapshotRecord(old), snapshotRecord(updated))
    const state = get()
    persistExamenSession(updated, state.eleves, state.inspecteurs, state.vehicules, 'update', () =>
      set((s) => ({
        examenSessions: s.examenSessions.map((sess) => (sess.id === sessionId ? old : sess)),
      })),
    )
  },

  deleteExamenSession: (id) => {
    const old = get().examenSessions.find((sess) => sess.id === id)
    if (!old) return
    set((s) => ({ examenSessions: s.examenSessions.filter((sess) => sess.id !== id) }))
    get().logAction('DELETE', 'examen_sessions', id, 'Suppression de la session', snapshotRecord(old))
    const state = get()
    persistExamenSession(old, state.eleves, state.inspecteurs, state.vehicules, 'delete', () =>
      set((s) => ({ examenSessions: [...s.examenSessions, old] })),
    )
  },
})
