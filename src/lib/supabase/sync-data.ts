import { createClient } from '@/lib/supabase/client'
import { assertSupabaseConfigured } from '@/lib/supabase/config'
import {
  mapDepense,
  mapEleve,
  mapExamen,
  mapExamenSession,
  mapFacture,
  mapFormation,
  mapFaqItem,
  mapInspecteur,
  mapInscription,
  mapMoniteur,
  mapPaiement,
  mapPermis,
  mapProfile,
  mapSeance,
  mapVehicule,
  mapEleveStatutFromDb,
  mapSeanceStatutFromDb,
} from '@/lib/supabase/mappers'
import type { StatutEleve } from '@/lib/domain/types'
import { formatAuditDescription } from '@/lib/audit-format'
import { faqContent } from '@/lib/faq-content'
import { useDataStore, type AuditEntry } from '@/store/data-store'

const ELEVE_COLS =
  'id,code,dossier_code,nom,prenom,telephone,email,adresse,photo_cni,photo_profil,date_naissance,lieu_naissance,sexe,nationalite,type_piece,num_piece,type_permis,statut,est_parraine,parrain_nom,date_inscription,seances_faites,seances_totales,moniteur_id,acces_portail'

export async function syncDataFromSupabase(): Promise<boolean> {
  assertSupabaseConfigured()

  const supabase = createClient()

  const [
    permisRes,
    formationsRes,
    moniteursRes,
    vehiculesRes,
    inspecteursRes,
    profilesRes,
    elevesRes,
    soldesRes,
    inscriptionsRes,
    seancesRes,
    examensRes,
    sessionsRes,
    facturesRes,
    paiementsRes,
    depensesRes,
    auditRes,
    faqRes,
    modesPaiementRes,
    categoriesDepenseRes,
    appConfigRes,
  ] = await Promise.all([
    supabase.from('permis').select('id,code,libelle').order('code'),
    supabase.from('formations').select('id,nom,description,prix,actif').order('nom'),
    supabase.from('moniteurs').select('id,nom,prenom,telephone,email,specialite,statut').order('nom'),
    supabase.from('vehicules').select('id,marque,modele,immatriculation,etat').order('marque'),
    supabase.from('inspecteurs').select('id,nom,prenom,telephone,email,actif').order('nom'),
    supabase.from('profiles').select('id,name,email,role,actif').order('name'),
    supabase.from('eleves').select(ELEVE_COLS).order('nom'),
    supabase.from('eleves_solde').select('eleve_id,solde'),
    supabase.from('inscriptions').select('id,eleve_id,formation_id,tarif,date_inscription'),
    supabase.from('seances').select(`
      id,eleve_id,moniteur_id,vehicule_id,date_seance,heure_debut,heure_fin,duree_minutes,lieu,statut,notes,
      eleve:eleves(prenom, nom, code, dossier_code),
      moniteur:moniteurs(prenom, nom),
      vehicule:vehicules(marque, modele, immatriculation)
    `),
    supabase.from('examens').select(`
      id,eleve_id,type_examen,type_permis,date_examen,resultat,notes,
      eleve:eleves(prenom, nom, code, dossier_code),
      inspecteur:inspecteurs(prenom, nom)
    `),
    supabase.from('examen_sessions').select(`
      id,numero_bordereau,titre,type_examen,date_examen,heure_examen,centre,lieu,categorie,statut,observations,
      inspecteur:inspecteurs(prenom, nom),
      vehicule:vehicules(marque, modele, immatriculation),
      examen_session_eleves(nom_complet,identifiant,telephone,categorie_permis,resultat)
    `),
    supabase.from('factures').select(`
      id,numero,eleve_id,inscription_id,montant,statut,date_emission,
      eleve:eleves(prenom, nom, code, dossier_code),
      inscription:inscriptions(formation_id)
    `),
    supabase.from('paiements').select(`
      id,facture_id,montant,mode_paiement,reference,date_paiement,
      facture:factures(numero),
      eleve:eleves(prenom, nom)
    `),
    supabase.from('depenses').select(`
      id,categorie,montant,description,mode_paiement,justificatif_url,date_depense,
      vehicule:vehicules(marque, modele, immatriculation)
    `),
    supabase.from('audit_log').select('id,action,entity,entity_id,user_id,description,old_data,new_data,created_at').order('created_at', { ascending: false }).limit(200),
    supabase.from('faq_items').select('id,question,answer,sort_order').order('sort_order'),
    supabase.from('modes_paiement').select('code,label'),
    supabase.from('categories_depense').select('code,label'),
    supabase.from('app_config').select('key,value'),
  ])

  const firstError =
    permisRes.error ??
    formationsRes.error ??
    moniteursRes.error ??
    elevesRes.error ??
    profilesRes.error

  if (firstError) {
    return false
  }

  const secondaryErrors = [
    seancesRes.error && `seances: ${seancesRes.error.message}`,
    examensRes.error && `examens: ${examensRes.error.message}`,
    facturesRes.error && `factures: ${facturesRes.error.message}`,
    paiementsRes.error && `paiements: ${paiementsRes.error.message}`,
    depensesRes.error && `depenses: ${depensesRes.error.message}`,
    auditRes.error && `audit_log: ${auditRes.error.message}`,
  ].filter(Boolean)
  if (secondaryErrors.length > 0) {
    console.warn('[sync] Données partiellement chargées —', secondaryErrors.join(', '))
  }

  const moniteursRaw = moniteursRes.data ?? []
  const vehiculesRaw = vehiculesRes.data ?? []
  const elevesRaw = elevesRes.data ?? []
  const seancesRaw = seancesRes.data ?? []
  const formationsRaw = formationsRes.data ?? []
  const inscriptionsRaw = inscriptionsRes.data ?? []
  const paiementsRaw = paiementsRes.data ?? []
  const soldesRaw = soldesRes.data ?? []

  const moniteurById = Object.fromEntries(
    moniteursRaw.map((m) => [m.id, `${m.prenom} ${m.nom}`]),
  )
  const eleveCodeById = Object.fromEntries(
    elevesRaw.map((e) => [e.id, e.code ?? e.dossier_code ?? '']),
  )
  const formationById = Object.fromEntries(formationsRaw.map((f) => [f.id, f.nom]))
  const soldeByEleveId = Object.fromEntries(
    soldesRaw.map((s) => [s.eleve_id, Number(s.solde ?? 0)]),
  )

  const payeByFactureId: Record<string, number> = {}
  for (const p of paiementsRaw) {
    if (p.facture_id) {
      payeByFactureId[p.facture_id] = (payeByFactureId[p.facture_id] ?? 0) + Number(p.montant)
    }
  }

  const seancesByMoniteur: Record<string, number> = {}
  const seancesByVehicule: Record<string, number> = {}
  for (const s of seancesRaw) {
    if (s.moniteur_id) {
      seancesByMoniteur[s.moniteur_id] = (seancesByMoniteur[s.moniteur_id] ?? 0) + 1
    }
    if (s.vehicule_id) {
      seancesByVehicule[s.vehicule_id] = (seancesByVehicule[s.vehicule_id] ?? 0) + 1
    }
  }

  const factures = (facturesRes.data ?? []).map((f) => {
    const formationId = f.inscription?.formation_id as string | undefined
    const formationLibelle = formationId ? formationById[formationId] ?? '' : ''
    return mapFacture(f, payeByFactureId[f.id] ?? 0, formationLibelle)
  })

  const profileNameById = Object.fromEntries(
    (profilesRes.data ?? []).map((p) => [p.id, p.name ?? p.email ?? 'Utilisateur']),
  )

  const auditLog: AuditEntry[] = (auditRes.data ?? []).map((row) => ({
    id: row.id,
    action: row.action as AuditEntry['action'],
    entity: row.entity,
    entityId: row.entity_id ?? '',
    description: formatAuditDescription(row.action, row.entity, row.description),
    timestamp: row.created_at
      ? new Date(row.created_at).toLocaleString('fr-FR')
      : '',
    user: row.user_id ? profileNameById[row.user_id] ?? 'Utilisateur' : 'Système',
    oldData: (row.old_data as Record<string, unknown>) ?? undefined,
    newData: (row.new_data as Record<string, unknown>) ?? undefined,
  }))

  useDataStore.setState({
    permis: (permisRes.data ?? []).map(mapPermis),
    formations: formationsRaw.map(mapFormation),
    moniteurs: moniteursRaw.map((m) => mapMoniteur(m, seancesByMoniteur[m.id] ?? 0)),
    vehicules: vehiculesRaw.map((v) => mapVehicule(v, seancesByVehicule[v.id] ?? 0)),
    inspecteurs: (inspecteursRes.data ?? []).map(mapInspecteur),
    profiles: (profilesRes.data ?? []).map(mapProfile),
    eleves: elevesRaw.map((e) => {
      const mapped = mapEleve(
        e,
        e.moniteur_id ? moniteurById[e.moniteur_id] ?? 'Non assigné' : 'Non assigné',
      )
      return { ...mapped, solde: soldeByEleveId[e.id] ?? mapped.solde }
    }),
    inscriptions: inscriptionsRaw.map((i) =>
      mapInscription(i, i.eleve_id ? (eleveCodeById[i.eleve_id] ?? '') : ''),
    ),
    seances: seancesRaw.map(mapSeance),
    examens: (examensRes.data ?? []).map(mapExamen),
    examenSessions: (sessionsRes.data ?? []).map(mapExamenSession),
    factures,
    paiements: paiementsRaw.map(mapPaiement),
    depenses: (depensesRes.data ?? []).map(mapDepense),
    auditLog,
    faq: (() => {
      if (faqRes.error) console.warn('[sync] FAQ inaccessible (RLS ?) — contenu statique utilisé :', faqRes.error.message)
      return faqRes.error || !faqRes.data?.length ? [...faqContent] : faqRes.data.map(mapFaqItem)
    })(),
    modesPaiement: modesPaiementRes.data ?? [],
    categoriesDepense: categoriesDepenseRes.data ?? [],
    appConfig: Object.fromEntries((appConfigRes.data ?? []).map((r) => [r.key, r.value])),
  })

  return true
}

export async function refreshProfiles(): Promise<void> {
  const supabase = createClient()
  const { data, error } = await supabase.from('profiles').select('id,name,email,role,actif').order('name')
  if (!error && data) {
    useDataStore.setState({ profiles: data.map(mapProfile) })
  }
}

export async function syncDataForEleve(code: string, telephone: string): Promise<boolean> {
  assertSupabaseConfigured()

  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_eleve_portail_data', {
    p_code: code.trim(),
    p_telephone: telephone.trim(),
  })

  if (error || !data) return false

  const payload = data as {
    eleve: Record<string, unknown>
    seances: Array<Record<string, unknown>>
    factures: Array<Record<string, unknown>>
    paiements: Array<Record<string, unknown>>
  }

  const e = payload.eleve
  const statut: StatutEleve = mapEleveStatutFromDb(String(e.statut ?? 'prospect'))

  const eleveId = String(e.id)
  const eleveCode = String(e.code ?? e.dossier_code ?? code)

  const seances = (payload.seances ?? []).map((s) => ({
    id: String(s.id),
    eleve: `${e.prenom} ${e.nom}`,
    eleveCode,
    moniteur: String(s.moniteur_nom ?? '—'),
    moniteurId: '',
    vehicule: '—',
    vehiculeId: '',
    lieuRdv: String(s.lieu ?? ''),
    date: String(s.date_seance ?? ''),
    heureDebut: String(s.heure_debut ?? '').slice(0, 5),
    heureFin: String(s.heure_fin ?? '').slice(0, 5),
    duree: Number(s.duree_minutes ?? 60),
    statut: mapSeanceStatutFromDb(String(s.statut ?? 'planifie')),
    notes: '',
  }))

  const facturesRaw = payload.factures ?? []
  const payeByFacture: Record<string, number> = {}
  for (const p of payload.paiements ?? []) {
    const fid = String((p as { facture_id?: string }).facture_id ?? '')
    if (fid) payeByFacture[fid] = (payeByFacture[fid] ?? 0) + Number(p.montant)
  }

  const factures = facturesRaw.map((f) => {
    const montant = Number(f.montant)
    const paye = payeByFacture[String(f.id)] ?? 0
    return {
      id: String(f.id),
      numero: String(f.numero),
      eleve: `${e.prenom} ${e.nom}`,
      eleveCode,
      formation: '',
      montant,
      paye,
      reste: Math.max(0, montant - paye),
      statut: paye >= montant ? 'Payée' as const : paye > 0 ? 'Partielle' as const : 'Non payée' as const,
      dateEmission: String(f.date_emission ?? ''),
      inscriptionId: '',
    }
  })

  const totalSolde = factures.reduce((acc, f) => acc + f.reste, 0)

  useDataStore.setState((state) => ({
    eleves: [
      {
        id: eleveId,
        code: eleveCode,
        nom: String(e.nom),
        prenom: String(e.prenom),
        telephone: String(e.telephone),
        email: String(e.email ?? ''),
        adresse: String(e.adresse ?? ''),
        photoCni: String(e.photo_cni ?? ''),
        photoProfil: String(e.photo_profil ?? ''),
        dateNaissance: String(e.date_naissance ?? ''),
        lieuNaissance: String(e.lieu_naissance ?? ''),
        sexe: String(e.sexe ?? 'M'),
        nationalite: String(e.nationalite ?? ''),
        typePiece: String(e.type_piece ?? ''),
        numPiece: String(e.num_piece ?? ''),
        typePermis: String(e.type_permis ?? 'B'),
        statut,
        dateInscription: String(e.date_inscription ?? ''),
        seancesFaites: Number(e.seances_faites ?? 0),
        seancesTotales: Number(e.seances_totales ?? 20),
        solde: totalSolde,
        estParraine: Boolean(e.est_parraine),
        parrainNom: String(e.parrain_nom ?? ''),
        moniteur: '—',
      },
      ...state.eleves.filter((x) => x.id !== eleveId),
    ],
    seances,
    factures,
  }))

  return true
}
