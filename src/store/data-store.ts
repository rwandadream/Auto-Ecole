import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { formatXOF, nowFrLocale, todayFrShort } from '@/lib/format'
import { getCurrentAuditUser } from '@/lib/audit-user'
import { snapshotRecord } from '@/lib/snapshot'
import { DEFAULT_LIEU_RDV } from '@/lib/domain/constants'
import { faqContent } from '@/lib/faq-content'
import type {
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
import { DATA_STORE_KEY, DATA_STORE_VERSION, shouldPersistDataStore } from '@/store/persist-config'
import { getSupabaseErrorMessage } from '@/lib/supabase/errors'
import {
  makeEntityId,
  persistAudit,
  persistDepense,
  persistEleveCreateAwait,
  persistEleveDelete,
  persistEleveUpdate,
  persistExamen,
  persistExamenSession,
  persistFacture,
  persistFaqItem,
  persistFormation,
  persistInscrireEleve,
  persistInspecteur,
  persistMoniteur,
  persistPaiement,
  persistPermis,
  persistProfile,
  persistSeance,
  persistVehicule,
} from '@/lib/supabase/store-bridge'
import { findMoniteurId } from '@/lib/supabase/repositories'

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

export type AuditEntry = {
  id: string
  action: 'INSERT' | 'UPDATE' | 'DELETE'
  entity: string
  entityId: string
  description: string
  timestamp: string
  user: string
  oldData?: Record<string, unknown>
  newData?: Record<string, unknown>
}

function uid(prefix: string) {
  return makeEntityId(prefix)
}

function now() {
  return nowFrLocale()
}

function genFactureNumero(existing: Facture[]) {
  const year = new Date().getFullYear()
  const max = existing
    .filter((f) => f.numero.startsWith(`FAC-${year}-`))
    .map((f) => parseInt(f.numero.split('-')[2] || '0', 10))
    .reduce((a, b) => Math.max(a, b), 0)
  return `FAC-${year}-${String(max + 1).padStart(4, '0')}`
}

function genEleveCode(existing: Eleve[]) {
  const max = existing
    .map((e) => parseInt(e.code.replace('EL-', ''), 10))
    .reduce((a, b) => Math.max(a, b), 2410)
  return `EL-${max + 1}`
}

function computeStatutFacture(paye: number, montant: number): StatutFacture {
  if (paye <= 0) return 'Non payée'
  if (paye >= montant) return 'Payée'
  return 'Partielle'
}

interface DataState {
  eleves: Eleve[]
  moniteurs: Moniteur[]
  vehicules: Vehicule[]
  formations: Formation[]
  permis: Permis[]
  inspecteurs: Inspecteur[]
  seances: Seance[]
  examens: Examen[]
  examenSessions: ExamenSession[]
  inscriptions: Inscription[]
  factures: Facture[]
  paiements: Paiement[]
  depenses: Depense[]
  profiles: Profile[]
  faq: FaqItem[]
  auditLog: AuditEntry[]
  modesPaiement: { code: string; label: string }[]
  categoriesDepense: { code: string; label: string }[]
  appConfig: Record<string, string>

  addEleve: (data: Omit<Eleve, 'id' | 'code' | 'seancesFaites' | 'seancesTotales' | 'solde' | 'statut' | 'dateInscription' | 'moniteur' | 'estParraine' | 'parrainNom' | 'photoCni' | 'photoProfil'> & Partial<Pick<Eleve, 'statut' | 'solde' | 'moniteur' | 'estParraine' | 'parrainNom' | 'photoCni' | 'photoProfil'>>) => Eleve
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

  addSeance: (data: Omit<Seance, 'id'>) => void
  updateSeance: (id: string, patch: Partial<Seance>) => void
  deleteSeance: (id: string) => void

  addExamen: (data: Omit<Examen, 'id'>) => void
  updateExamen: (id: string, patch: Partial<Examen>) => void
  deleteExamen: (id: string) => void

  addExamenSession: (data: Omit<ExamenSession, 'id' | 'numeroBordereau'>) => void
  updateSessionResultats: (sessionId: string, candidats: CandidatSession[]) => void
  deleteExamenSession: (id: string) => void

  addInspecteur: (data: Omit<Inspecteur, 'id'>) => void
  updateInspecteur: (id: string, patch: Partial<Inspecteur>) => void
  deleteInspecteur: (id: string) => void

  addPermis: (data: Omit<Permis, 'id'>) => void
  updatePermis: (id: string, patch: Partial<Permis>) => void
  deletePermis: (id: string) => void

  updateProfile: (id: string, patch: Partial<Profile>) => void
  deleteProfile: (id: string) => void

  addFaqItem: (data: Omit<FaqItem, 'id' | 'sortOrder'> & { sortOrder?: number }) => void
  updateFaqItem: (id: string, patch: Partial<Pick<FaqItem, 'q' | 'r' | 'sortOrder'>>) => void
  deleteFaqItem: (id: string) => void

  addFacture: (data: { eleve: string; eleveCode: string; formation: string; montant: number; dateEmission: string; inscriptionId?: string }) => Facture
  updateFacture: (id: string, patch: Partial<Facture>) => void
  deleteFacture: (id: string) => void

  addPaiement: (data: { factureId: string; eleve: string; montant: number; modePaiement: ModePaiement; reference: string; datePaiement: string }) => void

  addDepense: (data: Omit<Depense, 'id'>) => void
  updateDepense: (id: string, patch: Partial<Depense>) => void
  deleteDepense: (id: string) => void

  logAction: (
    action: AuditEntry['action'],
    entity: string,
    entityId: string,
    description: string,
    oldData?: Record<string, unknown>,
    newData?: Record<string, unknown>,
  ) => void
}

function getInitialState() {
  return {
    eleves: [] as Eleve[],
    moniteurs: [] as Moniteur[],
    vehicules: [] as Vehicule[],
    formations: [] as Formation[],
    permis: [] as Permis[],
    inspecteurs: [] as Inspecteur[],
    seances: [] as Seance[],
    examens: [] as Examen[],
    examenSessions: [] as ExamenSession[],
    inscriptions: [] as Inscription[],
    factures: [] as Facture[],
    paiements: [] as Paiement[],
    depenses: [] as Depense[],
    profiles: [] as Profile[],
    faq: [...faqContent],
    auditLog: [] as AuditEntry[],
    modesPaiement: [] as { code: string; label: string }[],
    categoriesDepense: [] as { code: string; label: string }[],
    appConfig: {} as Record<string, string>,
  }
}

const initialState = getInitialState()

const pendingEleveCreates = new Map<string, Promise<void>>()

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      ...initialState,

      logAction: (action, entity, entityId, description, oldData, newData) => {
        const entry: AuditEntry = {
          id: uid('aud'),
          action,
          entity,
          entityId,
          description,
          timestamp: now(),
          user: getCurrentAuditUser(),
          ...(oldData ? { oldData } : {}),
          ...(newData ? { newData } : {}),
        }
        set((s) => ({
          auditLog: [entry, ...s.auditLog].slice(0, 200),
        }))
        persistAudit(entry)
      },

      addEleve: (data) => {
        const code = genEleveCode(get().eleves)
        const newEleve: Eleve = {
          ...data,
          id: uid('e'),
          code,
          seancesFaites: 0,
          seancesTotales: data.typePermis === 'AB' ? 40 : 20,
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
        const updated = { ...old, ...patch }
        set((s) => ({
          eleves: s.eleves.map((e) => (e.id === id ? updated : e)),
        }))
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
        const removedPaiements = get().paiements.filter((p) => p.eleve === eleveLabel)
        const removedSeances = get().seances.filter(
          (s) => s.eleveCode === old.code || s.eleve === eleveLabel,
        )
        const removedExamens = get().examens.filter(
          (e) => e.eleveCode === old.code || e.eleve === eleveLabel,
        )
        const removedSessionSnapshots = get()
          .examenSessions.filter((sess) =>
            sess.candidats.some((c) => c.identifiant === old.code),
          )
          .map((sess) => ({ id: sess.id, candidats: [...sess.candidats] }))
        set((s) => ({
          eleves: s.eleves.filter((x) => x.id !== id),
          inscriptions: s.inscriptions.filter((i) => i.eleveId !== id),
          factures: s.factures.filter((f) => !removedFactureIds.has(f.id)),
          paiements: s.paiements.filter((p) => p.eleve !== eleveLabel),
          seances: s.seances.filter(
            (se) => se.eleveCode !== old.code && se.eleve !== eleveLabel,
          ),
          examens: s.examens.filter(
            (e) => e.eleveCode !== old.code && e.eleve !== eleveLabel,
          ),
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
        persistMoniteur(newM, 'create', () => set((s) => ({ moniteurs: s.moniteurs.filter((m) => m.id !== newM.id) })))
      },

      updateMoniteur: (id, patch) => {
        const old = get().moniteurs.find((m) => m.id === id)
        if (!old) return
        const updated = { ...old, ...patch }
        set((s) => ({ moniteurs: s.moniteurs.map((m) => (m.id === id ? updated : m)) }))
        get().logAction('UPDATE', 'moniteurs', id, 'Modification du moniteur', snapshotRecord(old), snapshotRecord(updated))
        persistMoniteur(updated, 'update', () => set((s) => ({ moniteurs: s.moniteurs.map((m) => (m.id === id ? old : m)) })))
      },

      deleteMoniteur: (id) => {
        const old = get().moniteurs.find((m) => m.id === id)
        if (!old) return
        const label = `${old.prenom} ${old.nom}`.trim()
        const affectedSeanceIds = new Set(
          get().seances.filter((s) => s.moniteur === label).map((s) => s.id),
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
        persistVehicule(newV, 'create', () => set((s) => ({ vehicules: s.vehicules.filter((v) => v.id !== newV.id) })))
      },

      updateVehicule: (id, patch) => {
        const old = get().vehicules.find((v) => v.id === id)
        if (!old) return
        const updated = { ...old, ...patch }
        set((s) => ({ vehicules: s.vehicules.map((v) => (v.id === id ? updated : v)) }))
        get().logAction('UPDATE', 'vehicules', id, 'Modification du véhicule', snapshotRecord(old), snapshotRecord(updated))
        persistVehicule(updated, 'update', () => set((s) => ({ vehicules: s.vehicules.map((v) => (v.id === id ? old : v)) })))
      },

      deleteVehicule: (id) => {
        const old = get().vehicules.find((v) => v.id === id)
        if (!old) return
        const label = `${old.marque} ${old.modele} (${old.immatriculation})`.trim()
        const matchesVehicule = (value: string) =>
          value === label || value.includes(old.immatriculation)
        const affectedSeanceIds = new Set(
          get().seances.filter((s) => matchesVehicule(s.vehicule)).map((s) => s.id),
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
        persistFormation(newF, 'create', () => set((s) => ({ formations: s.formations.filter((f) => f.id !== newF.id) })))
      },

      updateFormation: (id, patch) => {
        const old = get().formations.find((f) => f.id === id)
        if (!old) return
        const updated = { ...old, ...patch }
        set((s) => ({ formations: s.formations.map((f) => (f.id === id ? updated : f)) }))
        get().logAction('UPDATE', 'formations', id, 'Modification de la formation', snapshotRecord(old), snapshotRecord(updated))
        persistFormation(updated, 'update', () => set((s) => ({ formations: s.formations.map((f) => (f.id === id ? old : f)) })))
      },

      deleteFormation: (id) => {
        const old = get().formations.find((f) => f.id === id)
        if (!old) return
        set((s) => ({ formations: s.formations.filter((f) => f.id !== id) }))
        get().logAction('DELETE', 'formations', id, 'Suppression de la formation', snapshotRecord(old))
        persistFormation(old, 'delete', () => set((s) => ({ formations: [...s.formations, old] })))
      },

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
        persistExamen(old, get().eleves, get().inspecteurs, 'delete', () =>
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
          lieu: data.centre,
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
        persistExamenSession(old, get().eleves, get().inspecteurs, get().vehicules, 'delete', () =>
          set((s) => ({ examenSessions: [...s.examenSessions, old] })),
        )
      },

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

      addPaiement: (data) => {
        const factureRecord = get().factures.find((f) => f.id === data.factureId)
        const newP: Paiement = {
          ...data,
          facture: factureRecord?.numero ?? data.factureId,
          id: uid('pa'),
        } as Paiement
        set((s) => {
          const factures = s.factures.map((f) => {
            if (f.id === data.factureId) {
              const nouveauPaye = f.paye + data.montant
              const nouveauReste = Math.max(0, f.montant - nouveauPaye)
              const nouveauStatut = computeStatutFacture(nouveauPaye, f.montant)
              return { ...f, paye: nouveauPaye, reste: nouveauReste, statut: nouveauStatut }
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
        set((s) => ({ factures: s.factures.filter((f) => f.id !== id) }))
        get().logAction('DELETE', 'factures', id, 'Suppression de la facture', snapshotRecord(old))
        persistFacture(old, get().eleves, 'delete', () => set((s) => ({ factures: [...s.factures, old] })))
      },

      addInspecteur: (data) => {
        const newI: Inspecteur = { ...data, id: uid('i') } as Inspecteur
        set((s) => ({ inspecteurs: [newI, ...s.inspecteurs] }))
        get().logAction('INSERT', 'inspecteurs', newI.id, `Ajout de l'inspecteur ${newI.prenom} ${newI.nom}`, undefined, snapshotRecord(newI))
        persistInspecteur(newI, 'create', () => set((s) => ({ inspecteurs: s.inspecteurs.filter((i) => i.id !== newI.id) })))
      },

      updateInspecteur: (id, patch) => {
        const old = get().inspecteurs.find((i) => i.id === id)
        if (!old) return
        const updated = { ...old, ...patch }
        set((s) => ({ inspecteurs: s.inspecteurs.map((i) => (i.id === id ? updated : i)) }))
        get().logAction('UPDATE', 'inspecteurs', id, "Modification de l'inspecteur", snapshotRecord(old), snapshotRecord(updated))
        persistInspecteur(updated, 'update', () => set((s) => ({ inspecteurs: s.inspecteurs.map((i) => (i.id === id ? old : i)) })))
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
        persistPermis(newP, 'create', () => set((s) => ({ permis: s.permis.filter((p) => p.id !== newP.id) })))
      },

      updatePermis: (id, patch) => {
        const old = get().permis.find((p) => p.id === id)
        if (!old) return
        const updated = { ...old, ...patch }
        set((s) => ({ permis: s.permis.map((p) => (p.id === id ? updated : p)) }))
        get().logAction('UPDATE', 'permis', id, 'Modification du permis', snapshotRecord(old), snapshotRecord(updated))
        persistPermis(updated, 'update', () => set((s) => ({ permis: s.permis.map((p) => (p.id === id ? old : p)) })))
      },

      deletePermis: (id) => {
        const old = get().permis.find((p) => p.id === id)
        if (!old) return
        set((s) => ({ permis: s.permis.filter((p) => p.id !== id) }))
        get().logAction('DELETE', 'permis', id, 'Suppression du permis', snapshotRecord(old))
        persistPermis(old, 'delete', () => set((s) => ({ permis: [...s.permis, old] })))
      },

      updateProfile: (id, patch) => {
        const old = get().profiles.find((p) => p.id === id)
        if (!old) return
        const updated = { ...old, ...patch }
        set((s) => ({ profiles: s.profiles.map((p) => (p.id === id ? updated : p)) }))
        get().logAction('UPDATE', 'profiles', id, 'Modification du profil', snapshotRecord(old), snapshotRecord(updated))
        persistProfile(updated, 'update', () => set((s) => ({ profiles: s.profiles.map((p) => (p.id === id ? old : p)) })))
      },

      deleteProfile: (id) => {
        const old = get().profiles.find((p) => p.id === id)
        if (!old) return
        set((s) => ({ profiles: s.profiles.filter((p) => p.id !== id) }))
        get().logAction('DELETE', 'profiles', id, "Suppression de l'utilisateur", snapshotRecord(old))
        persistProfile(old, 'delete', () => set((s) => ({ profiles: [...s.profiles, old] })))
      },

      addFaqItem: (data) => {
        const newItem: FaqItem = {
          id: makeEntityId('faq'),
          q: data.q,
          r: data.r,
          sortOrder: data.sortOrder ?? get().faq.length + 1,
        }
        set((s) => ({ faq: [...s.faq, newItem].sort((a, b) => a.sortOrder - b.sortOrder) }))
        get().logAction('INSERT', 'faq_items', newItem.id, `Ajout FAQ: ${newItem.q}`, undefined, snapshotRecord(newItem))
        persistFaqItem(newItem, 'create', () => set((s) => ({ faq: s.faq.filter((f) => f.id !== newItem.id) })))
      },

      updateFaqItem: (id, patch) => {
        const old = get().faq.find((f) => f.id === id)
        if (!old) return
        const updated = { ...old, ...patch }
        set((s) => ({
          faq: s.faq.map((f) => (f.id === id ? updated : f)).sort((a, b) => a.sortOrder - b.sortOrder),
        }))
        get().logAction('UPDATE', 'faq_items', id, 'Modification FAQ', snapshotRecord(old), snapshotRecord(updated))
        persistFaqItem(updated, 'update', () =>
          set((s) => ({ faq: s.faq.map((f) => (f.id === id ? old : f)) })),
        )
      },

      deleteFaqItem: (id) => {
        const old = get().faq.find((f) => f.id === id)
        if (!old) return
        set((s) => ({ faq: s.faq.filter((f) => f.id !== id) }))
        get().logAction('DELETE', 'faq_items', id, 'Suppression FAQ', snapshotRecord(old))
        persistFaqItem(old, 'delete', () => set((s) => ({ faq: [...s.faq, old].sort((a, b) => a.sortOrder - b.sortOrder) })))
      },

      addDepense: (data) => {
        const newD: Depense = { ...data, id: uid('d'), justificatif: data.justificatif ?? '' } as Depense
        set((s) => ({ depenses: [newD, ...s.depenses] }))
        get().logAction('INSERT', 'depenses', newD.id, `Dépense ${data.categorie}: ${data.description}`, undefined, snapshotRecord(newD))
        persistDepense(newD, get().vehicules, 'create', () => set((s) => ({ depenses: s.depenses.filter((d) => d.id !== newD.id) })))
      },

      updateDepense: (id, patch) => {
        const old = get().depenses.find((d) => d.id === id)
        if (!old) return
        const updated = { ...old, ...patch }
        set((s) => ({ depenses: s.depenses.map((d) => (d.id === id ? updated : d)) }))
        get().logAction('UPDATE', 'depenses', id, 'Modification de la dépense', snapshotRecord(old), snapshotRecord(updated))
        persistDepense(updated, get().vehicules, 'update', () => set((s) => ({ depenses: s.depenses.map((d) => (d.id === id ? old : d)) })))
      },

      deleteDepense: (id) => {
        const old = get().depenses.find((d) => d.id === id)
        if (!old) return
        set((s) => ({ depenses: s.depenses.filter((d) => d.id !== id) }))
        get().logAction('DELETE', 'depenses', id, 'Suppression de la dépense', snapshotRecord(old))
        persistDepense(old, get().vehicules, 'delete', () => set((s) => ({ depenses: [...s.depenses, old] })))
      },
    }),
    {
      name: DATA_STORE_KEY,
      version: DATA_STORE_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) =>
        shouldPersistDataStore()
          ? {
              eleves: state.eleves,
              moniteurs: state.moniteurs,
              vehicules: state.vehicules,
              formations: state.formations,
              permis: state.permis,
              inspecteurs: state.inspecteurs,
              seances: state.seances,
              examens: state.examens,
              examenSessions: state.examenSessions,
              inscriptions: state.inscriptions,
              factures: state.factures,
              paiements: state.paiements,
              depenses: state.depenses,
              profiles: state.profiles,
              faq: state.faq,
              auditLog: state.auditLog,
            }
          : {},
    },
  ),
)
