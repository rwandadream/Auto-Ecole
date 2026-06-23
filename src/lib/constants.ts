import type {
  CategorieDepense,
  ModePaiement,
  StatutEleve,
  StatutMoniteur,
} from '@/lib/domain/types'

export const MODES_PAIEMENT: ModePaiement[] = [
  'Espèces',
  'Orange Money',
  'Wave',
  'Virement',
]

export const CATEGORIES_DEPENSE: CategorieDepense[] = [
  'Carburant',
  'Entretien',
  'Réparations',
  'Assurance',
  'Salaires',
  'Fournitures',
  'Autres',
]

export const STATUTS_ELEVE: StatutEleve[] = [
  'Prospect',
  'Inscrit',
  'En formation',
  'Examen',
  'Admis',
  'Ajourné',
  'Terminé',
  'Abandon',
]

export const STATUTS_MONITEUR: StatutMoniteur[] = [
  'Disponible',
  'En mission',
  'Absent',
]
