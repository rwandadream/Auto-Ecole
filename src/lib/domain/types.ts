export type StatutMoniteur = 'Disponible' | 'En mission' | 'Absent'
export type EtatVehicule = 'Disponible' | 'En maintenance' | 'En panne'
export type StatutEleve =
  | 'Prospect'
  | 'Inscrit'
  | 'En formation'
  | 'Examen'
  | 'Admis'
  | 'Ajourné'
  | 'Terminé'
  | 'Abandon'
export type StatutSeance = 'Planifié' | 'Effectué' | 'Absent élève' | 'Annulé'
export type ResultatExamen = 'En attente' | 'Admis' | 'Ajourné' | 'Échec'
export type StatutFacture = 'Non payée' | 'Partielle' | 'Payée' | 'Impayée'
export type ModePaiement = 'Espèces' | 'Orange Money' | 'Wave' | 'Virement'
export type CategorieDepense =
  | 'Carburant'
  | 'Entretien'
  | 'Réparations'
  | 'Assurance'
  | 'Salaires'
  | 'Fournitures'
  | 'Autres'
export type Role =
  | 'Super Administrateur'
  | 'Directeur'
  | 'Responsable adjoint'
  | 'Comptable'
  | 'Moniteur'
  | 'Secrétaire'

export type Permis = {
  id: string
  code: string
  libelle: string
}

export const PERMIS_CATEGORIES: { code: string; libelle: string }[] = [
  { code: 'A',    libelle: 'Deux-roues et motos' },
  { code: 'B',    libelle: 'Voitures particulières (8 places maximum)' },
  { code: 'C',    libelle: 'Camions et transport de marchandises' },
  { code: 'D',    libelle: 'Bus et transport en commun' },
  { code: 'E',    libelle: 'Véhicules articulés et remorques lourdes' },
  { code: 'F',    libelle: 'Véhicules adaptés aux personnes handicapées' },
  { code: 'BCDE', libelle: 'Permis professionnel toutes catégories' },
]

export type Formation = {
  id: string
  nom: string
  description: string
  prix: number
  actif: boolean
}

export type Moniteur = {
  id: string
  nom: string
  prenom: string
  telephone: string
  email: string
  specialite: string
  statut: StatutMoniteur
  seances?: number
}

export type Vehicule = {
  id: string
  marque: string
  modele: string
  immatriculation: string
  etat: EtatVehicule
  seances?: number
  derniereDepense?: string
}

export type Inspecteur = {
  id: string
  nom: string
  prenom: string
  telephone: string
  email: string
  actif: boolean
}

export type Eleve = {
  id: string
  code: string
  nom: string
  prenom: string
  telephone: string
  email: string
  adresse: string
  photoCni: string
  photoProfil: string
  dateNaissance: string
  lieuNaissance: string
  sexe: string
  nationalite: string
  typePiece: string
  numPiece: string
  typePermis: string
  statut: StatutEleve
  dateInscription: string
  seancesFaites: number
  seancesTotales: number
  solde: number
  estParraine: boolean
  parrainNom: string
  moniteur: string
  accesPortail?: boolean
}

export type Seance = {
  id: string
  eleve: string
  eleveCode: string
  moniteur: string
  moniteurId: string
  vehicule: string
  vehiculeId: string
  lieuRdv: string
  date: string
  heureDebut: string
  heureFin: string
  duree: number
  statut: StatutSeance
  notes: string
  type?: string
  titre?: string
}

export type Examen = {
  id: string
  eleve: string
  eleveCode: string
  typeExamen: string
  typePermis: string
  dateExamen: string
  inspecteur: string
  resultat: ResultatExamen
  notes: string
}

export type CandidatSession = {
  nomComplet: string
  identifiant: string
  telephone: string
  categoriePermis: string
  resultat: ResultatExamen
}

export type ExamenSession = {
  id: string
  numeroBordereau: string
  titre?: string
  lieu?: string
  categorie?: string
  statut?: string
  observations?: string
  date: string
  heure: string
  centre: string
  typeExamen: string
  inspecteur: string
  vehicule: string
  candidats: CandidatSession[]
}

export type Inscription = {
  id: string
  eleveId: string
  eleveCode: string
  formationId: string
  tarif: number
  dateInscription: string
}

export type Facture = {
  id: string
  numero: string
  eleve: string
  eleveCode: string
  formation: string
  inscriptionId: string
  montant: number
  paye: number
  reste: number
  statut: StatutFacture
  dateEmission: string
}

export type Paiement = {
  id: string
  factureId: string
  facture: string
  eleve: string
  montant: number
  modePaiement: ModePaiement
  reference: string
  datePaiement: string
}

export type Depense = {
  id: string
  categorie: CategorieDepense
  montant: number
  description: string
  modePaiement: ModePaiement
  vehicule: string
  justificatif: string
  date: string
}

export type Profile = {
  id: string
  name: string
  email: string
  role: Role
  actif: boolean
}

export type FaqItem = {
  id: string
  q: string
  r: string
  sortOrder: number
}
