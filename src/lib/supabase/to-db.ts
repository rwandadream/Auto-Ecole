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
  Permis,
  Profile,
  Seance,
  Vehicule,
} from '@/store/data-store'
import type { TablesInsert, TablesUpdate } from '@/lib/supabase/database.types'
import {
  CATEGORIE_DEPENSE_TO_DB,
  ETAT_VEHICULE_TO_DB,
  MODE_PAIEMENT_TO_DB,
  RESULTAT_EXAMEN_TO_DB,
  STATUT_ELEVE_TO_DB,
  STATUT_FACTURE_TO_DB,
  STATUT_MONITEUR_TO_DB,
  STATUT_SEANCE_TO_DB,
  parseFrDateToIso,
  roleToDb,
} from '@/lib/supabase/db-maps'
import { DEFAULT_LIEU_RDV } from '@/lib/domain/constants'
import type { FaqItem } from '@/lib/domain/types'

export function toDbEleve(
  eleve: Eleve,
  moniteurId?: string | null,
): TablesInsert<'eleves'> {
  return {
    id: eleve.id.includes('-') && eleve.id.length === 36 ? eleve.id : undefined,
    code: eleve.code,
    dossier_code: eleve.code,
    nom: eleve.nom,
    prenom: eleve.prenom,
    telephone: eleve.telephone,
    email: eleve.email || null,
    adresse: eleve.adresse || null,
    photo_cni: eleve.photoCni || null,
    photo_profil: eleve.photoProfil || null,
    date_naissance: eleve.dateNaissance || null,
    lieu_naissance: eleve.lieuNaissance || null,
    sexe: eleve.sexe || null,
    nationalite: eleve.nationalite || null,
    type_piece: eleve.typePiece || null,
    num_piece: eleve.numPiece || null,
    type_permis: eleve.typePermis || null,
    statut: STATUT_ELEVE_TO_DB[eleve.statut] ?? 'prospect',
    est_parraine: eleve.estParraine,
    parrain_nom: eleve.parrainNom || null,
    date_inscription: parseFrDateToIso(eleve.dateInscription) ?? undefined,
    seances_faites: eleve.seancesFaites,
    seances_totales: eleve.seancesTotales,
    moniteur_id: moniteurId ?? null,
  }
}

export function toDbMoniteur(m: Moniteur): TablesInsert<'moniteurs'> {
  return {
    id: m.id.length === 36 ? m.id : undefined,
    nom: m.nom,
    prenom: m.prenom,
    telephone: m.telephone,
    email: m.email || null,
    specialite: m.specialite || null,
    statut: STATUT_MONITEUR_TO_DB[m.statut] ?? 'Disponible',
  }
}

export function toDbVehicule(v: Vehicule): TablesInsert<'vehicules'> {
  return {
    id: v.id.length === 36 ? v.id : undefined,
    marque: v.marque,
    modele: v.modele,
    immatriculation: v.immatriculation,
    etat: ETAT_VEHICULE_TO_DB[v.etat] ?? 'Disponible',
  }
}

export function toDbFormation(f: Formation): TablesInsert<'formations'> {
  return {
    id: f.id.length === 36 ? f.id : undefined,
    nom: f.nom,
    description: f.description,
    prix: f.prix,
    actif: f.actif,
  }
}

export function toDbInspecteur(i: Inspecteur): TablesInsert<'inspecteurs'> {
  return {
    id: i.id.length === 36 ? i.id : undefined,
    nom: i.nom,
    prenom: i.prenom,
    telephone: i.telephone || null,
    email: i.email || null,
    actif: i.actif,
  }
}

export function toDbPermis(p: Permis): TablesInsert<'permis'> {
  return {
    id: p.id.length === 36 ? p.id : undefined,
    code: p.code,
    libelle: p.libelle,
  }
}

export function toDbSeance(
  s: Seance,
  eleveId: string,
  moniteurId: string,
  vehiculeId: string | null,
): TablesInsert<'seances'> {
  return {
    id: s.id.length === 36 ? s.id : undefined,
    eleve_id: eleveId,
    moniteur_id: moniteurId,
    vehicule_id: vehiculeId,
    date_seance: s.date || null,
    heure_debut: s.heureDebut || null,
    heure_fin: s.heureFin || null,
    duree_minutes: s.duree,
    lieu: s.lieuRdv || DEFAULT_LIEU_RDV,
    type: 'Formation',
    titre: `Séance ${s.eleve}`,
    statut: STATUT_SEANCE_TO_DB[s.statut] ?? 'planifie',
    notes: s.notes || null,
  }
}

export function toDbExamen(
  e: Examen,
  eleveId: string,
  inspecteurId: string | null,
): TablesInsert<'examens'> {
  return {
    id: e.id.length === 36 ? e.id : undefined,
    eleve_id: eleveId,
    inspecteur_id: inspecteurId,
    type_examen: e.typeExamen,
    type_permis: e.typePermis,
    date_examen: parseFrDateToIso(e.dateExamen) ?? new Date().toISOString().slice(0, 10),
    resultat: RESULTAT_EXAMEN_TO_DB[e.resultat] ?? 'en_attente',
    notes: e.notes || null,
  }
}

export function toDbInscription(
  i: Inscription,
  eleveId: string,
): TablesInsert<'inscriptions'> {
  return {
    id: i.id.length === 36 ? i.id : undefined,
    eleve_id: eleveId,
    formation_id: i.formationId,
    tarif: i.tarif,
    date_inscription: parseFrDateToIso(i.dateInscription) ?? undefined,
  }
}

export function toDbFacture(
  f: Facture,
  eleveId: string,
): TablesInsert<'factures'> {
  return {
    id: f.id.length === 36 ? f.id : undefined,
    numero: f.numero,
    eleve_id: eleveId,
    inscription_id: f.inscriptionId || null,
    montant: f.montant,
    statut: STATUT_FACTURE_TO_DB[f.statut] ?? 'non_payee',
    date_emission: parseFrDateToIso(f.dateEmission) ?? undefined,
  }
}

export function toDbPaiement(
  montant: number,
  factureId: string,
  eleveId: string,
  mode: string,
  reference: string,
  datePaiement: string,
): TablesInsert<'paiements'> {
  return {
    facture_id: factureId,
    eleve_id: eleveId,
    montant,
    mode_paiement: MODE_PAIEMENT_TO_DB[mode as keyof typeof MODE_PAIEMENT_TO_DB] ?? mode.toLowerCase(),
    reference: reference || null,
    date_paiement: parseFrDateToIso(datePaiement) ?? undefined,
  }
}

export function toDbDepense(
  d: Depense,
  vehiculeId: string | null,
): TablesInsert<'depenses'> {
  return {
    id: d.id.length === 36 ? d.id : undefined,
    categorie: CATEGORIE_DEPENSE_TO_DB[d.categorie] ?? 'autres',
    montant: d.montant,
    description: d.description,
    mode_paiement: MODE_PAIEMENT_TO_DB[d.modePaiement] ?? 'especes',
    vehicule_id: vehiculeId,
    justificatif_url: d.justificatif || null,
    date_depense: parseFrDateToIso(d.date) ?? undefined,
  }
}

export function toDbProfile(p: Profile): TablesUpdate<'profiles'> {
  return {
    name: p.name,
    email: p.email,
    role: roleToDb(p.role),
    actif: p.actif,
  }
}

export function toDbExamenSession(
  s: ExamenSession,
  inspecteurId: string | null,
  vehiculeId: string | null,
  createdBy?: string | null,
): TablesInsert<'examen_sessions'> {
  const dateIso = parseFrDateToIso(s.date) ?? new Date().toISOString().slice(0, 10)
  return {
    id: s.id.length === 36 ? s.id : undefined,
    numero_bordereau: s.numeroBordereau,
    titre: s.titre ?? `Session ${s.typeExamen} — ${s.centre}`,
    type_examen: s.typeExamen,
    date_examen: dateIso,
    heure_examen: s.heure || '08:00',
    centre: s.centre,
    lieu: s.lieu ?? s.centre,
    categorie: s.categorie ?? 'B',
    statut: s.statut ?? 'brouillon',
    inspecteur_id: inspecteurId,
    vehicule_id: vehiculeId,
    observations: s.observations ?? null,
    created_by: createdBy ?? null,
  }
}

export function toDbExamenSessionEleve(
  sessionId: string,
  eleveId: string,
  candidat: ExamenSession['candidats'][number],
) {
  return {
    session_id: sessionId,
    eleve_id: eleveId,
    nom_complet: candidat.nomComplet,
    identifiant: candidat.identifiant,
    telephone: candidat.telephone,
    categorie_permis: candidat.categoriePermis,
    resultat: RESULTAT_EXAMEN_TO_DB[candidat.resultat] ?? 'en_attente',
  }
}

export function toDbFaqItem(item: FaqItem): TablesInsert<'faq_items'> {
  return {
    id: item.id.length === 36 ? item.id : undefined,
    question: item.q,
    answer: item.r,
    sort_order: item.sortOrder,
  }
}
