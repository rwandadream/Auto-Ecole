'use client'

import { Search, ArrowUpDown, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

type Statut = 'Prospect' | 'Inscrit' | 'En formation' | 'Examen' | 'Admis' | 'Ajourné'

type Eleve = {
  code: string
  dateInscription: string
  nomComplet: string
  permis: string
  statut: Statut
  seances: string
  solde: string
}

const eleves: Eleve[] = [
  {
    code: 'EL-2401',
    dateInscription: '02 Déc 2026',
    nomComplet: 'Aminata Koné',
    permis: 'Permis B',
    statut: 'En formation',
    seances: '12 / 20',
    solde: 'Solde: 45 000 F',
  },
  {
    code: 'EL-2402',
    dateInscription: '01 Déc 2026',
    nomComplet: 'Moussa Traoré',
    permis: 'Permis A',
    statut: 'Admis',
    seances: '20 / 20',
    solde: 'Soldé',
  },
  {
    code: 'EL-2403',
    dateInscription: '30 Nov 2026',
    nomComplet: 'Fatou Bamba',
    permis: 'Permis B',
    statut: 'Examen',
    seances: '18 / 20',
    solde: 'Solde: 15 000 F',
  },
  {
    code: 'EL-2404',
    dateInscription: '29 Nov 2026',
    nomComplet: 'Ibrahim Cissé',
    permis: 'Permis AB',
    statut: 'Inscrit',
    seances: '0 / 20',
    solde: 'Solde: 120 000 F',
  },
  {
    code: 'EL-2405',
    dateInscription: '28 Nov 2026',
    nomComplet: 'Awa Diop',
    permis: 'Permis B',
    statut: 'Ajourné',
    seances: '20 / 20',
    solde: 'Soldé',
  },
  {
    code: 'EL-2406',
    dateInscription: '27 Nov 2026',
    nomComplet: 'Sékou Camara',
    permis: 'Permis A',
    statut: 'En formation',
    seances: '08 / 20',
    solde: 'Solde: 80 000 F',
  },
  {
    code: 'EL-2407',
    dateInscription: '26 Nov 2026',
    nomComplet: 'Mariam Touré',
    permis: 'Permis B',
    statut: 'Prospect',
    seances: '—',
    solde: 'Acompte: 20 000 F',
  },
]

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
}

function StatusBadge({ statut }: { statut: Statut }) {
  const style = statutStyles[statut]
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

export function RecentOrders() {
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
          <button className="flex h-9 items-center gap-2 rounded-lg border border-input bg-background px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <Search className="h-4 w-4" />
            Rechercher
          </button>
          <button className="flex h-9 items-center gap-2 rounded-lg border border-input bg-background px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <ArrowUpDown className="h-4 w-4" />
            Trier par
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
            {eleves.map((eleve) => (
              <tr key={eleve.code} className="transition-colors hover:bg-muted/40">
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
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border p-4">
        <p className="text-sm text-muted-foreground">
          Affichage de <span className="font-medium text-foreground">1-7</span> sur{' '}
          <span className="font-medium text-foreground">248</span> élèves
        </p>
        <div className="flex items-center gap-1">
          <button className="flex h-8 items-center rounded-md border border-input bg-background px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            Précédent
          </button>
          <button className="flex h-8 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            Suivant
          </button>
        </div>
      </div>
    </div>
  )
}
