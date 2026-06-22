import { persistRemoteAwait, persistRemoteSilent } from '@/lib/supabase/persist'
import {
  findEleveId,
  findInspecteurId,
  findMoniteurId,
  findVehiculeId,
  supabaseRepos,
} from '@/lib/supabase/repositories'
import { syncDataFromSupabase } from '@/lib/supabase/sync-data'
import type {
  Depense,
  Eleve,
  Examen,
  ExamenSession,
  Facture,
  Formation,
  Inspecteur,
  Moniteur,
  Permis,
  Profile,
  Seance,
  Vehicule,
  AuditEntry,
} from '@/store/data-store'
import type { FaqItem } from '@/lib/domain/types'
import type { ModePaiement } from '@/lib/domain/types'

export function makeEntityId(prefix: string) {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

export function persistAudit(entry: AuditEntry) {
  persistRemoteSilent(() => supabaseRepos.auditLog.create(entry), undefined, 'Journal d\'audit')
}

export function persistEleveCreate(eleve: Eleve, moniteurId: string | null, rollback: () => void) {
  persistRemoteSilent(() => supabaseRepos.eleves.create(eleve, moniteurId), rollback, 'Création élève')
}

export function persistEleveCreateAwait(
  eleve: Eleve,
  moniteurId: string | null,
  rollback: () => void,
) {
  return persistRemoteAwait(() => supabaseRepos.eleves.create(eleve, moniteurId), rollback)
}

export function persistEleveUpdate(eleve: Eleve, moniteurId: string | null, rollback: () => void) {
  persistRemoteSilent(() => supabaseRepos.eleves.update(eleve, moniteurId), rollback, 'Modification élève')
}

export function persistEleveDelete(id: string, rollback: () => void) {
  persistRemoteSilent(async () => {
    await supabaseRepos.eleves.remove(id)
    await syncDataFromSupabase()
  }, rollback, 'Suppression élève')
}

export function persistMoniteur(m: Moniteur, mode: 'create' | 'update' | 'delete', rollback?: () => void) {
  const label =
    mode === 'create' ? 'Création moniteur' : mode === 'update' ? 'Modification moniteur' : 'Suppression moniteur'
  persistRemoteSilent(async () => {
    if (mode === 'create') await supabaseRepos.moniteurs.create(m)
    else if (mode === 'update') await supabaseRepos.moniteurs.update(m)
    else await supabaseRepos.moniteurs.remove(m.id)
  }, rollback, label)
}

export function persistVehicule(v: Vehicule, mode: 'create' | 'update' | 'delete', rollback?: () => void) {
  const label =
    mode === 'create' ? 'Création véhicule' : mode === 'update' ? 'Modification véhicule' : 'Suppression véhicule'
  persistRemoteSilent(async () => {
    if (mode === 'create') await supabaseRepos.vehicules.create(v)
    else if (mode === 'update') await supabaseRepos.vehicules.update(v)
    else await supabaseRepos.vehicules.remove(v.id)
  }, rollback, label)
}

export function persistFormation(f: Formation, mode: 'create' | 'update' | 'delete', rollback?: () => void) {
  const label =
    mode === 'create' ? 'Création formation' : mode === 'update' ? 'Modification formation' : 'Suppression formation'
  persistRemoteSilent(async () => {
    if (mode === 'create') await supabaseRepos.formations.create(f)
    else if (mode === 'update') await supabaseRepos.formations.update(f)
    else await supabaseRepos.formations.remove(f.id)
  }, rollback, label)
}

export function persistInspecteur(i: Inspecteur, mode: 'create' | 'update' | 'delete', rollback?: () => void) {
  const label =
    mode === 'create' ? 'Création inspecteur' : mode === 'update' ? 'Modification inspecteur' : 'Suppression inspecteur'
  persistRemoteSilent(async () => {
    if (mode === 'create') await supabaseRepos.inspecteurs.create(i)
    else if (mode === 'update') await supabaseRepos.inspecteurs.update(i)
    else await supabaseRepos.inspecteurs.remove(i.id)
  }, rollback, label)
}

export function persistPermis(p: Permis, mode: 'create' | 'update' | 'delete', rollback?: () => void) {
  const label =
    mode === 'create' ? 'Création permis' : mode === 'update' ? 'Modification permis' : 'Suppression permis'
  persistRemoteSilent(async () => {
    if (mode === 'create') await supabaseRepos.permis.create(p)
    else if (mode === 'update') await supabaseRepos.permis.update(p)
    else await supabaseRepos.permis.remove(p.id)
  }, rollback, label)
}

export function persistSeance(
  s: Seance,
  eleves: Eleve[],
  moniteurs: Moniteur[],
  vehicules: Vehicule[],
  mode: 'create' | 'update' | 'delete',
  rollback?: () => void,
) {
  const label =
    mode === 'create' ? 'Création séance' : mode === 'update' ? 'Modification séance' : 'Suppression séance'
  persistRemoteSilent(async () => {
    if (mode === 'delete') {
      await supabaseRepos.seances.remove(s.id)
      await syncDataFromSupabase()
      return
    }
    const eleveId = findEleveId(eleves, s.eleveCode)
    const moniteurId = s.moniteurId || findMoniteurId(moniteurs, s.moniteur) || ''
    const vehiculeId = s.vehiculeId ? findVehiculeId(vehicules, s.vehicule) : findVehiculeId(vehicules, s.vehicule)
    if (mode === 'create') {
      await supabaseRepos.seances.create(s, eleveId, moniteurId, vehiculeId)
      await syncDataFromSupabase()
    } else {
      await supabaseRepos.seances.update(s, eleveId, moniteurId, vehiculeId)
    }
  }, rollback, label)
}

export function persistExamen(
  e: Examen,
  eleves: Eleve[],
  inspecteurs: Inspecteur[],
  mode: 'create' | 'update' | 'delete',
  rollback?: () => void,
) {
  const label =
    mode === 'create' ? 'Création examen' : mode === 'update' ? 'Modification examen' : 'Suppression examen'
  persistRemoteSilent(async () => {
    if (mode === 'delete') {
      await supabaseRepos.examens.remove(e.id)
      return
    }
    const eleveId = findEleveId(eleves, e.eleveCode)
    const inspecteurId = findInspecteurId(inspecteurs, e.inspecteur)
    if (mode === 'create') await supabaseRepos.examens.create(e, eleveId, inspecteurId)
    else await supabaseRepos.examens.update(e, eleveId, inspecteurId)
  }, rollback, label)
}

export function persistFacture(f: Facture, eleves: Eleve[], mode: 'create' | 'update' | 'delete', rollback?: () => void) {
  const label =
    mode === 'create' ? 'Création facture' : mode === 'update' ? 'Modification facture' : 'Suppression facture'
  persistRemoteSilent(async () => {
    const eleveId = findEleveId(eleves, f.eleveCode)
    if (mode === 'create') await supabaseRepos.factures.create(f, eleveId)
    else if (mode === 'update') await supabaseRepos.factures.update(f, eleveId)
    else {
      await supabaseRepos.factures.remove(f.id)
      await syncDataFromSupabase()
    }
  }, rollback, label)
}

export function persistPaiement(
  factureId: string,
  montant: number,
  mode: ModePaiement,
  reference: string,
  rollback?: () => void,
) {
  persistRemoteSilent(async () => {
    await supabaseRepos.paiements.create(factureId, montant, mode, reference)
    await syncDataFromSupabase()
  }, rollback, 'Enregistrement paiement')
}

export function persistDepense(d: Depense, vehicules: Vehicule[], mode: 'create' | 'update' | 'delete', rollback?: () => void) {
  const label =
    mode === 'create' ? 'Création dépense' : mode === 'update' ? 'Modification dépense' : 'Suppression dépense'
  persistRemoteSilent(async () => {
    const vehiculeId = findVehiculeId(vehicules, d.vehicule)
    if (mode === 'create') {
      await supabaseRepos.depenses.create(d, vehiculeId)
      await syncDataFromSupabase()
    } else if (mode === 'update') {
      await supabaseRepos.depenses.update(d, vehiculeId)
    } else {
      await supabaseRepos.depenses.remove(d.id)
      await syncDataFromSupabase()
    }
  }, rollback, label)
}

export function persistProfile(p: Profile, mode: 'update' | 'delete', rollback?: () => void) {
  const label = mode === 'update' ? 'Modification profil' : 'Suppression profil'
  persistRemoteSilent(async () => {
    if (mode === 'update') {
      await supabaseRepos.profiles.update(p)
    } else {
      await supabaseRepos.profiles.remove(p.id)
      await syncDataFromSupabase()
    }
  }, rollback, label)
}

export function persistExamenSession(
  s: ExamenSession,
  eleves: Eleve[],
  inspecteurs: Inspecteur[],
  vehicules: Vehicule[],
  mode: 'create' | 'update' | 'delete',
  rollback?: () => void,
) {
  const label =
    mode === 'create'
      ? 'Création session d\'examen'
      : mode === 'update'
        ? 'Mise à jour session d\'examen'
        : 'Suppression session d\'examen'
  persistRemoteSilent(async () => {
    const eleveIdByCode = Object.fromEntries(eleves.map((e) => [e.code, e.id]))
    const inspecteurId = findInspecteurId(inspecteurs, s.inspecteur)
    const vehiculeId = findVehiculeId(vehicules, s.vehicule)
    if (mode === 'create') await supabaseRepos.examenSessions.create(s, inspecteurId, vehiculeId, eleveIdByCode)
    else if (mode === 'update') await supabaseRepos.examenSessions.updateResultats(s.id, s.candidats, eleveIdByCode)
    else await supabaseRepos.examenSessions.remove(s.id)
  }, rollback, label)
}

export async function persistInscrireEleve(eleveId: string, formationId: string, tarif?: number) {
  const result = await supabaseRepos.inscriptions.inscrireEleve(eleveId, formationId, tarif)
  await syncDataFromSupabase()
  return result
}

export function persistFaqItem(item: FaqItem, mode: 'create' | 'update' | 'delete', rollback?: () => void) {
  const label =
    mode === 'create' ? 'Ajout FAQ' : mode === 'update' ? 'Modification FAQ' : 'Suppression FAQ'
  persistRemoteSilent(async () => {
    if (mode === 'create') await supabaseRepos.faq.create(item)
    else if (mode === 'update') await supabaseRepos.faq.update(item)
    else await supabaseRepos.faq.remove(item.id)
  }, rollback, label)
}
