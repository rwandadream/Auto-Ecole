import type {
  StatutEleve,
  StatutMoniteur,
  EtatVehicule,
  StatutSeance,
  StatutFacture,
  ModePaiement,
  CategorieDepense,
  ResultatExamen,
} from '@/lib/domain/types'
import { mapRoleToDb } from '@/lib/supabase/roles'

export const STATUT_ELEVE_TO_DB: Record<StatutEleve, string> = {
  Prospect: 'prospect',
  Inscrit: 'inscrit',
  'En formation': 'en_formation',
  Examen: 'examen',
  Admis: 'admis',
  Ajourné: 'ajourne',
  Terminé: 'termine',
  Abandon: 'abandon',
}

export const STATUT_SEANCE_TO_DB: Record<StatutSeance, string> = {
  Planifié: 'planifie',
  Effectué: 'effectue',
  'Absent élève': 'absent_eleve',
  Annulé: 'annule',
}

export const STATUT_FACTURE_TO_DB: Record<StatutFacture, string> = {
  'Non payée': 'non_payee',
  Partielle: 'partielle',
  Payée: 'payee',
  Impayée: 'impayee',
}

export const MODE_PAIEMENT_TO_DB: Record<ModePaiement, string> = {
  Espèces: 'especes',
  'Orange Money': 'orange_money',
  Wave: 'wave',
  Virement: 'virement',
}

export const CATEGORIE_DEPENSE_TO_DB: Record<CategorieDepense, string> = {
  Carburant: 'carburant',
  Entretien: 'entretien',
  Réparations: 'reparations',
  Assurance: 'assurance',
  Salaires: 'salaires',
  Fournitures: 'fournitures',
  Autres: 'autres',
}

export const RESULTAT_EXAMEN_TO_DB: Record<ResultatExamen, string> = {
  'En attente': 'en_attente',
  Admis: 'admis',
  Ajourné: 'ajourne',
  Échec: 'echec',
}

export const STATUT_MONITEUR_TO_DB: Record<StatutMoniteur, string> = {
  Disponible: 'Disponible',
  'En mission': 'En mission',
  Absent: 'Absent',
}

export const ETAT_VEHICULE_TO_DB: Record<EtatVehicule, string> = {
  Disponible: 'Disponible',
  'En maintenance': 'En maintenance',
  'En panne': 'En panne',
}

export function parseFrDateToIso(dateStr: string): string | null {
  if (!dateStr) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr
  const months: Record<string, string> = {
    jan: '01', fév: '02', fev: '02', mar: '03', avr: '04', mai: '05', jun: '06',
    jui: '07', jul: '07', aoû: '08', aou: '08', sep: '09', oct: '10', nov: '11', déc: '12', dec: '12',
  }
  const parts = dateStr.trim().split(/\s+/)
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0')
    const monthKey = parts[1].toLowerCase().slice(0, 3)
    const year = parts[2]
    const month = months[monthKey]
    if (month) return `${year}-${month}-${day}`
  }
  return null
}

export function roleToDb(role: string) {
  return mapRoleToDb(role)
}

export function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}
