'use client'

import { useMemo, useState } from 'react'
import { Search, ArrowUpDown, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDataStore, type Eleve } from '@/store/data-store'
import { formatXOF } from '@/components/dashboard/views/shared'

type Statut = 'Prospect' | 'Inscrit' | 'En formation' | 'Examen' | 'Admis' | 'Ajourné' | 'Terminé' | 'Abandon'

const PAGE_SIZE = 7

const moisFrToNum: Record<string, number> = {
  'Jan': 0, 'Fév': 1, 'Mar': 2, 'Avr': 3, 'Mai': 4, 'Juin': 5,
  'Juil': 6, 'Août': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Déc': 11,
}

// Parse "29 Nov 2026" → timestamp (NaN if unparseable)
function parseFrDate(s: string): number {
  const parts = s.split(/\s+/)
  if (parts.length !== 3) return NaN
  const jour = parseInt(parts[0], 10)
  const mois = moisFrToNum[parts[1]]
  const annee = parseInt(parts[2], 10)
  if (Number.isNaN(jour) || mois === undefined || Number.isNaN(annee)) return NaN
  return new Date(annee, mois, jour).getTime()
}

const columns = [
  { key: 'code', label: 'Code dossier' },
  { key: 'date', label: "Date d'inscription" },
  { key: 'nom', label: 'Élève' },
  { key: 'permis', label: 'Type permis' },
  { key: 'statut', label: 'Statut' },
  { key: 'seances', label: 'Séances' },
  { key: 'solde', label: 'Solde' },
]

const statutStyles: Record<Statut, { badge: string; dot: string }> = {
  Prospect: { badge: 'bg-slate-500/10 text-slate-600', dot: 'bg-slate-500' },
  Inscrit: { badge: 'bg-sky-500/10 text-sky-600', dot: 'bg-sky-500' },
  'En formation': { badge: 'bg-primary/10 text-primary', dot: 'bg-primary' },
  Examen: { badge: 'bg-amber-500/10 text-amber-600', dot: 'bg-amber-500' },
  Admis: { badge: 'bg-emerald-500/10 text-emerald-600', dot: 'bg-emerald-500' },
  Ajourné: { badge: 'bg-rose-500/10 text-rose-600', dot: 'bg-rose-500' },
  Terminé: { badge: 'bg-emerald-500/10 text-emerald-600', dot: 'bg-emerald-500' },
  Abandon: { badge: 'bg-slate-500/10 text-slate-600', dot: 'bg-slate-500' },
}

function StatusBadge({ statut }: { statut: Statut }) {
  const style = statutStyles[statut] ?? statutStyles.Prospect
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
        style.badge
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', style.dot)} />
      {statut}
    </span>
  )
}

type Row = {
  id: string
  code: string
  dateInscription: string
  dateTs: number
  nomComplet: string
  permis: string
  statut: Statut
  seances: string
  solde: string
}

function toRow(e: Eleve): Row {
  const seances = e.seancesTotales > 0 ? `${e.seancesFaites} / ${e.seancesTotales}` : '—'
  const solde =
    e.solde > 0 ? `Solde: ${formatXOF(e.solde)}` : e.solde < 0 ? `Acompte: ${formatXOF(-e.solde)}` : 'Soldé'
  return {
    id: e.id,
    code: e.code,
    dateInscription: e.dateInscription,
    dateTs: parseFrDate(e.dateInscription),
    nomComplet: `${e.prenom} ${e.nom}`,
    permis: `Permis ${e.typePermis}`,
    statut: e.statut as Statut,
    seances,
    solde,
  }
}

export function RecentOrders() {
  const allEleves = useDataStore((s) => s.eleves)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc')
  const [page, setPage] = useState(0)

  const rows = useMemo(() => allEleves.map(toRow), [allEleves])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filteredByQuery = q
      ? rows.filter(
          (r) =>
            r.nomComplet.toLowerCase().includes(q) || r.code.toLowerCase().includes(q)
        )
      : rows
    return [...filteredByQuery].sort((a, b) => {
      // Sort by date — handle NaN (push them to the bottom)
      if (Number.isNaN(a.dateTs) && Number.isNaN(b.dateTs)) return 0
      if (Number.isNaN(a.dateTs)) return 1
      if (Number.isNaN(b.dateTs)) return -1
      return sortDir === 'desc' ? b.dateTs - a.dateTs : a.dateTs - b.dateTs
    })
  }, [rows, query, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages - 1)
  const start = currentPage * PAGE_SIZE
  const pageRows = filtered.slice(start, start + PAGE_SIZE)

  return (
    <div className="rounded-xl border border-border bg-card">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Élèves récents</h2>
          <p className="text-sm text-muted-foreground">
            Suivi du cycle de vie des apprenants (Prospect → Admis)
          </p>
        </div>
        <div className="flex items-center gap-2">
          {searchOpen ? (
            <div className="flex h-9 items-center gap-2 rounded-lg border border-input bg-background px-2.5">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                autoFocus
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setPage(0)
                }}
                placeholder="Nom ou code..."
                className="w-44 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              <button
                onClick={() => {
                  setQuery('')
                  setSearchOpen(false)
                  setPage(0)
                }}
                className="text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="flex h-9 items-center gap-2 rounded-lg border border-input bg-background px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Search className="h-4 w-4" />
              Rechercher
            </button>
          )}
          <button
            onClick={() => setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))}
            className="flex h-9 items-center gap-2 rounded-lg border border-input bg-background px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title={sortDir === 'desc' ? 'Plus récent en premier' : 'Plus ancien en premier'}
          >
            <ArrowUpDown className="h-4 w-4" />
            {sortDir === 'desc' ? 'Récent → Ancien' : 'Ancien → Récent'}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="custom-scrollbar overflow-x-auto">
        <table className="w-full min-w-[860px]">
          <thead>
            <tr className="border-b border-border">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  {col.label}
                </th>
              ))}
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-5 py-10 text-center text-sm text-muted-foreground">
                  Aucun élève ne correspond à votre recherche.
                </td>
              </tr>
            ) : (
              pageRows.map((eleve) => (
                <tr key={eleve.id} className="transition-colors hover:bg-muted/40">
                  <td className="px-5 py-4">
                    <span className="text-sm font-semibold text-foreground">{eleve.code}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-muted-foreground">{eleve.dateInscription}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {eleve.nomComplet
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')}
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {eleve.nomComplet}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-muted-foreground">{eleve.permis}</span>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge statut={eleve.statut} />
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-muted-foreground">{eleve.seances}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm font-medium text-foreground">{eleve.solde}</span>
                  </td>
                  <td className="px-5 py-4">
                    <button className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border p-4">
        <p className="text-sm text-muted-foreground">
          Affichage de{' '}
          <span className="font-medium text-foreground">
            {filtered.length === 0 ? 0 : start + 1}-
            {Math.min(start + PAGE_SIZE, filtered.length)}
          </span>{' '}
          sur <span className="font-medium text-foreground">{filtered.length}</span> élèves
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="flex h-8 items-center gap-1 rounded-md border border-input bg-background px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
            Précédent
          </button>
          <span className="px-2 text-xs text-muted-foreground">
            Page {currentPage + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage >= totalPages - 1}
            className="flex h-8 items-center gap-1 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Suivant
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
