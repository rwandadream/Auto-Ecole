import { createClient } from '@/lib/supabase/client'
import type { Database, Json } from '@/lib/supabase/database.types'
import type { FaqItem } from '@/lib/domain/types'
import type {
  Depense,
  Eleve,
  Examen,
  ExamenSession,
  Facture,
  Formation,
  Inspecteur,
  ModePaiement,
  Moniteur,
  Permis,
  Profile,
  Seance,
  Vehicule,
  AuditEntry,
} from '@/store/data-store'
import {
  toDbDepense,
  toDbEleve,
  toDbExamen,
  toDbExamenSession,
  toDbExamenSessionEleve,
  toDbFacture,
  toDbFormation,
  toDbFaqItem,
  toDbInspecteur,
  toDbMoniteur,
  toDbPermis,
  toDbProfile,
  toDbSeance,
  toDbVehicule,
} from '@/lib/supabase/to-db'
import { MODE_PAIEMENT_TO_DB } from '@/lib/supabase/db-maps'
import { assertNoSupabaseError } from '@/lib/supabase/errors'

type Client = ReturnType<typeof createClient>

function db(): Client {
  return createClient()
}

function resolveId(store: { id: string }[], label: string, idOrLabel: string) {
  const byId = store.find((x) => x.id === idOrLabel)
  if (byId) return byId.id
  const byLabel = store.find((x) => {
    const rec = x as Record<string, string>
    return `${rec.prenom ?? ''} ${rec.nom ?? ''}`.trim() === label ||
      rec.nom === label ||
      `${rec.marque ?? ''} ${rec.modele ?? ''}`.trim().includes(label)
  })
  return byLabel?.id ?? idOrLabel
}

export const supabaseRepos = {
  eleves: {
    async create(eleve: Eleve, moniteurId?: string | null) {
      const { error } = await db().from('eleves').insert(toDbEleve(eleve, moniteurId))
      assertNoSupabaseError(error)
    },
    async update(eleve: Eleve, moniteurId?: string | null) {
      const { error } = await db().from('eleves').update(toDbEleve(eleve, moniteurId)).eq('id', eleve.id)
      if (error) throw error
    },
    async remove(id: string) {
      const { error } = await db().rpc('delete_eleve', { p_id: id })
      assertNoSupabaseError(error)
    },
  },

  moniteurs: {
    async create(m: Moniteur) {
      const { error } = await db().from('moniteurs').insert(toDbMoniteur(m))
      if (error) throw error
    },
    async update(m: Moniteur) {
      const { error } = await db().from('moniteurs').update(toDbMoniteur(m)).eq('id', m.id)
      if (error) throw error
    },
    async remove(id: string) {
      const { error } = await db().from('moniteurs').delete().eq('id', id)
      if (error) throw error
    },
  },

  vehicules: {
    async create(v: Vehicule) {
      const { error } = await db().from('vehicules').insert(toDbVehicule(v))
      if (error) throw error
    },
    async update(v: Vehicule) {
      const { error } = await db().from('vehicules').update(toDbVehicule(v)).eq('id', v.id)
      if (error) throw error
    },
    async remove(id: string) {
      const { error } = await db().from('vehicules').delete().eq('id', id)
      if (error) throw error
    },
  },

  formations: {
    async create(f: Formation) {
      const { error } = await db().from('formations').insert(toDbFormation(f))
      if (error) throw error
    },
    async update(f: Formation) {
      const { error } = await db().from('formations').update(toDbFormation(f)).eq('id', f.id)
      if (error) throw error
    },
    async remove(id: string) {
      const { error } = await db().from('formations').delete().eq('id', id)
      if (error) throw error
    },
  },

  inspecteurs: {
    async create(i: Inspecteur) {
      const { error } = await db().from('inspecteurs').insert(toDbInspecteur(i))
      if (error) throw error
    },
    async update(i: Inspecteur) {
      const { error } = await db().from('inspecteurs').update(toDbInspecteur(i)).eq('id', i.id)
      if (error) throw error
    },
    async remove(id: string) {
      const { error } = await db().from('inspecteurs').delete().eq('id', id)
      if (error) throw error
    },
  },

  permis: {
    async create(p: Permis) {
      const { error } = await db().from('permis').insert(toDbPermis(p))
      if (error) throw error
    },
    async update(p: Permis) {
      const { error } = await db().from('permis').update(toDbPermis(p)).eq('id', p.id)
      if (error) throw error
    },
    async remove(id: string) {
      const { error } = await db().from('permis').delete().eq('id', id)
      if (error) throw error
    },
  },

  seances: {
    async create(s: Seance, eleveId: string, moniteurId: string, vehiculeId: string | null) {
      const { error } = await db().from('seances').insert(toDbSeance(s, eleveId, moniteurId, vehiculeId))
      if (error) throw error
    },
    async update(s: Seance, eleveId: string, moniteurId: string, vehiculeId: string | null) {
      const { error } = await db().from('seances').update(toDbSeance(s, eleveId, moniteurId, vehiculeId)).eq('id', s.id)
      if (error) throw error
    },
    async remove(id: string) {
      const { error } = await db().from('seances').delete().eq('id', id)
      if (error) throw error
    },
  },

  examens: {
    async create(e: Examen, eleveId: string, inspecteurId: string | null) {
      const { error } = await db().from('examens').insert(toDbExamen(e, eleveId, inspecteurId))
      if (error) throw error
    },
    async update(e: Examen, eleveId: string, inspecteurId: string | null) {
      const { error } = await db().from('examens').update(toDbExamen(e, eleveId, inspecteurId)).eq('id', e.id)
      if (error) throw error
    },
    async remove(id: string) {
      const { error } = await db().from('examens').delete().eq('id', id)
      if (error) throw error
    },
  },

  inscriptions: {
    async inscrireEleve(eleveId: string, formationId: string, tarif?: number) {
      const { data, error } = await db().rpc('inscrire_eleve', {
        p_eleve_id: eleveId,
        p_formation_id: formationId,
        p_tarif: tarif ?? undefined,
      })
      assertNoSupabaseError(error)
      return data as { inscription_id: string; facture_id: string; facture_numero: string; tarif: number }
    },
  },

  factures: {
    async create(f: Facture, eleveId: string) {
      const { error } = await db().from('factures').insert(toDbFacture(f, eleveId))
      if (error) throw error
    },
    async update(f: Facture, eleveId: string) {
      const { error } = await db().from('factures').update(toDbFacture(f, eleveId)).eq('id', f.id)
      if (error) throw error
    },
    async remove(id: string) {
      const { error } = await db().from('factures').delete().eq('id', id)
      if (error) throw error
    },
  },

  paiements: {
    async create(factureId: string, montant: number, mode: ModePaiement, reference: string, notes = '') {
      const { data, error } = await db().rpc('enregistrer_paiement', {
        p_facture_id: factureId,
        p_montant: montant,
        p_mode_paiement: MODE_PAIEMENT_TO_DB[mode],
        p_reference: reference,
        p_notes: notes,
      })
      if (error) throw error
      return data as string
    },
  },

  depenses: {
    async create(d: Depense, vehiculeId: string | null) {
      const { error } = await db().from('depenses').insert(toDbDepense(d, vehiculeId))
      if (error) throw error
    },
    async update(d: Depense, vehiculeId: string | null) {
      const { error } = await db().from('depenses').update(toDbDepense(d, vehiculeId)).eq('id', d.id)
      if (error) throw error
    },
    async remove(id: string) {
      const { error } = await db().from('depenses').delete().eq('id', id)
      if (error) throw error
    },
  },

  profiles: {
    async update(p: Profile) {
      const { error } = await db().from('profiles').update(toDbProfile(p)).eq('id', p.id)
      if (error) throw error
    },
    async remove(id: string) {
      const { error } = await db().rpc('delete_staff_user', { p_id: id })
      if (error) throw error
    },
  },

  examenSessions: {
    async create(
      s: ExamenSession,
      inspecteurId: string | null,
      vehiculeId: string | null,
      eleveIdByCode: Record<string, string>,
      createdBy?: string | null,
    ) {
      const supabase = db()
      const { data: session, error } = await supabase
        .from('examen_sessions')
        .insert(toDbExamenSession(s, inspecteurId, vehiculeId, createdBy))
        .select('id')
        .single()
      if (error) throw error

      if (s.candidats.length > 0) {
        const rows = s.candidats
          .filter((c) => eleveIdByCode[c.identifiant])
          .map((c) => toDbExamenSessionEleve(session.id, eleveIdByCode[c.identifiant], c))
        if (rows.length > 0) {
          const { error: candError } = await supabase.from('examen_session_eleves').insert(rows)
          if (candError) throw candError
        }
      }
    },
    async updateResultats(sessionId: string, candidats: ExamenSession['candidats'], eleveIdByCode: Record<string, string>) {
      const rows = candidats
        .filter((c) => eleveIdByCode[c.identifiant])
        .map((c) => toDbExamenSessionEleve(sessionId, eleveIdByCode[c.identifiant], c))
      if (rows.length === 0) return
      const { error } = await db()
        .from('examen_session_eleves')
        .upsert(rows, { onConflict: 'session_id,eleve_id' })
      if (error) throw error
    },
    async remove(id: string) {
      const { error } = await db().from('examen_sessions').delete().eq('id', id)
      if (error) throw error
    },
  },

  faq: {
    async create(item: FaqItem) {
      const { error } = await db().from('faq_items').insert(toDbFaqItem(item))
      assertNoSupabaseError(error)
    },
    async update(item: FaqItem) {
      const { error } = await db()
        .from('faq_items')
        .update({
          question: item.q,
          answer: item.r,
          sort_order: item.sortOrder,
          updated_at: new Date().toISOString(),
        })
        .eq('id', item.id)
      assertNoSupabaseError(error)
    },
    async remove(id: string) {
      const { error } = await db().from('faq_items').delete().eq('id', id)
      assertNoSupabaseError(error)
    },
  },

  auditLog: {
    async create(entry: AuditEntry, userId?: string | null) {
      const client = db()
      const resolvedUserId = userId ?? (await client.auth.getUser()).data.user?.id ?? null
      const row: Database['public']['Tables']['audit_log']['Insert'] = {
        id: entry.id.length === 36 ? entry.id : undefined,
        action: entry.action,
        entity: entry.entity,
        entity_id: entry.entityId,
        user_id: resolvedUserId,
        description: entry.description,
        old_data: (entry.oldData as Json) ?? null,
        new_data: (entry.newData as Json) ?? null,
      }
      const { error } = await client.from('audit_log').insert(row)
      if (error) throw error
    },
  },
}

export function findMoniteurId(moniteurs: Moniteur[], label: string) {
  if (!label || label === 'Non assigné') return null
  const m = moniteurs.find((x) => `${x.prenom} ${x.nom}` === label)
  return m?.id ?? null
}

export function findEleveId(eleves: Eleve[], codeOrId: string) {
  return eleves.find((e) => e.id === codeOrId || e.code === codeOrId)?.id ?? codeOrId
}

export function findInspecteurId(inspecteurs: Inspecteur[], label: string) {
  if (!label || label === '—') return null
  const i = inspecteurs.find((x) => `${x.prenom} ${x.nom}` === label || `${x.nom} ${x.prenom}` === label)
  return i?.id ?? null
}

export function findVehiculeId(vehicules: Vehicule[], label: string) {
  if (!label || label === '—') return null
  const v = vehicules.find((x) => label.includes(x.immatriculation))
  return v?.id ?? null
}

export { resolveId }
