import type { StateCreator } from 'zustand'
import type { DataState } from '../store-types'
import {
  makeEntityId,
  persistEleveCreateAwait,
  persistEleveDelete,
  persistEleveUpdate,
  persistFormation,
  persistInspecteur,
  persistInscrireEleve,
  persistMoniteur,
  persistPermis,
  persistVehicule,
} from '@/lib/supabase/store-bridge'
import { snapshotRecord } from '@/lib/snapshot'
import { todayFrShort } from '@/lib/format'
import { findMoniteurId } from '@/lib/supabase/repositories'
import { getSupabaseErrorMessage } from '@/lib/supabase/errors'
import type {
  Eleve,
  Formation,
  Inspecteur,
  Inscription,
  Moniteur,
  Permis,
  Vehicule,
} from '@/lib/domain/types'

function uid(prefix: string) {
  return makeEntityId(prefix)
}

function genEleveCode(existing: Eleve[]) {
  const max = existing
    .map((e) => parseInt(e.code.replace('EL-', ''), 10))
    .reduce((a, b) => Math.max(a, b), 2410)
  return `EL-${max + 1}`
}

function computeSeancesTotales(typePermis: string): number {
  if (typePermis === 'BCDE') return 60
  if (['C', 'D', 'E'].includes(typePermis)) return 30
  return 20
}

const pendingEleveCreates = new Map<string, Promise<void>>()

export type ResourceSlice = {
  eleves: Eleve[]
  moniteurs: Moniteur[]
  vehicules: Vehicule[]
  inspecteurs: Inspecteur[]
  permis: Permis[]
  formations: Formation[]
  inscriptions: Inscription[]

  addEleve: (
    data: Omit<Eleve, 'id' | 'code' | 'seancesFaites' | 'seancesTotales' | 'solde' | 'statut' | 'dateInscription' | 'moniteur' | 'estParraine' | 'parrainNom' | 'photoCni' | 'photoProfil'> &
      Partial<Pick<Eleve, 'statut' | 'solde' | 'moniteur' | 'estParraine' | 'parrainNom' | 'photoCni' | 'photoProfil'>>,
  ) => Eleve
  updateEleve: (id: string, patch: Partial<Eleve>) => void
  deleteEleve: (id: string) => void
  inscrireEleve: (eleveId: string, formationId: string, tarif?: number) => Promise<Inscription | null>

  addMoniteur: (data: Omit<Moniteur, 'id' | 'seances'>) => void
  updateMoniteur: (id: string, patch: Partial<Moniteur>) => void
  deleteMoniteur: (id: string) => void

  addVehicule: (data: Omit<Vehicule, 'id' | 'seances' | 'derniereDepense'>) => void
  updateVehicule: (id: string, patch: Partial<Vehicule>) => void
  deleteVehicule: (id: string) => void

  addFormation: (data: Omit<Formation, 'id'>) => void
  updateFormation: (id: string, patch: Partial<Formation>) => void
  deleteFormation: (id: string) => void

  addInspecteur: (data: Omit<Inspecteur, 'id'>) => void
  updateInspecteur: (id: string, patch: Partial<Inspecteur>) => void
  deleteInspecteur: (id: string) => void

  addPermis: (data: Omit<Permis, 'id'>) => void
  updatePermis: (id: string, patch: Partial<Permis>) => void
  deletePermis: (id: string) => void
}

export const createResourceSlice: StateCreator<DataState, [], [], ResourceSlice> = (set, get) => ({
  eleves: [],
  moniteurs: [],
  vehicules: [],
  inspecteurs: [],
  permis: [],
  formations: [],
  inscriptions: [],

  addEleve: (data) => {
    const code = genEleveCode(get().eleves)
    const newEleve: Eleve = {
      ...data,
      id: uid('e'),
      code,
      seancesFaites: 0,
      seancesTotales: computeSeancesTotales(data.typePermis),
      solde: data.solde ?? 0,
      statut: data.statut ?? 'Prospect',
      dateInscription: todayFrShort(),
      moniteur: data.moniteur ?? 'Non assigné',
      estParraine: data.estParraine ?? false,
      parrainNom: data.parrainNom ?? '',
      lieuNaissance: data.lieuNaissance ?? '',
      nationalite: data.nationalite ?? 'Ivoirienne',
      sexe: data.sexe ?? 'M',
      typePiece: data.typePiece ?? 'CNI',
      numPiece: data.numPiece ?? '',
      email: data.email ?? '',
      adresse: data.adresse ?? '',
      photoCni: data.photoCni ?? '',
      photoProfil: data.photoProfil ?? '',
    } as Eleve
    set((s) => ({ eleves: [newEleve, ...s.eleves] }))
    get().logAction(
      'INSERT',
      'eleves',
      newEleve.id,
      `Création de l'élève ${newEleve.prenom} ${newEleve.nom} (${code})`,
      undefined,
      snapshotRecord(newEleve),
    )
    const moniteurId = findMoniteurId(get().moniteurs, newEleve.moniteur)
    const rollback = () =>
      set((s) => ({ eleves: s.eleves.filter((e) => e.id !== newEleve.id) }))
    const createPromise = persistEleveCreateAwait(newEleve, moniteurId, rollback).finally(
      () => pendingEleveCreates.delete(newEleve.id),
    )
    pendingEleveCreates.set(newEleve.id, createPromise)
    return newEleve
  },

  updateEleve: (id, patch) => {
    const old = get().eleves.find((x) => x.id === id)
    if (!old) return
    const newPermis = patch.typePermis ?? old.typePermis
    const updated = {
      ...old,
      ...patch,
      seancesTotales:
        patch.typePermis && patch.typePermis !== old.typePermis
          ? computeSeancesTotales(newPermis)
          : (patch.seancesTotales ?? old.seancesTotales),
    }
    set((s) => ({ eleves: s.eleves.map((e) => (e.id === id ? updated : e)) }))
    get().logAction(
      'UPDATE',
      'eleves',
      id,
      `Modification de l'élève ${updated.prenom} ${updated.nom}`,
      snapshotRecord(old),
      snapshotRecord(updated),
    )
    persistEleveUpdate(updated, findMoniteurId(get().moniteurs, updated.moniteur), () =>
      set((s) => ({ eleves: s.eleves.map((e) => (e.id === id ? old : e)) })),
    )
  },

  deleteEleve: (id) => {
    const old = get().eleves.find((x) => x.id === id)
    if (!old) return
    const eleveLabel = `${old.prenom} ${old.nom}`.trim()
    const removedInscriptions = get().inscriptions.filter((i) => i.eleveId === id)
    const removedFactures = get().factures.filter(
      (f) => f.eleveCode === old.code || f.eleve === eleveLabel,
    )
    const removedFactureIds = new Set(removedFactures.map((f) => f.id))
    const removedPaiements = get().paiements.filter((p) => removedFactureIds.has(p.factureId))
    const removedSeances = get().seances.filter(
      (s) => s.eleveCode === old.code || s.eleve === eleveLabel,
    )
    const removedExamens = get().examens.filter(
      (e) => e.eleveCode === old.code || e.eleve === eleveLabel,
    )
    const removedSessionSnapshots = get()
      .examenSessions.filter((sess) => sess.candidats.some((c) => c.identifiant === old.code))
      .map((sess) => ({ id: sess.id, candidats: [...sess.candidats] }))
    set((s) => ({
      eleves: s.eleves.filter((x) => x.id !== id),
      inscriptions: s.inscriptions.filter((i) => i.eleveId !== id),
      factures: s.factures.filter((f) => !removedFactureIds.has(f.id)),
      paiements: s.paiements.filter((p) => !removedFactureIds.has(p.factureId)),
      seances: s.seances.filter((se) => se.eleveCode !== old.code && se.eleve !== eleveLabel),
      examens: s.examens.filter((e) => e.eleveCode !== old.code && e.eleve !== eleveLabel),
      examenSessions: s.examenSessions.map((sess) => ({
        ...sess,
        candidats: sess.candidats.filter((c) => c.identifiant !== old.code),
      })),
    }))
    get().logAction(
      'DELETE',
      'eleves',
      id,
      `Suppression de l'élève ${old.prenom} ${old.nom}`,
      snapshotRecord(old),
    )
    persistEleveDelete(id, () =>
      set((s) => ({
        eleves: [...s.eleves, old],
        inscriptions: [...s.inscriptions, ...removedInscriptions],
        factures: [...s.factures, ...removedFactures],
        paiements: [...s.paiements, ...removedPaiements],
        seances: [...s.seances, ...removedSeances],
        examens: [...s.examens, ...removedExamens],
        examenSessions: s.examenSessions.map((sess) => {
          const snapshot = removedSessionSnapshots.find((x) => x.id === sess.id)
          return snapshot ? { ...sess, candidats: snapshot.candidats } : sess
        }),
      })),
    )
  },

  inscrireEleve: async (eleveId, formationId, tarif) => {
    const pendingCreate = pendingEleveCreates.get(eleveId)
    if (pendingCreate) await pendingCreate
    try {
      await persistInscrireEleve(eleveId, formationId, tarif)
    } catch (error) {
      throw new Error(getSupabaseErrorMessage(error))
    }
    return get().inscriptions.find((i) => i.eleveId === eleveId) ?? null
  },

  addMoniteur: (data) => {
    const newM: Moniteur = { ...data, id: uid('m'), seances: 0 } as Moniteur
    set((s) => ({ moniteurs: [newM, ...s.moniteurs] }))
    get().logAction('INSERT', 'moniteurs', newM.id, `Ajout du moniteur ${newM.prenom} ${newM.nom}`, undefined, snapshotRecord(newM))
    persistMoniteur(newM, 'create', () =>
      set((s) => ({ moniteurs: s.moniteurs.filter((m) => m.id !== newM.id) })),
    )
  },

  updateMoniteur: (id, patch) => {
    const old = get().moniteurs.find((m) => m.id === id)
    if (!old) return
    const updated = { ...old, ...patch }
    set((s) => ({ moniteurs: s.moniteurs.map((m) => (m.id === id ? updated : m)) }))
    get().logAction('UPDATE', 'moniteurs', id, 'Modification du moniteur', snapshotRecord(old), snapshotRecord(updated))
    persistMoniteur(updated, 'update', () =>
      set((s) => ({ moniteurs: s.moniteurs.map((m) => (m.id === id ? old : m)) })),
    )
  },

  deleteMoniteur: (id) => {
    const old = get().moniteurs.find((m) => m.id === id)
    if (!old) return
    const label = `${old.prenom} ${old.nom}`.trim()
    const affectedSeanceIds = new Set(
      get().seances.filter((s) => s.moniteurId === id).map((s) => s.id),
    )
    const affectedEleveIds = new Set(
      get().eleves.filter((e) => e.moniteur === label).map((e) => e.id),
    )
    set((s) => ({
      moniteurs: s.moniteurs.filter((m) => m.id !== id),
      seances: s.seances.map((se) =>
        affectedSeanceIds.has(se.id) ? { ...se, moniteur: '—', moniteurId: '' } : se,
      ),
      eleves: s.eleves.map((e) =>
        affectedEleveIds.has(e.id) ? { ...e, moniteur: 'Non assigné' } : e,
      ),
    }))
    get().logAction('DELETE', 'moniteurs', id, 'Suppression du moniteur', snapshotRecord(old))
    persistMoniteur(old, 'delete', () =>
      set((s) => ({
        moniteurs: [...s.moniteurs, old],
        seances: s.seances.map((se) =>
          affectedSeanceIds.has(se.id) ? { ...se, moniteur: label, moniteurId: old.id } : se,
        ),
        eleves: s.eleves.map((e) =>
          affectedEleveIds.has(e.id) ? { ...e, moniteur: label } : e,
        ),
      })),
    )
  },

  addVehicule: (data) => {
    const newV: Vehicule = { ...data, id: uid('v'), seances: 0, derniereDepense: '—' } as Vehicule
    set((s) => ({ vehicules: [newV, ...s.vehicules] }))
    get().logAction('INSERT', 'vehicules', newV.id, `Ajout du véhicule ${newV.marque} ${newV.modele}`, undefined, snapshotRecord(newV))
    persistVehicule(newV, 'create', () =>
      set((s) => ({ vehicules: s.vehicules.filter((v) => v.id !== newV.id) })),
    )
  },

  updateVehicule: (id, patch) => {
    const old = get().vehicules.find((v) => v.id === id)
    if (!old) return
    const updated = { ...old, ...patch }
    set((s) => ({ vehicules: s.vehicules.map((v) => (v.id === id ? updated : v)) }))
    get().logAction('UPDATE', 'vehicules', id, 'Modification du véhicule', snapshotRecord(old), snapshotRecord(updated))
    persistVehicule(updated, 'update', () =>
      set((s) => ({ vehicules: s.vehicules.map((v) => (v.id === id ? old : v)) })),
    )
  },

  deleteVehicule: (id) => {
    const old = get().vehicules.find((v) => v.id === id)
    if (!old) return
    const label = `${old.marque} ${old.modele} (${old.immatriculation})`.trim()
    const matchesVehicule = (value: string) =>
      value === label || value.includes(old.immatriculation)
    const affectedSeanceIds = new Set(
      get().seances.filter((s) => s.vehiculeId === id).map((s) => s.id),
    )
    const affectedDepenseIds = new Set(
      get().depenses.filter((d) => matchesVehicule(d.vehicule)).map((d) => d.id),
    )
    const affectedSessionIds = new Set(
      get().examenSessions.filter((s) => matchesVehicule(s.vehicule)).map((s) => s.id),
    )
    set((s) => ({
      vehicules: s.vehicules.filter((v) => v.id !== id),
      seances: s.seances.map((se) =>
        affectedSeanceIds.has(se.id) ? { ...se, vehicule: '—', vehiculeId: '' } : se,
      ),
      depenses: s.depenses.map((d) =>
        affectedDepenseIds.has(d.id) ? { ...d, vehicule: '—' } : d,
      ),
      examenSessions: s.examenSessions.map((sess) =>
        affectedSessionIds.has(sess.id) ? { ...sess, vehicule: '—' } : sess,
      ),
    }))
    get().logAction('DELETE', 'vehicules', id, 'Suppression du véhicule', snapshotRecord(old))
    persistVehicule(old, 'delete', () =>
      set((s) => ({
        vehicules: [...s.vehicules, old],
        seances: s.seances.map((se) =>
          affectedSeanceIds.has(se.id) ? { ...se, vehicule: label, vehiculeId: old.id } : se,
        ),
        depenses: s.depenses.map((d) =>
          affectedDepenseIds.has(d.id) ? { ...d, vehicule: label } : d,
        ),
        examenSessions: s.examenSessions.map((sess) =>
          affectedSessionIds.has(sess.id) ? { ...sess, vehicule: label } : sess,
        ),
      })),
    )
  },

  addFormation: (data) => {
    const newF: Formation = { ...data, id: uid('f') } as Formation
    set((s) => ({ formations: [newF, ...s.formations] }))
    get().logAction('INSERT', 'formations', newF.id, `Ajout de la formation ${newF.nom}`, undefined, snapshotRecord(newF))
    persistFormation(newF, 'create', () =>
      set((s) => ({ formations: s.formations.filter((f) => f.id !== newF.id) })),
    )
  },

  updateFormation: (id, patch) => {
    const old = get().formations.find((f) => f.id === id)
    if (!old) return
    const updated = { ...old, ...patch }
    set((s) => ({ formations: s.formations.map((f) => (f.id === id ? updated : f)) }))
    get().logAction('UPDATE', 'formations', id, 'Modification de la formation', snapshotRecord(old), snapshotRecord(updated))
    persistFormation(updated, 'update', () =>
      set((s) => ({ formations: s.formations.map((f) => (f.id === id ? old : f)) })),
    )
  },

  deleteFormation: (id) => {
    const old = get().formations.find((f) => f.id === id)
    if (!old) return
    set((s) => ({ formations: s.formations.filter((f) => f.id !== id) }))
    get().logAction('DELETE', 'formations', id, 'Suppression de la formation', snapshotRecord(old))
    persistFormation(old, 'delete', () =>
      set((s) => ({ formations: [...s.formations, old] })),
    )
  },

  addInspecteur: (data) => {
    const newI: Inspecteur = { ...data, id: uid('i') } as Inspecteur
    set((s) => ({ inspecteurs: [newI, ...s.inspecteurs] }))
    get().logAction('INSERT', 'inspecteurs', newI.id, `Ajout de l'inspecteur ${newI.prenom} ${newI.nom}`, undefined, snapshotRecord(newI))
    persistInspecteur(newI, 'create', () =>
      set((s) => ({ inspecteurs: s.inspecteurs.filter((i) => i.id !== newI.id) })),
    )
  },

  updateInspecteur: (id, patch) => {
    const old = get().inspecteurs.find((i) => i.id === id)
    if (!old) return
    const updated = { ...old, ...patch }
    set((s) => ({ inspecteurs: s.inspecteurs.map((i) => (i.id === id ? updated : i)) }))
    get().logAction('UPDATE', 'inspecteurs', id, "Modification de l'inspecteur", snapshotRecord(old), snapshotRecord(updated))
    persistInspecteur(updated, 'update', () =>
      set((s) => ({ inspecteurs: s.inspecteurs.map((i) => (i.id === id ? old : i)) })),
    )
  },

  deleteInspecteur: (id) => {
    const old = get().inspecteurs.find((i) => i.id === id)
    if (!old) return
    const label = `${old.prenom} ${old.nom}`.trim()
    const affectedExamenIds = new Set(
      get().examens.filter((e) => e.inspecteur === label).map((e) => e.id),
    )
    const affectedSessionIds = new Set(
      get().examenSessions.filter((s) => s.inspecteur === label).map((s) => s.id),
    )
    set((s) => ({
      inspecteurs: s.inspecteurs.filter((i) => i.id !== id),
      examens: s.examens.map((e) =>
        affectedExamenIds.has(e.id) ? { ...e, inspecteur: '—' } : e,
      ),
      examenSessions: s.examenSessions.map((sess) =>
        affectedSessionIds.has(sess.id) ? { ...sess, inspecteur: '—' } : sess,
      ),
    }))
    get().logAction('DELETE', 'inspecteurs', id, "Suppression de l'inspecteur", snapshotRecord(old))
    persistInspecteur(old, 'delete', () =>
      set((s) => ({
        inspecteurs: [...s.inspecteurs, old],
        examens: s.examens.map((e) =>
          affectedExamenIds.has(e.id) ? { ...e, inspecteur: label } : e,
        ),
        examenSessions: s.examenSessions.map((sess) =>
          affectedSessionIds.has(sess.id) ? { ...sess, inspecteur: label } : sess,
        ),
      })),
    )
  },

  addPermis: (data) => {
    const newP: Permis = { ...data, id: uid('p') } as Permis
    set((s) => ({ permis: [newP, ...s.permis] }))
    get().logAction('INSERT', 'permis', newP.id, `Ajout du permis ${newP.code}`, undefined, snapshotRecord(newP))
    persistPermis(newP, 'create', () =>
      set((s) => ({ permis: s.permis.filter((p) => p.id !== newP.id) })),
    )
  },

  updatePermis: (id, patch) => {
    const old = get().permis.find((p) => p.id === id)
    if (!old) return
    const updated = { ...old, ...patch }
    set((s) => ({ permis: s.permis.map((p) => (p.id === id ? updated : p)) }))
    get().logAction('UPDATE', 'permis', id, 'Modification du permis', snapshotRecord(old), snapshotRecord(updated))
    persistPermis(updated, 'update', () =>
      set((s) => ({ permis: s.permis.map((p) => (p.id === id ? old : p)) })),
    )
  },

  deletePermis: (id) => {
    const old = get().permis.find((p) => p.id === id)
    if (!old) return
    set((s) => ({ permis: s.permis.filter((p) => p.id !== id) }))
    get().logAction('DELETE', 'permis', id, 'Suppression du permis', snapshotRecord(old))
    persistPermis(old, 'delete', () =>
      set((s) => ({ permis: [...s.permis, old] })),
    )
  },
})
