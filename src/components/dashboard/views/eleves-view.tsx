'use client'

import { useMemo, useState } from 'react'
import {
  Plus,
  Search,
  MoreHorizontal,
  Users,
  GraduationCap,
  Award,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Gift,
} from 'lucide-react'
import { eleves, type StatutEleve } from '@/lib/mock-data'
import {
  ViewHeader,
  StatusBadge,
  ActionButton,
  Card,
  formatXOF,
  initials,
} from '@/components/dashboard/views/shared'

type StatutFiltre = 'Tous' | StatutEleve

const STATUT_FILTRES: StatutFiltre[] = [
  'Tous',
  'Prospect',
  'Inscrit',
  'En formation',
  'Examen',
  'Admis',
  'Ajourné',
  'Terminé',
  'Abandon',
]

// Map statut élève → ton StatusBadge
function statutTone(statut: StatutEleve): React.ComponentProps<typeof StatusBadge>['tone'] {
  switch (statut) {
    case 'Prospect':
      return 'slate'
    case 'Inscrit':
      return 'sky'
    case 'En formation':
      return 'primary'
    case 'Examen':
      return 'amber'
    case 'Admis':
      return 'emerald'
    case 'Ajourné':
      return 'rose'
    case 'Terminé':
      return 'emerald'
    case 'Abandon':
      return 'slate'
    default:
      return 'slate'
  }
}

type KpiCardProps = {
  label: string
  value: string
  icon: React.ReactNode
  tone: 'primary' | 'emerald' | 'amber' | 'sky' | 'slate'
}

function KpiCard({ label, value, icon, tone }: KpiCardProps) {
  const toneClasses: Record<KpiCardProps['tone'], string> = {
    primary: 'bg-primary/10 text-primary',
    emerald: 'bg-emerald-500/10 text-emerald-600',
    amber: 'bg-amber-500/10 text-amber-600',
    sky: 'bg-sky-500/10 text-sky-600',
    slate: 'bg-slate-500/10 text-slate-600',
  }
  return (
    <Card className="flex items-center gap-4 p-4">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${toneClasses[tone]}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-xl font-bold tracking-tight text-foreground">{value}</p>
      </div>
    </Card>
  )
}

export function ElevesView() {
  const [recherche, setRecherche] = useState('')
  const [statutFiltre, setStatutFiltre] = useState<StatutFiltre>('Tous')
  const [page, setPage] = useState(1)

  const elevesFiltres = useMemo(() => {
    return eleves.filter((e) => {
      const matchStatut = statutFiltre === 'Tous' || e.statut === statutFiltre
      const q = recherche.trim().toLowerCase()
      const matchRecherche =
        q === '' ||
        `${e.nom} ${e.prenom}`.toLowerCase().includes(q) ||
        e.code.toLowerCase().includes(q) ||
        e.telephone.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.typePermis.toLowerCase().includes(q)
      return matchStatut && matchRecherche
    })
  }, [recherche, statutFiltre])

  const totalEleves = 248
  const parPage = 8
  const totalPages = Math.max(1, Math.ceil(elevesFiltres.length / parPage))
  const pageCourante = Math.min(page, totalPages)
  const debut = (pageCourante - 1) * parPage
  const elevesPage = elevesFiltres.slice(debut, debut + parPage)

  return (
    <div>
      <ViewHeader
        title="Élèves"
        description="Registre central des apprenants — du prospect à l'admis"
        actions={
          <ActionButton variant="primary" onClick={() => {}}>
            <Plus className="h-4 w-4" />
            Ajouter un élève
          </ActionButton>
        }
      />

      {/* KPI summary row */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total élèves"
          value="248"
          icon={<Users className="h-5 w-5" />}
          tone="primary"
        />
        <KpiCard
          label="En formation"
          value="142"
          icon={<GraduationCap className="h-5 w-5" />}
          tone="sky"
        />
        <KpiCard
          label="Admis ce mois"
          value="38"
          icon={<Award className="h-5 w-5" />}
          tone="emerald"
        />
        <KpiCard
          label="Taux réussite"
          value="78,5 %"
          icon={<TrendingUp className="h-5 w-5" />}
          tone="amber"
        />
      </div>

      {/* Toolbar */}
      <Card className="mb-4 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={recherche}
              onChange={(e) => {
                setRecherche(e.target.value)
                setPage(1)
              }}
              placeholder="Rechercher un élève..."
              className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
            />
          </div>

          <div className="custom-scrollbar -mx-1 flex items-center gap-1.5 overflow-x-auto px-1 pb-1 lg:pb-0">
            {STATUT_FILTRES.map((s) => {
              const actif = statutFiltre === s
              return (
                <button
                  key={s}
                  onClick={() => {
                    setStatutFiltre(s)
                    setPage(1)
                  }}
                  className={
                    actif
                      ? 'h-8 shrink-0 rounded-full bg-primary px-3 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90'
                      : 'h-8 shrink-0 rounded-full border border-border bg-background px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
                  }
                >
                  {s}
                </button>
              )
            })}
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="p-0">
        <div className="custom-scrollbar overflow-x-auto">
          <table className="w-full min-w-[1100px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Code dossier
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Élève
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Téléphone
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Type permis
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Statut
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Séances
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Solde
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Parrainé
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Moniteur
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {elevesPage.map((e) => {
                const nomComplet = `${e.prenom} ${e.nom}`
                const progres = Math.round((e.seancesFaites / e.seancesTotales) * 100)
                return (
                  <tr key={e.id} className="transition-colors hover:bg-muted/40">
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-medium text-muted-foreground">
                      {e.code}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {initials(nomComplet)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-foreground">{nomComplet}</p>
                          <p className="truncate text-xs text-muted-foreground">{e.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {e.telephone}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex h-7 min-w-8 items-center justify-center rounded-md bg-muted px-2 text-xs font-bold text-foreground">
                        {e.typePermis}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge label={e.statut} tone={statutTone(e.statut)} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-medium text-foreground">
                          {e.seancesFaites} / {e.seancesTotales}
                        </span>
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${progres}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      {e.solde > 0 ? (
                        <span className="font-semibold text-rose-600">{formatXOF(e.solde)}</span>
                      ) : (
                        <span className="text-xs font-medium text-emerald-600">Soldé</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {e.estParraine ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                          <Gift className="h-3 w-3" />
                          {e.parrainNom}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {e.moniteur}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        aria-label="Actions"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}

              {elevesPage.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    Aucun élève ne correspond à votre recherche.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / pagination */}
        <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Affichage de <span className="font-semibold text-foreground">{elevesFiltres.length === 0 ? 0 : debut + 1}</span> à{' '}
            <span className="font-semibold text-foreground">{debut + elevesPage.length}</span> sur{' '}
            <span className="font-semibold text-foreground">{totalEleves}</span> élèves
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={pageCourante <= 1}
              className="inline-flex h-8 items-center gap-1 rounded-md border border-border bg-background px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Précédent
            </button>
            <span className="px-2 text-xs font-medium text-muted-foreground">
              Page <span className="font-semibold text-foreground">{pageCourante}</span> / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={pageCourante >= totalPages}
              className="inline-flex h-8 items-center gap-1 rounded-md border border-border bg-background px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
            >
              Suivant
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}
