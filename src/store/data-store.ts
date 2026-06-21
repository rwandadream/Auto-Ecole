import { create } from 'zustand'
import {
  eleves as seedEleves,
  moniteurs as seedMoniteurs,
  vehicules as seedVehicules,
  formations as seedFormations,
  permis as seedPermis,
  inspecteurs as seedInspecteurs,
  seances as seedSeances,
  examens as seedExamens,
  examenSessions as seedExamenSessions,
  factures as seedFactures,
  paiements as seedPaiements,
  depenses as seedDepenses,
  profiles as seedProfiles,
  type StatutEleve,
  type StatutMoniteur,
  type EtatVehicule,
  type StatutSeance,
  type ResultatExamen,
  type StatutFacture,
  type ModePaiement,
  type CategorieDepense,
  type Role,
} from '@/lib/mock-data'

// --- Types (re-exported for convenience) ---
export type Eleve = (typeof seedEleves)[number]
export type Moniteur = (typeof seedMoniteurs)[number]
export type Vehicule = (typeof seedVehicules)[number]
export type Formation = (typeof seedFormations)[number]
export type Permis = (typeof seedPermis)[number]
export type Inspecteur = (typeof seedInspecteurs)[number]
export type Seance = (typeof seedSeances)[number]
export type Examen = (typeof seedExamens)[number]
export type ExamenSession = (typeof seedExamenSessions)[number]
export type CandidatSession = ExamenSession['candidats'][number]
export type Facture = (typeof seedFactures)[number]
export type Paiement = (typeof seedPaiements)[number]
export type Depense = (typeof seedDepenses)[number]
export type Profile = (typeof seedProfiles)[number]

// --- Audit log entry ---
export type AuditEntry = {
  id: string
  action: 'INSERT' | 'UPDATE' | 'DELETE'
  entity: string
  entityId: string
  description: string
  timestamp: string
  user: string
}

// --- Helpers ---
function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

function now() {
  return new Date().toLocaleString('fr-FR')
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

// --- Store ---
interface DataState {
  // Entities
  eleves: Eleve[]
  moniteurs: Moniteur[]
  vehicules: Vehicule[]
  formations: Formation[]
  permis: Permis[]
  inspecteurs: Inspecteur[]
  seances: Seance[]
  examens: Examen[]
  examenSessions: ExamenSession[]
  factures: Facture[]
  paiements: Paiement[]
  depenses: Depense[]
  profiles: Profile[]
  auditLog: AuditEntry[]

  // Élèves CRUD
  addEleve: (data: Omit<Eleve, 'id' | 'code' | 'seancesFaites' | 'seancesTotales' | 'solde' | 'statut' | 'dateInscription' | 'moniteur' | 'estParraine' | 'parrainNom'> & Partial<Pick<Eleve, 'statut' | 'solde' | 'moniteur' | 'estParraine' | 'parrainNom'>>) => Eleve
  updateEleve: (id: string, patch: Partial<Eleve>) => void
  deleteEleve: (id: string) => void

  // Moniteurs CRUD
  addMoniteur: (data: Omit<Moniteur, 'id' | 'seances'>) => void
  updateMoniteur: (id: string, patch: Partial<Moniteur>) => void
  deleteMoniteur: (id: string) => void

  // Véhicules CRUD
  addVehicule: (data: Omit<Vehicule, 'id' | 'seances' | 'derniereDepense'>) => void
  updateVehicule: (id: string, patch: Partial<Vehicule>) => void
  deleteVehicule: (id: string) => void

  // Formations CRUD
  addFormation: (data: Omit<Formation, 'id'>) => void
  updateFormation: (id: string, patch: Partial<Formation>) => void
  deleteFormation: (id: string) => void

  // Séances CRUD
  addSeance: (data: Omit<Seance, 'id'>) => void
  updateSeance: (id: string, patch: Partial<Seance>) => void
  deleteSeance: (id: string) => void

  // Examens CRUD
  addExamen: (data: Omit<Examen, 'id'>) => void
  updateExamen: (id: string, patch: Partial<Examen>) => void

  // Sessions CRUD
  addExamenSession: (data: Omit<ExamenSession, 'id' | 'numeroBordereau'>) => void
  updateSessionResultats: (sessionId: string, candidats: CandidatSession[]) => void

  // Factures CRUD
  addFacture: (data: { eleve: string; eleveCode: string; formation: string; montant: number; dateEmission: string }) => void

  // Paiements
  addPaiement: (data: { factureId: string; eleve: string; montant: number; modePaiement: ModePaiement; reference: string; datePaiement: string }) => void

  // Dépenses CRUD
  addDepense: (data: Omit<Depense, 'id'>) => void
  updateDepense: (id: string, patch: Partial<Depense>) => void
  deleteDepense: (id: string) => void

  // Audit helper
  logAction: (action: AuditEntry['action'], entity: string, entityId: string, description: string) => void
}

export const useDataStore = create<DataState>((set, get) => ({
  eleves: [...seedEleves],
  moniteurs: [...seedMoniteurs],
  vehicules: [...seedVehicules],
  formations: [...seedFormations],
  permis: [...seedPermis],
  inspecteurs: [...seedInspecteurs],
  seances: [...seedSeances],
  examens: [...seedExamens],
  examenSessions: [...seedExamenSessions],
  factures: [...seedFactures],
  paiements: [...seedPaiements],
  depenses: [...seedDepenses],
  profiles: [...seedProfiles],
  auditLog: [],

  logAction: (action, entity, entityId, description) =>
    set((s) => ({
      auditLog: [
        {
          id: uid('aud'),
          action,
          entity,
          entityId,
          description,
          timestamp: now(),
          user: 'Aïcha Diallo',
        },
        ...s.auditLog,
      ].slice(0, 200),
    })),

  // --- Élèves ---
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
      dateInscription: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
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
    } as Eleve
    set((s) => ({ eleves: [newEleve, ...s.eleves] }))
    get().logAction('INSERT', 'eleves', newEleve.id, `Création de l'élève ${newEleve.prenom} ${newEleve.nom} (${code})`)
    return newEleve
  },

  updateEleve: (id, patch) => {
    set((s) => ({
      eleves: s.eleves.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }))
    const e = get().eleves.find((x) => x.id === id)
    get().logAction('UPDATE', 'eleves', id, `Modification de l'élève ${e?.prenom} ${e?.nom}`)
  },

  deleteEleve: (id) => {
    const e = get().eleves.find((x) => x.id === id)
    set((s) => ({ eleves: s.eleves.filter((x) => x.id !== id) }))
    get().logAction('DELETE', 'eleves', id, `Suppression de l'élève ${e?.prenom} ${e?.nom}`)
  },

  // --- Moniteurs ---
  addMoniteur: (data) => {
    const newM: Moniteur = { ...data, id: uid('m'), seances: 0 } as Moniteur
    set((s) => ({ moniteurs: [newM, ...s.moniteurs] }))
    get().logAction('INSERT', 'moniteurs', newM.id, `Ajout du moniteur ${newM.prenom} ${newM.nom}`)
  },

  updateMoniteur: (id, patch) => {
    set((s) => ({ moniteurs: s.moniteurs.map((m) => (m.id === id ? { ...m, ...patch } : m)) }))
    get().logAction('UPDATE', 'moniteurs', id, `Modification du moniteur`)
  },

  deleteMoniteur: (id) => {
    set((s) => ({ moniteurs: s.moniteurs.filter((m) => m.id !== id) }))
    get().logAction('DELETE', 'moniteurs', id, `Suppression du moniteur`)
  },

  // --- Véhicules ---
  addVehicule: (data) => {
    const newV: Vehicule = { ...data, id: uid('v'), seances: 0, derniereDepense: '—' } as Vehicule
    set((s) => ({ vehicules: [newV, ...s.vehicules] }))
    get().logAction('INSERT', 'vehicules', newV.id, `Ajout du véhicule ${newV.marque} ${newV.modele}`)
  },

  updateVehicule: (id, patch) => {
    set((s) => ({ vehicules: s.vehicules.map((v) => (v.id === id ? { ...v, ...patch } : v)) }))
    get().logAction('UPDATE', 'vehicules', id, `Modification du véhicule`)
  },

  deleteVehicule: (id) => {
    set((s) => ({ vehicules: s.vehicules.filter((v) => v.id !== id) }))
    get().logAction('DELETE', 'vehicules', id, `Suppression du véhicule`)
  },

  // --- Formations ---
  addFormation: (data) => {
    const newF: Formation = { ...data, id: uid('f') } as Formation
    set((s) => ({ formations: [newF, ...s.formations] }))
    get().logAction('INSERT', 'formations', newF.id, `Ajout de la formation ${newF.nom}`)
  },

  updateFormation: (id, patch) => {
    set((s) => ({ formations: s.formations.map((f) => (f.id === id ? { ...f, ...patch } : f)) }))
    get().logAction('UPDATE', 'formations', id, `Modification de la formation`)
  },

  deleteFormation: (id) => {
    set((s) => ({ formations: s.formations.filter((f) => f.id !== id) }))
    get().logAction('DELETE', 'formations', id, `Suppression de la formation`)
  },

  // --- Séances ---
  addSeance: (data) => {
    const newS: Seance = { ...data, id: uid('s') } as Seance
    set((s) => ({ seances: [newS, ...s.seances] }))
    get().logAction('INSERT', 'seances', newS.id, `Planification d'une séance pour ${newS.eleve}`)
  },

  updateSeance: (id, patch) => {
    set((s) => ({ seances: s.seances.map((se) => (se.id === id ? { ...se, ...patch } : se)) }))
    get().logAction('UPDATE', 'seances', id, `Mise à jour de la séance`)
  },

  deleteSeance: (id) => {
    set((s) => ({ seances: s.seances.filter((se) => se.id !== id) }))
    get().logAction('DELETE', 'seances', id, `Suppression de la séance`)
  },

  // --- Examens ---
  addExamen: (data) => {
    const newE: Examen = { ...data, id: uid('x') } as Examen
    set((s) => ({ examens: [newE, ...s.examens] }))
    get().logAction('INSERT', 'examens', newE.id, `Planification d'un examen pour ${newE.eleve}`)
  },

  updateExamen: (id, patch) => {
    set((s) => ({ examens: s.examens.map((ex) => (ex.id === id ? { ...ex, ...patch } : ex)) }))
    get().logAction('UPDATE', 'examens', id, `Mise à jour de l'examen`)
  },

  // --- Sessions ---
  addExamenSession: (data) => {
    const year = new Date().getFullYear()
    const max = get()
      .examenSessions.map((s) => parseInt(s.numeroBordereau.split('-')[2] || '0', 10))
      .reduce((a, b) => Math.max(a, b), 17)
    const newSess: ExamenSession = {
      ...data,
      id: uid('sess'),
      numeroBordereau: `BORD-${year}-${String(max + 1).padStart(3, '0')}`,
    } as ExamenSession
    set((s) => ({ examenSessions: [newSess, ...s.examenSessions] }))
    get().logAction('INSERT', 'examen_sessions', newSess.id, `Création de la session ${newSess.numeroBordereau}`)
  },

  updateSessionResultats: (sessionId, candidats) => {
    set((s) => ({
      examenSessions: s.examenSessions.map((sess) =>
        sess.id === sessionId ? { ...sess, candidats } : sess
      ),
    }))
    get().logAction('UPDATE', 'examen_sessions', sessionId, `Saisie des résultats de session`)
  },

  // --- Factures ---
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
    } as Facture
    set((s) => ({ factures: [newF, ...s.factures] }))
    get().logAction('INSERT', 'factures', newF.id, `Émission de la facture ${numero} pour ${data.eleve}`)
  },

  // --- Paiements (avec recalcul automatique du solde) ---
  addPaiement: (data) => {
    const newP: Paiement = { ...data, id: uid('pa') } as Paiement
    set((s) => {
      // Recalculer le solde de la facture
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
    get().logAction('INSERT', 'paiements', newP.id, `Encaissement de ${data.montant.toLocaleString('fr-FR')} F pour ${data.eleve}`)
  },

  // --- Dépenses ---
  addDepense: (data) => {
    const newD: Depense = { ...data, id: uid('d') } as Depense
    set((s) => ({ depenses: [newD, ...s.depenses] }))
    get().logAction('INSERT', 'depenses', newD.id, `Dépense ${data.categorie}: ${data.description}`)
  },

  updateDepense: (id, patch) => {
    set((s) => ({ depenses: s.depenses.map((d) => (d.id === id ? { ...d, ...patch } : d)) }))
    get().logAction('UPDATE', 'depenses', id, `Modification de la dépense`)
  },

  deleteDepense: (id) => {
    set((s) => ({ depenses: s.depenses.filter((d) => d.id !== id) }))
    get().logAction('DELETE', 'depenses', id, `Suppression de la dépense`)
  },
}))
