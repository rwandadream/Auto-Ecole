'use client'

import { Fragment, useState } from 'react'
import { History, Search, ShieldCheck, ChevronDown } from 'lucide-react'
import { useDataStore } from '@/store/data-store'
import {
  ViewHeader,
  StatusBadge,
  Card,
  PaginationFooter,
  type BadgeTone,
} from '@/components/dashboard/views/shared'

const ENTITY_OPTIONS: { value: string; label: string }[] = [
  { value: 'Tous', label: 'Toutes les entités' },
  { value: 'eleves', label: 'Élèves' },
  { value: 'moniteurs', label: 'Moniteurs' },
  { value: 'vehicules', label: 'Véhicules' },
  { value: 'formations', label: 'Formations' },
  { value: 'permis', label: 'Permis' },
  { value: 'inspecteurs', label: 'Inspecteurs' },
  { value: 'seances', label: 'Séances' },
  { value: 'examens', label: 'Examens' },
  { value: 'examen_sessions', label: 'Sessions' },
  { value: 'factures', label: 'Factures' },
  { value: 'paiements', label: 'Paiements' },
  { value: 'depenses', label: 'Dépenses' },
  { value: 'inscriptions', label: 'Inscriptions' },
  { value: 'profiles', label: 'Utilisateurs' },
]

const ACTION_OPTIONS: { value: string; label: string }[] = [
  { value: 'Tous', label: 'Toutes les actions' },
  { value: 'INSERT', label: 'Création (INSERT)' },
  { value: 'UPDATE', label: 'Modification (UPDATE)' },
  { value: 'DELETE', label: 'Suppression (DELETE)' },
]

function actionTone(action: 'INSERT' | 'UPDATE' | 'DELETE'): BadgeTone {
  switch (action) {
    case 'INSERT':
      return 'success'
    case 'UPDATE':
      return 'warning'
    case 'DELETE':
      return 'destructive'
    default:
      return 'warning'
  }
}

function actionLabel(action: 'INSERT' | 'UPDATE' | 'DELETE') {
  switch (action) {
    case 'INSERT':
      return 'Création'
    case 'UPDATE':
      return 'Modification'
    case 'DELETE':
      return 'Suppression'
    default:
      return action
  }
}

function entityLabel(entity: string): string {
  const found = ENTITY_OPTIONS.find((e) => e.value === entity)
  return found ? found.label : entity
}

function DiffBlock({ data, label }: { data?: Record<string, unknown>; label: string }) {
  if (!data || Object.keys(data).length === 0) return null
  return (
    <div className="min-w-0 flex-1">
      <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">{label}</p>
      <pre className="max-h-40 overflow-auto rounded-md bg-muted p-2 text-[11px] text-foreground">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  )
}

export function AuditLogPanel() {
  const auditLog = useDataStore((s) => s.auditLog)
  const [search, setSearch] = useState('')
  const [entityFilter, setEntityFilter] = useState<string>('Tous')
  const [actionFilter, setActionFilter] = useState<string>('Tous')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const filtered = auditLog.filter((entry) => {
    const q = search.trim().toLowerCase()
    const matchesSearch =
      !q ||
      entry.description.toLowerCase().includes(q) ||
      entry.user.toLowerCase().includes(q) ||
      entry.entity.toLowerCase().includes(q)
    const matchesEntity = entityFilter === 'Tous' || entry.entity === entityFilter
    const matchesAction = actionFilter === 'Tous' || entry.action === actionFilter
    return matchesSearch && matchesEntity && matchesAction
  })

  const PAR_PAGE = 15
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAR_PAGE))
  const pageCourante = Math.min(page, totalPages)
  const debut = (pageCourante - 1) * PAR_PAGE
  const filteredPage = filtered.slice(debut, debut + PAR_PAGE)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">
          Journal d&apos;audit
        </h2>
        <span className="flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground">
          <History className="h-4 w-4 text-primary" />
          {auditLog.length} entrée{auditLog.length > 1 ? 's' : ''} (max 200)
        </span>
      </div>

      {/* Filter bar */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              aria-label="Rechercher dans le journal"
              placeholder="Rechercher dans la description, l'utilisateur, l'entité..."
              className="h-9 w-full rounded-lg border border-input bg-background pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring transition-colors"
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:flex">
            <select
              value={entityFilter}
              onChange={(e) => {
                setEntityFilter(e.target.value)
                setPage(1)
              }}
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring transition-colors"
            >
              {ENTITY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value)
                setPage(1)
              }}
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring transition-colors"
            >
              {ACTION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="p-0">
        <div className="custom-scrollbar overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="sticky top-0 z-10 bg-card">
              <tr className="border-b border-border text-left">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date / Heure</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Action</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Entité</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Utilisateur</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <ShieldCheck className="h-8 w-8 text-muted-foreground/40" />
                      <p className="text-sm">
                        {auditLog.length === 0
                          ? "Aucune action enregistrée pour le moment. Effectuez une modification (création, édition, suppression) dans un module pour la voir apparaître ici."
                          : 'Aucune entrée ne correspond à votre recherche.'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
              {filteredPage.map((entry) => (
                <Fragment key={entry.id}>
                  <tr className="hover:bg-muted/40">
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">
                      {entry.timestamp}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge label={actionLabel(entry.action)} tone={actionTone(entry.action)} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-semibold text-foreground">
                        {entityLabel(entry.entity)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">
                      <div className="flex items-center gap-2">
                        <span>{entry.description}</span>
                        {(entry.oldData || entry.newData) && (
                          <button
                            type="button"
                            onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                            className="inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-muted"
                            aria-label="Voir le détail"
                          >
                            <ChevronDown className={`h-4 w-4 transition-transform ${expandedId === entry.id ? 'rotate-180' : ''}`} />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">
                      {entry.user}
                    </td>
                  </tr>
                  {expandedId === entry.id && (entry.oldData || entry.newData) && (
                    <tr className="bg-muted/20">
                      <td colSpan={5} className="px-4 py-3">
                        <div className="flex flex-col gap-3 sm:flex-row">
                          <DiffBlock data={entry.oldData} label="Avant" />
                          <DiffBlock data={entry.newData} label="Après" />
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
        <PaginationFooter
          pageCourante={pageCourante}
          totalPages={totalPages}
          total={filtered.length}
          debut={debut}
          pageDataLength={filteredPage.length}
          label="entrées"
          setPage={setPage}
        />
      </Card>
    </div>
  )
}

export function AuditLogView() {
  return (
    <div>
      <ViewHeader
        title="Journal d'audit"
        description="Traçabilité de toutes les modifications"
      />
      <AuditLogPanel />
    </div>
  )
}
