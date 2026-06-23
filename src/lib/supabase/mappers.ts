import type {
  StatutEleve,
  StatutMoniteur,
  EtatVehicule,
  StatutSeance,
  StatutFacture,
  ModePaiement,
  CategorieDepense,
  ResultatExamen,
  Role,
  FaqItem,
} from '@/lib/domain/types'
import type {
  Depense,
  Eleve,
  Examen,
  ExamenSession,
  Facture,
  Formation,
  Inspecteur,
  Inscription,
  Moniteur,
  Paiement,
  Permis,
  Profile,
  Seance,
  Vehicule,
} from '@/store/data-store'
import { mapRoleFromDb } from '@/lib/supabase/roles'

function formatIsoDateFr(iso: string | null | undefined): string {
  if (!iso) return ''
  const date = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function labelPerson(prenom: string, nom: string) {
  return `${prenom} ${nom}`.trim()
}

function labelVehicule(marque: string | null, modele: string | null, immatriculation: string) {
  return `${marque ?? ''} ${modele ?? ''} (${immatriculation})`.trim()
}

const STATUT_ELEVE: Record<string, StatutEleve> = {
  prospect: 'Prospect',
  inscrit: 'Inscrit',
  en_formation: 'En formation',
  examen: 'Examen',
  admis: 'Admis',
  ajourne: 'Ajourné',
  termine: 'Terminé',
  abandon: 'Abandon',
}

const STATUT_SEANCE: Record<string, StatutSeance> = {
  planifie: 'Planifié',
  effectue: 'Effectué',
  absent_eleve: 'Absent élève',
  annule: 'Annulé',
}

const STATUT_FACTURE: Record<string, StatutFacture> = {
  non_payee: 'Non payée',
  partielle: 'Partielle',
  payee: 'Payée',
  impayee: 'Impayée',
}

const MODE_PAIEMENT: Record<string, ModePaiement> = {
  especes: 'Espèces',
  orange_money: 'Orange Money',
  wave: 'Wave',
  virement: 'Virement',
}

const CATEGORIE_DEPENSE: Record<string, CategorieDepense> = {
  carburant: 'Carburant',
  entretien: 'Entretien',
  reparations: 'Réparations',
  assurance: 'Assurance',
  salaires: 'Salaires',
  fournitures: 'Fournitures',
  autres: 'Autres',
}

const RESULTAT_EXAMEN: Record<string, ResultatExamen> = {
  en_attente: 'En attente',
  admis: 'Admis',
  echec: 'Échec',
  ajourne: 'Ajourné',
}

export function mapPermis(row: { id: string; code: string; libelle: string }): Permis {
  return { id: row.id, code: row.code, libelle: row.libelle }
}

export function mapFormation(row: {
  id: string
  nom: string
  description: string | null
  prix: number | null
  actif: boolean | null
}): Formation {
  return {
    id: row.id,
    nom: row.nom,
    description: row.description ?? '',
    prix: Number(row.prix ?? 0),
    actif: row.actif ?? true,
  }
}

export function mapMoniteur(
  row: {
    id: string
    nom: string
    prenom: string
    telephone: string
    email: string | null
    specialite: string | null
    statut: string | null
  },
  seances = 0,
): Moniteur {
  return {
    id: row.id,
    nom: row.nom,
    prenom: row.prenom,
    telephone: row.telephone,
    email: row.email ?? '',
    specialite: row.specialite ?? '',
    statut: (row.statut ?? 'Disponible') as StatutMoniteur,
    seances,
  }
}

export function mapVehicule(
  row: {
    id: string
    marque: string | null
    modele: string | null
    immatriculation: string
    etat: string | null
  },
  seances = 0,
  derniereDepense = '',
): Vehicule {
  return {
    id: row.id,
    marque: row.marque ?? '',
    modele: row.modele ?? '',
    immatriculation: row.immatriculation,
    etat: (row.etat ?? 'Disponible') as EtatVehicule,
    seances,
    derniereDepense,
  }
}

export function mapInspecteur(row: {
  id: string
  nom: string
  prenom: string
  telephone: string | null
  email: string | null
  actif: boolean | null
}): Inspecteur {
  return {
    id: row.id,
    nom: row.nom,
    prenom: row.prenom,
    telephone: row.telephone ?? '',
    email: row.email ?? '',
    actif: row.actif ?? true,
  }
}

export function mapProfile(row: {
  id: string
  name: string | null
  email: string
  role: string | null
  actif: boolean | null
}): Profile {
  return {
    id: row.id,
    name: row.name ?? '',
    email: row.email,
    role: mapRoleFromDb(row.role ?? '') as Role,
    actif: row.actif ?? true,
  }
}

export function mapEleve(
  row: {
    id: string
    code?: string | null
    dossier_code?: string | null
    nom: string
    prenom: string
    telephone: string
    email?: string | null
    adresse?: string | null
    photo_cni?: string | null
    photo_profil?: string | null
    date_naissance?: string | null
    lieu_naissance?: string | null
    sexe?: string | null
    nationalite?: string | null
    type_piece?: string | null
    num_piece?: string | null
    type_permis?: string | null
    statut: string | null
    est_parraine?: boolean | null
    parrain_nom?: string | null
    date_inscription?: string | null
    seances_faites?: number | null
    seances_totales?: number | null
    solde?: number | null
    moniteur_id?: string | null
    inspecteur?: string | null
    acces_portail?: boolean | null
  },
  moniteurLabel = 'Non assigné',
): Eleve {
  const code = row.code ?? row.dossier_code ?? ''
  return {
    id: row.id,
    code,
    nom: row.nom,
    prenom: row.prenom,
    telephone: row.telephone,
    email: row.email ?? '',
    adresse: row.adresse ?? '',
    photoCni: row.photo_cni ?? '',
    photoProfil: row.photo_profil ?? '',
    dateNaissance: row.date_naissance ?? '',
    lieuNaissance: row.lieu_naissance ?? '',
    sexe: row.sexe ?? '',
    nationalite: row.nationalite ?? '',
    typePiece: row.type_piece ?? '',
    numPiece: row.num_piece ?? '',
    typePermis: row.type_permis ?? 'B',
    statut: STATUT_ELEVE[row.statut ?? ''] ?? 'Prospect',
    dateInscription: formatIsoDateFr(row.date_inscription),
    seancesFaites: row.seances_faites ?? 0,
    seancesTotales: row.seances_totales ?? 20,
    solde: Number(row.solde ?? 0),
    estParraine: row.est_parraine ?? false,
    parrainNom: row.parrain_nom ?? '',
    moniteur: moniteurLabel,
    accesPortail: row.acces_portail !== false,
  }
}

export function mapInscription(
  row: {
    id: string
    eleve_id: string | null
    formation_id: string | null
    tarif: number
    date_inscription: string | null
  },
  eleveCode: string,
): Inscription {
  return {
    id: row.id,
    eleveId: row.eleve_id ?? '',
    eleveCode,
    formationId: row.formation_id ?? '',
    tarif: Number(row.tarif),
    dateInscription: formatIsoDateFr(row.date_inscription),
  }
}

export function mapSeance(row: {
  id: string
  eleve_id: string | null
  moniteur_id: string | null
  vehicule_id: string | null
  date_seance: string | null
  heure_debut: string | null
  heure_fin: string | null
  duree_minutes?: number | null
  lieu?: string | null
  lieu_rdv?: string | null
  statut: string | null
  notes: string | null
  eleve: { prenom: string; nom: string; code?: string | null; dossier_code?: string | null } | null
  moniteur: { prenom: string; nom: string } | null
  vehicule: { marque: string | null; modele: string | null; immatriculation: string } | null
}): Seance {
  const eleve = row.eleve
  const moniteur = row.moniteur
  const vehicule = row.vehicule
  return {
    id: row.id,
    eleve: eleve ? labelPerson(eleve.prenom, eleve.nom) : '',
    eleveCode: eleve?.code ?? eleve?.dossier_code ?? '',
    moniteur: moniteur ? labelPerson(moniteur.prenom, moniteur.nom) : '',
    moniteurId: row.moniteur_id ?? '',
    vehicule: vehicule
      ? labelVehicule(vehicule.marque, vehicule.modele, vehicule.immatriculation)
      : '—',
    vehiculeId: row.vehicule_id ?? '',
    lieuRdv: row.lieu ?? row.lieu_rdv ?? 'SARAH AUTO — Cocody',
    date: row.date_seance ?? '',
    heureDebut: row.heure_debut?.slice(0, 5) ?? '',
    heureFin: row.heure_fin?.slice(0, 5) ?? '',
    duree: row.duree_minutes ?? 60,
    statut: STATUT_SEANCE[row.statut ?? ''] ?? 'Planifié',
    notes: row.notes ?? '',
  }
}

export function mapExamen(row: {
  id: string
  eleve_id: string | null
  type_examen: string
  type_permis?: string | null
  date_examen: string | null
  inspecteur_nom?: string
  resultat: string | null
  notes?: string | null
  eleve?: { prenom: string; nom: string; code?: string | null; dossier_code?: string | null } | null
  inspecteur?: { prenom: string; nom: string } | null
}): Examen {
  const eleve = row.eleve
  const insp = row.inspecteur
  return {
    id: row.id,
    eleve: eleve ? labelPerson(eleve.prenom, eleve.nom) : '',
    eleveCode: eleve?.code ?? eleve?.dossier_code ?? '',
    typeExamen: row.type_examen as Examen['typeExamen'],
    typePermis: row.type_permis ?? 'B',
    dateExamen: formatIsoDateFr(row.date_examen),
    inspecteur: insp ? labelPerson(insp.prenom, insp.nom) : '—',
    resultat: RESULTAT_EXAMEN[row.resultat ?? ''] ?? 'En attente',
    notes: row.notes ?? '',
  }
}

export function mapExamenSession(row: {
  id: string
  numero_bordereau: string
  date_examen: string
  heure_examen: string
  centre: string
  type_examen: string
  titre: string
  lieu: string
  categorie: string
  statut: string
  observations: string | null
  inspecteur: { prenom: string; nom: string } | null
  vehicule: { marque: string | null; modele: string | null; immatriculation: string } | null
  examen_session_eleves: Array<{
    nom_complet: string
    identifiant: string
    telephone: string
    categorie_permis: string
    resultat: string | null
  }>
}): ExamenSession {
  const vehicule = row.vehicule
  const inspecteur = row.inspecteur
  return {
    id: row.id,
    numeroBordereau: row.numero_bordereau,
    titre: row.titre ?? '',
    lieu: row.lieu ?? row.centre,
    categorie: row.categorie ?? 'B',
    statut: row.statut ?? 'brouillon',
    observations: row.observations ?? '',
    date: formatIsoDateFr(row.date_examen),
    heure: row.heure_examen?.slice(0, 5) ?? '',
    centre: row.centre,
    typeExamen: row.type_examen as ExamenSession['typeExamen'],
    inspecteur: inspecteur ? labelPerson(inspecteur.prenom, inspecteur.nom) : '—',
    vehicule: vehicule
      ? labelVehicule(vehicule.marque, vehicule.modele, vehicule.immatriculation)
      : '—',
    candidats: (row.examen_session_eleves ?? []).map((c) => ({
      nomComplet: c.nom_complet,
      identifiant: c.identifiant,
      telephone: c.telephone,
      categoriePermis: c.categorie_permis,
      resultat: RESULTAT_EXAMEN[c.resultat ?? ''] ?? 'En attente',
    })),
  }
}

export function mapFacture(
  row: {
    id: string
    numero: string
    eleve_id: string | null
    inscription_id?: string | null
    montant: number
    statut: string | null
    date_emission: string | null
    eleve?: { prenom: string; nom: string; code?: string | null; dossier_code?: string | null } | null
  },
  paye = 0,
  formationLibelle = '',
): Facture {
  const montant = Number(row.montant)
  const eleve = row.eleve
  return {
    id: row.id,
    numero: row.numero,
    eleve: eleve ? labelPerson(eleve.prenom, eleve.nom) : '',
    eleveCode: eleve?.code ?? eleve?.dossier_code ?? '',
    formation: formationLibelle,
    inscriptionId: row.inscription_id ?? '',
    montant,
    paye,
    reste: Math.max(0, montant - paye),
    statut: STATUT_FACTURE[row.statut ?? ''] ?? 'Non payée',
    dateEmission: formatIsoDateFr(row.date_emission),
  }
}

export function mapPaiement(row: {
  id: string
  facture_id: string | null
  montant: number
  mode_paiement: string | null
  reference: string | null
  date_paiement: string | null
  facture?: { numero: string } | null
  eleve?: { prenom: string; nom: string } | null
}): Paiement {
  const eleve = row.eleve
  return {
    id: row.id,
    factureId: row.facture_id ?? '',
    facture: row.facture?.numero ?? '',
    eleve: eleve ? labelPerson(eleve.prenom, eleve.nom) : '',
    montant: Number(row.montant),
    modePaiement: MODE_PAIEMENT[row.mode_paiement ?? ''] ?? 'Espèces',
    reference: row.reference ?? '',
    datePaiement: formatIsoDateFr(row.date_paiement),
  }
}

export function mapDepense(row: {
  id: string
  categorie: string
  montant: number
  description: string | null
  mode_paiement: string | null
  justificatif_url: string | null
  date_depense: string | null
  vehicule: { marque: string | null; modele: string | null; immatriculation: string } | null
}): Depense {
  const vehicule = row.vehicule
  return {
    id: row.id,
    categorie: CATEGORIE_DEPENSE[row.categorie] ?? 'Autres',
    montant: Number(row.montant),
    description: row.description ?? '',
    modePaiement: MODE_PAIEMENT[row.mode_paiement ?? ''] ?? 'Espèces',
    vehicule: vehicule
      ? labelVehicule(vehicule.marque, vehicule.modele, vehicule.immatriculation)
      : '—',
    justificatif: row.justificatif_url ?? '',
    date: formatIsoDateFr(row.date_depense),
  }
}

export function mapEleveStatutFromDb(statut: string): StatutEleve {
  return STATUT_ELEVE[statut] ?? 'Prospect'
}

export function mapSeanceStatutFromDb(statut: string): StatutSeance {
  return STATUT_SEANCE[statut] ?? 'Planifié'
}

export function mapFaqItem(row: {
  id: string
  question: string
  answer: string
  sort_order: number
}): FaqItem {
  return {
    id: row.id,
    q: row.question,
    r: row.answer,
    sortOrder: row.sort_order,
  }
}
