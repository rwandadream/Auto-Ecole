// ============================================================
//  SARAH AUTO — Données mockées (frontend only)
//  Basé sur le modèle de données du cahier des charges §3
// ============================================================

// --- Types de permis ---
export const permis = [
  { id: 'p1', code: 'A', libelle: 'Moto' },
  { id: 'p2', code: 'B', libelle: 'Voiture' },
  { id: 'p3', code: 'AB', libelle: 'Moto + Voiture' },
  { id: 'p4', code: 'C', libelle: 'Poids lourd' },
]

// --- Formations (catalogue) ---
export const formations = [
  { id: 'f1', nom: 'Pack Permis B standard', description: '20h conduite + code illimité', prix: 350000, actif: true },
  { id: 'f2', nom: 'Pack Permis A moto', description: '15h conduite + code moto', prix: 280000, actif: true },
  { id: 'f3', nom: 'Pack Permis B premium', description: '30h conduite + code + examen blanc', prix: 480000, actif: true },
  { id: 'f4', nom: 'Code seul', description: "Préparation au code de la route", prix: 50000, actif: true },
  { id: 'f5', nom: 'Pack Permis AB complet', description: 'Moto + Voiture, 40h conduite', prix: 620000, actif: false },
]

// --- Moniteurs ---
export type StatutMoniteur = 'Disponible' | 'En mission' | 'Absent'
export const moniteurs = [
  { id: 'm1', nom: 'Koffi', prenom: 'Jean-Marc', telephone: '+225 07 11 22 33', email: 'jm.koffi@sarahauto.ci', specialite: 'Conduite', statut: 'Disponible' as StatutMoniteur, seances: 142 },
  { id: 'm2', nom: 'Yao', prenom: 'Marie-Adèle', telephone: '+225 05 44 55 66', email: 'ma.yao@sarahauto.ci', specialite: 'Conduite', statut: 'En mission' as StatutMoniteur, seances: 98 },
  { id: 'm3', nom: 'Brou', prenom: 'Franck', telephone: '+225 01 77 88 99', email: 'f.brou@sarahauto.ci', specialite: 'Code', statut: 'Disponible' as StatutMoniteur, seances: 76 },
  { id: 'm4', nom: 'Adjoua', prenom: 'Christelle', telephone: '+225 07 22 33 44', email: 'c.adjoua@sarahauto.ci', specialite: 'Conduite', statut: 'Disponible' as StatutMoniteur, seances: 120 },
  { id: 'm5', nom: 'Konan', prenom: 'Didier', telephone: '+225 05 66 77 88', email: 'd.konan@sarahauto.ci', specialite: 'Conduite', statut: 'Absent' as StatutMoniteur, seances: 64 },
  { id: 'm6', nom: 'Aya', prenom: 'Sandrine', telephone: '+225 01 99 00 11', email: 's.aya@sarahauto.ci', specialite: 'Code', statut: 'Disponible' as StatutMoniteur, seances: 53 },
]

// --- Véhicules ---
export type EtatVehicule = 'Disponible' | 'En maintenance' | 'En panne'
export const vehicules = [
  { id: 'v1', marque: 'Toyota', modele: 'Yaris', immatriculation: 'AB-1247-CI', etat: 'Disponible' as EtatVehicule, seances: 210, derniereDepense: '12 Nov 2026' },
  { id: 'v2', marque: 'Peugeot', modele: '208', immatriculation: 'CD-3389-CI', etat: 'Disponible' as EtatVehicule, seances: 187, derniereDepense: '08 Nov 2026' },
  { id: 'v3', marque: 'Renault', modele: 'Clio', immatriculation: 'EF-5502-CI', etat: 'En maintenance' as EtatVehicule, seances: 165, derniereDepense: '15 Nov 2026' },
  { id: 'v4', marque: 'Hyundai', modele: 'i20', immatriculation: 'GH-7714-CI', etat: 'Disponible' as EtatVehicule, seances: 143, derniereDepense: '03 Nov 2026' },
  { id: 'v5', marque: 'Yamaha', modele: 'YZF-R3', immatriculation: 'IJ-9025-CI', etat: 'Disponible' as EtatVehicule, seances: 98, derniereDepense: '10 Nov 2026' },
  { id: 'v6', marque: 'Volkswagen', modele: 'Polo', immatriculation: 'KL-1183-CI', etat: 'En panne' as EtatVehicule, seances: 132, derniereDepense: '18 Nov 2026' },
]

// --- Inspecteurs ---
export const inspecteurs = [
  { id: 'i1', nom: 'N\'Guessan', prenom: 'Paul', telephone: '+225 07 01 02 03', email: 'p.nguessan@examen.gouv.ci', actif: true },
  { id: 'i2', nom: 'Coulibaly', prenom: 'Aminata', telephone: '+225 05 04 05 06', email: 'a.coulibaly@examen.gouv.ci', actif: true },
  { id: 'i3', nom: 'Diabaté', prenom: 'Mamadou', telephone: '+225 01 07 08 09', email: 'm.diabate@examen.gouv.ci', actif: false },
]

// --- Élèves ---
export type StatutEleve = 'Prospect' | 'Inscrit' | 'En formation' | 'Examen' | 'Admis' | 'Ajourné' | 'Terminé' | 'Abandon'
export const eleves = [
  { id: 'e1', code: 'EL-2401', nom: 'Koné', prenom: 'Aminata', telephone: '+225 07 12 34 56', email: 'aminata.kone@email.com', dateNaissance: '1998-04-12', lieuNaissance: 'Bouaké', sexe: 'F', nationalite: 'Ivoirienne', typePiece: 'CNI', numPiece: 'CNI-998877', typePermis: 'B', statut: 'En formation' as StatutEleve, dateInscription: '02 Déc 2026', seancesFaites: 12, seancesTotales: 20, solde: 45000, estParraine: false, parrainNom: '', moniteur: 'Jean-Marc Koffi' },
  { id: 'e2', code: 'EL-2402', nom: 'Traoré', prenom: 'Moussa', telephone: '+225 05 98 76 54', email: 'moussa.traore@email.com', dateNaissance: '1995-09-23', lieuNaissance: 'Korhogo', sexe: 'M', nationalite: 'Ivoirienne', typePiece: 'CNI', numPiece: 'CNI-445566', typePermis: 'A', statut: 'Admis' as StatutEleve, dateInscription: '01 Déc 2026', seancesFaites: 20, seancesTotales: 20, solde: 0, estParraine: false, parrainNom: '', moniteur: 'Christelle Adjoua' },
  { id: 'e3', code: 'EL-2403', nom: 'Bamba', prenom: 'Fatou', telephone: '+225 01 23 45 67', email: 'fatou.bamba@email.com', dateNaissance: '2000-01-15', lieuNaissance: 'Daloa', sexe: 'F', nationalite: 'Ivoirienne', typePiece: 'CNI', numPiece: 'CNI-112233', typePermis: 'B', statut: 'Examen' as StatutEleve, dateInscription: '30 Nov 2026', seancesFaites: 18, seancesTotales: 20, solde: 15000, estParraine: true, parrainNom: 'Moussa Traoré', moniteur: 'Jean-Marc Koffi' },
  { id: 'e4', code: 'EL-2404', nom: 'Cissé', prenom: 'Ibrahim', telephone: '+225 07 44 55 66', email: 'ibrahim.cisse@email.com', dateNaissance: '1993-07-30', lieuNaissance: 'Abidjan', sexe: 'M', nationalite: 'Ivoirienne', typePiece: 'CNI', numPiece: 'CNI-778899', typePermis: 'AB', statut: 'Inscrit' as StatutEleve, dateInscription: '29 Nov 2026', seancesFaites: 0, seancesTotales: 40, solde: 120000, estParraine: false, parrainNom: '', moniteur: 'Non assigné' },
  { id: 'e5', code: 'EL-2405', nom: 'Diop', prenom: 'Awa', telephone: '+225 05 77 88 99', email: 'awa.diop@email.com', dateNaissance: '1997-11-08', lieuNaissance: 'Yamoussoukro', sexe: 'F', nationalite: 'Sénégalaise', typePiece: 'Passeport', numPiece: 'PAS-556677', typePermis: 'B', statut: 'Ajourné' as StatutEleve, dateInscription: '28 Nov 2026', seancesFaites: 20, seancesTotales: 20, solde: 0, estParraine: false, parrainNom: '', moniteur: 'Marie-Adèle Yao' },
  { id: 'e6', code: 'EL-2406', nom: 'Camara', prenom: 'Sékou', telephone: '+225 01 33 44 55', email: 'sekou.camara@email.com', dateNaissance: '1999-03-19', lieuNaissance: 'Man', sexe: 'M', nationalite: 'Guinéenne', typePiece: 'CNI', numPiece: 'CNI-223344', typePermis: 'A', statut: 'En formation' as StatutEleve, dateInscription: '27 Nov 2026', seancesFaites: 8, seancesTotales: 15, solde: 80000, estParraine: true, parrainNom: 'Aminata Koné', moniteur: 'Christelle Adjoua' },
  { id: 'e7', code: 'EL-2407', nom: 'Touré', prenom: 'Mariam', telephone: '+225 07 66 77 88', email: 'mariam.toure@email.com', dateNaissance: '2001-06-25', lieuNaissance: 'Abidjan', sexe: 'F', nationalite: 'Ivoirienne', typePiece: 'CNI', numPiece: 'CNI-334455', typePermis: 'B', statut: 'Prospect' as StatutEleve, dateInscription: '26 Nov 2026', seancesFaites: 0, seancesTotales: 20, solde: 20000, estParraine: false, parrainNom: '', moniteur: 'Non assigné' },
  { id: 'e8', code: 'EL-2408', nom: 'Fall', prenom: 'Cheikh', telephone: '+225 05 11 22 33', email: 'cheikh.fall@email.com', dateNaissance: '1994-12-03', lieuNaissance: 'Bouaké', sexe: 'M', nationalite: 'Ivoirienne', typePiece: 'CNI', numPiece: 'CNI-667788', typePermis: 'B', statut: 'Terminé' as StatutEleve, dateInscription: '20 Nov 2026', seancesFaites: 20, seancesTotales: 20, solde: 0, estParraine: false, parrainNom: '', moniteur: 'Jean-Marc Koffi' },
  { id: 'e9', code: 'EL-2409', nom: 'Sangaré', prenom: 'Aïcha', telephone: '+225 01 55 66 77', email: 'aicha.sangare@email.com', dateNaissance: '1996-08-17', lieuNaissance: 'Katiola', sexe: 'F', nationalite: 'Ivoirienne', typePiece: 'CNI', numPiece: 'CNI-990011', typePermis: 'AB', statut: 'En formation' as StatutEleve, dateInscription: '18 Nov 2026', seancesFaites: 15, seancesTotales: 40, solde: 65000, estParraine: true, parrainNom: 'Cheikh Fall', moniteur: 'Didier Konan' },
  { id: 'e10', code: 'EL-2410', nom: 'Ouattara', prenom: 'Bakary', telephone: '+225 07 88 99 00', email: 'bakary.ouattara@email.com', dateNaissance: '1992-02-28', lieuNaissance: 'Abidjan', sexe: 'M', nationalite: 'Ivoirienne', typePiece: 'CNI', numPiece: 'CNI-445500', typePermis: 'B', statut: 'Abandon' as StatutEleve, dateInscription: '10 Nov 2026', seancesFaites: 5, seancesTotales: 20, solde: 30000, estParraine: false, parrainNom: '', moniteur: 'Marie-Adèle Yao' },
]

// --- Séances (planning) ---
export type StatutSeance = 'Planifié' | 'Effectué' | 'Absent élève' | 'Annulé'
export const seances = [
  { id: 's1', eleve: 'Aminata Koné', eleveCode: 'EL-2401', moniteur: 'Jean-Marc Koffi', vehicule: 'Toyota Yaris (AB-1247-CI)', date: '2026-12-02', heureDebut: '08:00', heureFin: '09:30', duree: 90, statut: 'Effectué' as StatutSeance, notes: 'Bien, progression satisfaisante sur les créneaux' },
  { id: 's2', eleve: 'Moussa Traoré', eleveCode: 'EL-2402', moniteur: 'Christelle Adjoua', vehicule: 'Yamaha YZF-R3 (IJ-9025-CI)', date: '2026-12-02', heureDebut: '10:00', heureFin: '11:00', duree: 60, statut: 'Effectué' as StatutSeance, notes: 'Examen réussi, excellente maîtrise' },
  { id: 's3', eleve: 'Fatou Bamba', eleveCode: 'EL-2403', moniteur: 'Jean-Marc Koffi', vehicule: 'Peugeot 208 (CD-3389-CI)', date: '2026-12-03', heureDebut: '14:00', heureFin: '15:30', duree: 90, statut: 'Planifié' as StatutSeance, notes: '' },
  { id: 's4', eleve: 'Sékou Camara', eleveCode: 'EL-2406', moniteur: 'Christelle Adjoua', vehicule: 'Hyundai i20 (GH-7714-CI)', date: '2026-12-03', heureDebut: '16:00', heureFin: '17:00', duree: 60, statut: 'Planifié' as StatutSeance, notes: '' },
  { id: 's5', eleve: 'Awa Diop', eleveCode: 'EL-2405', moniteur: 'Marie-Adèle Yao', vehicule: 'Toyota Yaris (AB-1247-CI)', date: '2026-12-01', heureDebut: '09:00', heureFin: '10:30', duree: 90, statut: 'Absent élève' as StatutSeance, notes: 'Élève absent sans préavis' },
  { id: 's6', eleve: 'Aïcha Sangaré', eleveCode: 'EL-2409', moniteur: 'Didier Konan', vehicule: 'Peugeot 208 (CD-3389-CI)', date: '2026-12-04', heureDebut: '08:00', heureFin: '09:00', duree: 60, statut: 'Planifié' as StatutSeance, notes: '' },
  { id: 's7', eleve: 'Aminata Koné', eleveCode: 'EL-2401', moniteur: 'Jean-Marc Koffi', vehicule: 'Toyota Yaris (AB-1247-CI)', date: '2026-12-04', heureDebut: '10:00', heureFin: '11:30', duree: 90, statut: 'Planifié' as StatutSeance, notes: '' },
  { id: 's8', eleve: 'Bakary Ouattara', eleveCode: 'EL-2410', moniteur: 'Marie-Adèle Yao', vehicule: 'Renault Clio (EF-5502-CI)', date: '2026-11-28', heureDebut: '14:00', heureFin: '15:00', duree: 60, statut: 'Annulé' as StatutSeance, notes: 'Annulé — véhicule en maintenance' },
]

// --- Examens individuels ---
export type ResultatExamen = 'En attente' | 'Admis' | 'Échec'
export const examens = [
  { id: 'x1', eleve: 'Moussa Traoré', eleveCode: 'EL-2402', typeExamen: 'Conduite', typePermis: 'A', dateExamen: '01 Déc 2026', inspecteur: "Paul N'Guessan", resultat: 'Admis' as ResultatExamen, notes: 'Très bonne prestation' },
  { id: 'x2', eleve: 'Awa Diop', eleveCode: 'EL-2405', typeExamen: 'Conduite', typePermis: 'B', dateExamen: '25 Nov 2026', inspecteur: 'Aminata Coulibaly', resultat: 'Échec' as ResultatExamen, notes: 'Échec sur les manœuvres' },
  { id: 'x3', eleve: 'Fatou Bamba', eleveCode: 'EL-2403', typeExamen: 'Code', typePermis: 'B', dateExamen: '20 Nov 2026', inspecteur: '—', resultat: 'Admis' as ResultatExamen, notes: 'Code obtenu, 35/40' },
  { id: 'x4', eleve: 'Cheikh Fall', eleveCode: 'EL-2408', typeExamen: 'Conduite', typePermis: 'B', dateExamen: '15 Nov 2026', inspecteur: "Paul N'Guessan", resultat: 'Admis' as ResultatExamen, notes: 'Examen réussi du premier coup' },
  { id: 'x5', eleve: 'Sékou Camara', eleveCode: 'EL-2406', typeExamen: 'Code', typePermis: 'A', dateExamen: '2026-12-05', inspecteur: '—', resultat: 'En attente' as ResultatExamen, notes: 'Session planifiée' },
]

// --- Sessions collectives (bordereaux) ---
export type CandidatSession = {
  nomComplet: string
  identifiant: string
  telephone: string
  categoriePermis: string
  resultat: ResultatExamen
}
export const examenSessions = [
  {
    id: 'sess1',
    numeroBordereau: 'BORD-2026-018',
    date: '05 Déc 2026',
    heure: '08:00',
    centre: 'Centre d\'examen de Cocody',
    typeExamen: 'Code',
    inspecteur: 'Aminata Coulibaly',
    vehicule: '—',
    candidats: [
      { nomComplet: 'Sékou Camara', identifiant: 'EL-2406', telephone: '+225 01 33 44 55', categoriePermis: 'A', resultat: 'En attente' as ResultatExamen },
      { nomComplet: 'Mariam Touré', identifiant: 'EL-2407', telephone: '+225 07 66 77 88', categoriePermis: 'B', resultat: 'En attente' as ResultatExamen },
      { nomComplet: 'Ibrahim Cissé', identifiant: 'EL-2404', telephone: '+225 07 44 55 66', categoriePermis: 'AB', resultat: 'En attente' as ResultatExamen },
      { nomComplet: 'Aïcha Sangaré', identifiant: 'EL-2409', telephone: '+225 01 55 66 77', categoriePermis: 'AB', resultat: 'En attente' as ResultatExamen },
    ],
  },
  {
    id: 'sess2',
    numeroBordereau: 'BORD-2026-017',
    date: '25 Nov 2026',
    heure: '07:30',
    centre: 'Centre d\'examen de Yopougon',
    typeExamen: 'Conduite',
    inspecteur: "Paul N'Guessan",
    vehicule: 'Toyota Yaris (AB-1247-CI)',
    candidats: [
      { nomComplet: 'Awa Diop', identifiant: 'EL-2405', telephone: '+225 05 77 88 99', categoriePermis: 'B', resultat: 'Échec' as ResultatExamen },
      { nomComplet: 'Cheikh Fall', identifiant: 'EL-2408', telephone: '+225 05 11 22 33', categoriePermis: 'B', resultat: 'Admis' as ResultatExamen },
      { nomComplet: 'Moussa Traoré', identifiant: 'EL-2402', telephone: '+225 05 98 76 54', categoriePermis: 'A', resultat: 'Admis' as ResultatExamen },
    ],
  },
  {
    id: 'sess3',
    numeroBordereau: 'BORD-2026-016',
    date: '10 Nov 2026',
    heure: '08:00',
    centre: 'Centre d\'examen de Cocody',
    typeExamen: 'Code',
    inspecteur: 'Aminata Coulibaly',
    vehicule: '—',
    candidats: [
      { nomComplet: 'Fatou Bamba', identifiant: 'EL-2403', telephone: '+225 01 23 45 67', categoriePermis: 'B', resultat: 'Admis' as ResultatExamen },
      { nomComplet: 'Bakary Ouattara', identifiant: 'EL-2410', telephone: '+225 07 88 99 00', categoriePermis: 'B', resultat: 'Échec' as ResultatExamen },
    ],
  },
]

// --- Factures ---
export type StatutFacture = 'Non payée' | 'Partielle' | 'Payée' | 'Impayée'
export const factures = [
  { id: 'fac1', numero: 'FAC-2026-0142', eleve: 'Ibrahim Cissé', eleveCode: 'EL-2404', formation: 'Pack Permis AB complet', montant: 620000, paye: 500000, reste: 120000, statut: 'Impayée' as StatutFacture, dateEmission: '29 Nov 2026' },
  { id: 'fac2', numero: 'FAC-2026-0138', eleve: 'Sékou Camara', eleveCode: 'EL-2406', formation: 'Pack Permis A moto', montant: 280000, paye: 200000, reste: 80000, statut: 'Partielle' as StatutFacture, dateEmission: '27 Nov 2026' },
  { id: 'fac3', numero: 'FAC-2026-0135', eleve: 'Awa Diop', eleveCode: 'EL-2405', formation: 'Pack Permis B premium', montant: 480000, paye: 130000, reste: 350000, statut: 'Impayée' as StatutFacture, dateEmission: '28 Nov 2026' },
  { id: 'fac4', numero: 'FAC-2026-0129', eleve: 'Mariam Touré', eleveCode: 'EL-2407', formation: 'Pack Permis B standard', montant: 350000, paye: 110000, reste: 240000, statut: 'Partielle' as StatutFacture, dateEmission: '26 Nov 2026' },
  { id: 'fac5', numero: 'FAC-2026-0124', eleve: 'Cheikh Fall', eleveCode: 'EL-2408', formation: 'Pack Permis B standard', montant: 350000, paye: 0, reste: 350000, statut: 'Impayée' as StatutFacture, dateEmission: '20 Nov 2026' },
  { id: 'fac6', numero: 'FAC-2026-0120', eleve: 'Aminata Koné', eleveCode: 'EL-2401', formation: 'Pack Permis B standard', montant: 350000, paye: 305000, reste: 45000, statut: 'Partielle' as StatutFacture, dateEmission: '02 Déc 2026' },
  { id: 'fac7', numero: 'FAC-2026-0118', eleve: 'Moussa Traoré', eleveCode: 'EL-2402', formation: 'Pack Permis A moto', montant: 280000, paye: 280000, reste: 0, statut: 'Payée' as StatutFacture, dateEmission: '01 Déc 2026' },
  { id: 'fac8', numero: 'FAC-2026-0115', eleve: 'Fatou Bamba', eleveCode: 'EL-2403', formation: 'Pack Permis B standard', montant: 350000, paye: 335000, reste: 15000, statut: 'Partielle' as StatutFacture, dateEmission: '30 Nov 2026' },
  { id: 'fac9', numero: 'FAC-2026-0110', eleve: 'Aïcha Sangaré', eleveCode: 'EL-2409', formation: 'Pack Permis AB complet', montant: 620000, paye: 555000, reste: 65000, statut: 'Partielle' as StatutFacture, dateEmission: '18 Nov 2026' },
]

// --- Paiements ---
export type ModePaiement = 'Espèces' | 'Orange Money' | 'Wave' | 'Virement'
export const paiements = [
  { id: 'pa1', facture: 'FAC-2026-0142', eleve: 'Ibrahim Cissé', montant: 500000, modePaiement: 'Virement' as ModePaiement, reference: 'VIR-9988', datePaiement: '29 Nov 2026' },
  { id: 'pa2', facture: 'FAC-2026-0138', eleve: 'Sékou Camara', montant: 200000, modePaiement: 'Orange Money' as ModePaiement, reference: 'OM-554433', datePaiement: '27 Nov 2026' },
  { id: 'pa3', facture: 'FAC-2026-0135', eleve: 'Awa Diop', montant: 130000, modePaiement: 'Wave' as ModePaiement, reference: 'WV-221100', datePaiement: '28 Nov 2026' },
  { id: 'pa4', facture: 'FAC-2026-0129', eleve: 'Mariam Touré', montant: 110000, modePaiement: 'Espèces' as ModePaiement, reference: 'ESP-0078', datePaiement: '26 Nov 2026' },
  { id: 'pa5', facture: 'FAC-2026-0120', eleve: 'Aminata Koné', montant: 305000, modePaiement: 'Orange Money' as ModePaiement, reference: 'OM-110099', datePaiement: '02 Déc 2026' },
  { id: 'pa6', facture: 'FAC-2026-0118', eleve: 'Moussa Traoré', montant: 280000, modePaiement: 'Wave' as ModePaiement, reference: 'WV-778866', datePaiement: '01 Déc 2026' },
  { id: 'pa7', facture: 'FAC-2026-0115', eleve: 'Fatou Bamba', montant: 335000, modePaiement: 'Virement' as ModePaiement, reference: 'VIR-4455', datePaiement: '30 Nov 2026' },
  { id: 'pa8', facture: 'FAC-2026-0110', eleve: 'Aïcha Sangaré', montant: 555000, modePaiement: 'Orange Money' as ModePaiement, reference: 'OM-332211', datePaiement: '18 Nov 2026' },
]

// --- Dépenses (comptabilité) ---
export type CategorieDepense = 'Carburant' | 'Entretien' | 'Réparations' | 'Assurance' | 'Salaires' | 'Fournitures' | 'Autres'
export const depenses = [
  { id: 'd1', categorie: 'Carburant' as CategorieDepense, montant: 45000, description: 'Plein Toyota Yaris', modePaiement: 'Espèces' as ModePaiement, vehicule: 'Toyota Yaris (AB-1247-CI)', date: '15 Nov 2026' },
  { id: 'd2', categorie: 'Entretien' as CategorieDepense, montant: 85000, description: 'Vidange + filtres Renault Clio', modePaiement: 'Orange Money' as ModePaiement, vehicule: 'Renault Clio (EF-5502-CI)', date: '15 Nov 2026' },
  { id: 'd3', categorie: 'Salaires' as CategorieDepense, montant: 1200000, description: 'Salaires moniteurs Novembre', modePaiement: 'Virement' as ModePaiement, vehicule: '—', date: '30 Nov 2026' },
  { id: 'd4', categorie: 'Assurance' as CategorieDepense, montant: 320000, description: 'Assurance flotte trimestrielle', modePaiement: 'Virement' as ModePaiement, vehicule: '—', date: '05 Nov 2026' },
  { id: 'd5', categorie: 'Réparations' as CategorieDepense, montant: 175000, description: 'Embrayage Volkswagen Polo', modePaiement: 'Wave' as ModePaiement, vehicule: 'Volkswagen Polo (KL-1183-CI)', date: '18 Nov 2026' },
  { id: 'd6', categorie: 'Carburant' as CategorieDepense, montant: 38000, description: 'Plein Peugeot 208', modePaiement: 'Espèces' as ModePaiement, vehicule: 'Peugeot 208 (CD-3389-CI)', date: '08 Nov 2026' },
  { id: 'd7', categorie: 'Fournitures' as CategorieDepense, montant: 25000, description: 'Plaquettes + stylos cours de code', modePaiement: 'Espèces' as ModePaiement, vehicule: '—', date: '10 Nov 2026' },
  { id: 'd8', categorie: 'Carburant' as CategorieDepense, montant: 42000, description: 'Plein Hyundai i20', modePaiement: 'Orange Money' as ModePaiement, vehicule: 'Hyundai i20 (GH-7714-CI)', date: '03 Nov 2026' },
  { id: 'd9', categorie: 'Entretien' as CategorieDepense, montant: 60000, description: 'Pneus avant Yamaha YZF-R3', modePaiement: 'Wave' as ModePaiement, vehicule: 'Yamaha YZF-R3 (IJ-9025-CI)', date: '10 Nov 2026' },
  { id: 'd10', categorie: 'Autres' as CategorieDepense, montant: 15000, description: 'Frais de timbre bordereaux', modePaiement: 'Espèces' as ModePaiement, vehicule: '—', date: '12 Nov 2026' },
]

// --- Équipe (profiles) ---
export type Role = 'Administrateur principal' | 'Administrateur secondaire' | 'Comptable' | 'Moniteur' | 'Conseiller'
export const profiles = [
  { id: 'u1', name: 'Aïcha Diallo', email: 'a.diallo@sarahauto.ci', role: 'Administrateur principal' as Role, actif: true },
  { id: 'u2', name: 'Koffi Jean-Marc', email: 'jm.koffi@sarahauto.ci', role: 'Moniteur' as Role, actif: true },
  { id: 'u3', name: 'Brou Franck', email: 'f.brou@sarahauto.ci', role: 'Moniteur' as Role, actif: true },
  { id: 'u4', name: 'Tanoh Estelle', email: 'e.tanoh@sarahauto.ci', role: 'Comptable' as Role, actif: true },
  { id: 'u5', name: 'Aya Sandrine', email: 's.aya@sarahauto.ci', role: 'Conseiller' as Role, actif: true },
  { id: 'u6', name: 'Kouamé Lucien', email: 'l.kouame@sarahauto.ci', role: 'Administrateur secondaire' as Role, actif: false },
]

// --- FAQ (assistance) ---
export const faq = [
  { q: "Comment scanner la CNI d'un élève ?", r: "Rendez-vous dans l'onglet « Scanner CNI », autorisez l'accès à la webcam, placez la pièce d'identité dans le cadre et cliquez sur « Scanner ». Les champs Nom, Prénom et Date de naissance seront extraits automatiquement." },
  { q: 'Comment relancer une facture impayée par WhatsApp ?', r: "Depuis le tableau de bord ou la section Facturation, repérez les factures au statut « Impayée » puis cliquez sur l'icône WhatsApp verte. Un message pré-rempli s'ouvre dans WhatsApp Web." },
  { q: "Comment créer une session d'examen collective ?", r: "Dans « Examens & Sessions », cliquez sur « Nouvelle session », renseignez la date, le centre, le type d'examen et l'inspecteur, puis ajoutez les élèves éligibles. Le bordereau PDF est généré automatiquement." },
  { q: 'Comment affecter un véhicule à une séance ?', r: "Dans « Planning & Séances », lors de la création d'une séance, le système propose uniquement les véhicules disponibles sur le créneau choisi pour éviter les doublons." },
  { q: "Comment saisir les résultats d'examen en masse ?", r: "Ouvrez la session d'examen concernée dans « Bordereaux », puis utilisez le formulaire de saisie rapide pour enregistrer Admis/Échec pour tous les candidats en une fois." },
  { q: "Où trouver les reçus de paiement d'un élève ?", r: "Dans « Facturation », ouvrez la fiche de l'élève puis l'onglet « Paiements ». Chaque encaissement peut être téléchargé au format PDF." },
]
