import type { StateCreator } from 'zustand'
import type { DataState, AuditEntry } from '../store-types'
import { makeEntityId, persistAudit, persistFaqItem, persistProfile } from '@/lib/supabase/store-bridge'
import { faqContent } from '@/lib/faq-content'
import { nowFrLocale } from '@/lib/format'
import { getCurrentAuditUser } from '@/lib/audit-user'
import { snapshotRecord } from '@/lib/snapshot'
import type { FaqItem, Profile } from '@/lib/domain/types'

export type AdminSlice = {
  auditLog: AuditEntry[]
  faq: FaqItem[]
  profiles: Profile[]
  appConfig: Record<string, string>
  modesPaiement: { code: string; label: string }[]
  categoriesDepense: { code: string; label: string }[]

  logAction: (
    action: AuditEntry['action'],
    entity: string,
    entityId: string,
    description: string,
    oldData?: Record<string, unknown>,
    newData?: Record<string, unknown>,
  ) => void
  updateProfile: (id: string, patch: Partial<Profile>) => void
  deleteProfile: (id: string) => void
  addFaqItem: (data: Omit<FaqItem, 'id' | 'sortOrder'> & { sortOrder?: number }) => void
  updateFaqItem: (id: string, patch: Partial<Pick<FaqItem, 'q' | 'r' | 'sortOrder'>>) => void
  deleteFaqItem: (id: string) => void
}

export const createAdminSlice: StateCreator<DataState, [], [], AdminSlice> = (set, get) => ({
  auditLog: [],
  faq: [...faqContent],
  profiles: [],
  appConfig: {},
  modesPaiement: [],
  categoriesDepense: [],

  logAction: (action, entity, entityId, description, oldData, newData) => {
    const entry: AuditEntry = {
      id: makeEntityId('aud'),
      action,
      entity,
      entityId,
      description,
      timestamp: nowFrLocale(),
      user: getCurrentAuditUser(),
      ...(oldData ? { oldData } : {}),
      ...(newData ? { newData } : {}),
    }
    set((s) => ({ auditLog: [entry, ...s.auditLog].slice(0, 200) }))
    persistAudit(entry)
  },

  updateProfile: (id, patch) => {
    const old = get().profiles.find((p) => p.id === id)
    if (!old) return
    const updated = { ...old, ...patch }
    set((s) => ({ profiles: s.profiles.map((p) => (p.id === id ? updated : p)) }))
    get().logAction('UPDATE', 'profiles', id, 'Modification du profil', snapshotRecord(old), snapshotRecord(updated))
    persistProfile(updated, 'update', () =>
      set((s) => ({ profiles: s.profiles.map((p) => (p.id === id ? old : p)) })),
    )
  },

  deleteProfile: (id) => {
    const old = get().profiles.find((p) => p.id === id)
    if (!old) return
    set((s) => ({ profiles: s.profiles.filter((p) => p.id !== id) }))
    get().logAction('DELETE', 'profiles', id, "Suppression de l'utilisateur", snapshotRecord(old))
    persistProfile(old, 'delete', () =>
      set((s) => ({ profiles: [...s.profiles, old] })),
    )
  },

  addFaqItem: (data) => {
    const newItem: FaqItem = {
      id: makeEntityId('faq'),
      q: data.q,
      r: data.r,
      sortOrder: data.sortOrder ?? get().faq.length + 1,
    }
    set((s) => ({ faq: [...s.faq, newItem].sort((a, b) => a.sortOrder - b.sortOrder) }))
    get().logAction('INSERT', 'faq_items', newItem.id, `Ajout FAQ: ${newItem.q}`, undefined, snapshotRecord(newItem))
    persistFaqItem(newItem, 'create', () =>
      set((s) => ({ faq: s.faq.filter((f) => f.id !== newItem.id) })),
    )
  },

  updateFaqItem: (id, patch) => {
    const old = get().faq.find((f) => f.id === id)
    if (!old) return
    const updated = { ...old, ...patch }
    set((s) => ({
      faq: s.faq.map((f) => (f.id === id ? updated : f)).sort((a, b) => a.sortOrder - b.sortOrder),
    }))
    get().logAction('UPDATE', 'faq_items', id, 'Modification FAQ', snapshotRecord(old), snapshotRecord(updated))
    persistFaqItem(updated, 'update', () =>
      set((s) => ({ faq: s.faq.map((f) => (f.id === id ? old : f)) })),
    )
  },

  deleteFaqItem: (id) => {
    const old = get().faq.find((f) => f.id === id)
    if (!old) return
    set((s) => ({ faq: s.faq.filter((f) => f.id !== id) }))
    get().logAction('DELETE', 'faq_items', id, 'Suppression FAQ', snapshotRecord(old))
    persistFaqItem(old, 'delete', () =>
      set((s) => ({ faq: [...s.faq, old].sort((a, b) => a.sortOrder - b.sortOrder) })),
    )
  },
})
