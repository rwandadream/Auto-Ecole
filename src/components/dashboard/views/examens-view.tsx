'use client'

import { useMemo, useState } from 'react'
import { Plus, FileText, MoreVertical, Pencil, Trash2, Eye, Search } from 'lucide-react'
import { toast } from 'sonner'
import { type ResultatExamen } from '@/lib/domain/types'
import { useDataStore } from '@/store/data-store'
import { useAuthStore } from '@/store/auth-store'
import { useNavStore } from '@/store/nav-store'
import { isSuperAdmin } from '@/lib/permissions'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import {
  ViewHeader,
  StatusBadge,
  ActionButton,
  Card,
  initials,
  PaginationFooter,
  resultatExamenTone,
  TypeExamenBadge,
} from './shared'
import {
  ResponsiveDataView,
  MobileListCard,
  MobileListCardRow,
} from '@/components/dashboard/responsive-data-view'
import { NouvelExamenDialog } from '@/components/dashboard/dialogs/nouvel-examen-dialog'
import { ModifierExamenDialog } from '@/components/dashboard/dialogs/modifier-examen-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { usePagination } from '@/hooks/usePagination'
import { ConfirmDialog } from '@/components/dashboard/confirm-dialog'

// --- Sub-component: Examens individuels table ---
const RESULTAT_FILTRES: Array<'Tous' | ResultatExamen> = ['Tous', 'En attente', 'Admis', 'Échec']
const TYPE_FILTRES = ['Tous', 'Code', 'Conduite'] as const

function ExamensIndividuels() {
  const examens = useDataStore((s) => s.examens)
  const deleteExamen = useDataStore((s) => s.deleteExamen)
  const setActiveView = useNavStore((s) => s.setActiveView)
  const setSelectedEleveCode = useNavStore((s) => s.setSelectedEleveCode)
  const user = useAuthStore((s) => s.user)
  const canDelete = isSuperAdmin(user?.mode === 'admin' ? user.role : '')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editExamen, setEditExamen] = useState<(typeof examens)[number] | null>(null)
  const [showEdit, setShowEdit] = useState(false)
  const [search, setSearch] = useState('')
  const [resultatFiltre, setResultatFiltre] = useState<'Tous' | ResultatExamen>('Tous')
  const [typeFiltre, setTypeFiltre] = useState<(typeof TYPE_FILTRES)[number]>('Tous')

  const filtered = useMemo(() => {
    return examens.filter((x) => {
      const q = search.trim().toLowerCase()
      const matchSearch =
        !q ||
        x.eleve.toLowerCase().includes(q) ||
        x.eleveCode.toLowerCase().includes(q) ||
        x.inspecteur.toLowerCase().includes(q) ||
        x.typeExamen.toLowerCase().includes(q) ||
        x.typePermis.toLowerCase().includes(q)
      const matchResultat = resultatFiltre === 'Tous' || x.resultat === resultatFiltre
      const matchType = typeFiltre === 'Tous' || x.typeExamen === typeFiltre
      return matchSearch && matchResultat && matchType
    })
  }, [examens, search, resultatFiltre, typeFiltre])

  const { page: pageCourante, setPage, totalPages, pageItems: examensPage, debut } = usePagination(filtered)

  return (
    <>
      {/* Toolbar */}
      <Card className="mb-4 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder="Rechercher un examen..."
              aria-label="Rechercher un examen"
              className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
            />
          </div>
          <div className="custom-scrollbar -mx-1 flex flex-wrap items-center gap-1.5 overflow-x-auto px-1 pb-1 lg:pb-0">
            {TYPE_FILTRES.map((t) => {
              const actif = typeFiltre === t
              return (
                <button
                  key={t}
                  aria-pressed={actif}
                  onClick={() => { setTypeFiltre(t); setPage(1) }}
                  className={cn(
                    'h-8 shrink-0 rounded-full px-3 text-xs font-semibold transition-colors',
                    actif
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  {t}
                </button>
              )
            })}
            <span className="mx-1 h-5 w-px bg-border" />
            {RESULTAT_FILTRES.map((r) => {
              const actif = resultatFiltre === r
              return (
                <button
                  key={r}
                  aria-pressed={actif}
                  onClick={() => { setResultatFiltre(r); setPage(1) }}
                  className={cn(
                    'h-8 shrink-0 rounded-full px-3 text-xs font-semibold transition-colors',
                    actif
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  {r}
                </button>
              )
            })}
          </div>
        </div>
      </Card>

      <Card className="p-0">
        <ResponsiveDataView
          empty={examensPage.length === 0}
          emptyState={
            <p className="px-4 py-12 text-center text-sm text-muted-foreground">
              Aucun examen ne correspond à votre recherche.
            </p>
          }
          mobile={examensPage.map((x) => (
            <MobileListCard key={x.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {initials(x.eleve)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">{x.eleve}</p>
                    <p className="font-mono text-xs text-muted-foreground">{x.eleveCode}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      aria-label="Actions"
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onSelect={() => {
                        setSelectedEleveCode(x.eleveCode)
                        setActiveView('eleve-detail')
                      }}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Voir la fiche élève
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => {
                        setEditExamen(x)
                        setShowEdit(true)
                      }}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Modifier
                    </DropdownMenuItem>
                    {canDelete && (
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onSelect={() => setDeleteId(x.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="mt-3 space-y-1 border-t border-border pt-3">
                <MobileListCardRow label="Type examen">
                  <TypeExamenBadge type={x.typeExamen} />
                </MobileListCardRow>
                <MobileListCardRow label="Type permis">{x.typePermis}</MobileListCardRow>
                <MobileListCardRow label="Date">{x.dateExamen}</MobileListCardRow>
                <MobileListCardRow label="Inspecteur">{x.inspecteur}</MobileListCardRow>
                <MobileListCardRow label="Résultat">
                  <StatusBadge label={x.resultat} tone={resultatExamenTone[x.resultat]} />
                </MobileListCardRow>
                {x.notes && (
                  <MobileListCardRow label="Notes">
                    <span className="line-clamp-2 text-left">{x.notes}</span>
                  </MobileListCardRow>
                )}
              </div>
            </MobileListCard>
          ))}
          desktop={
            <div className="custom-scrollbar overflow-x-auto">
              <table className="w-full min-w-[960px] border-collapse text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Élève</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type examen</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type permis</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Inspecteur</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Résultat</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notes</th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {examensPage.map((x) => (
                <tr key={x.id} className="hover:bg-muted/40">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {initials(x.eleve)}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-foreground">{x.eleve}</div>
                        <div className="text-xs text-muted-foreground">{x.eleveCode}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5"><TypeExamenBadge type={x.typeExamen} /></td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-medium text-foreground">{x.typePermis}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm text-foreground">{x.dateExamen}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm text-muted-foreground">{x.inspecteur}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge label={x.resultat} tone={resultatExamenTone[x.resultat]} />
                  </td>
                  <td className="px-5 py-3.5 max-w-[220px]">
                    {x.notes ? (
                      <span className="line-clamp-1 text-sm text-muted-foreground" title={x.notes}>
                        {x.notes}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground/50">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          aria-label="Actions"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onSelect={() => {
                            setSelectedEleveCode(x.eleveCode)
                            setActiveView('eleve-detail')
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Voir la fiche élève
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => {
                            setEditExamen(x)
                            setShowEdit(true)
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Modifier
                        </DropdownMenuItem>
                        {canDelete && (
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onSelect={() => setDeleteId(x.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {examensPage.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    Aucun examen ne correspond à votre recherche.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
            </div>
          }
        />
        <PaginationFooter
          pageCourante={pageCourante}
          totalPages={totalPages}
          total={filtered.length}
          debut={debut}
          pageDataLength={examensPage.length}
          label="examens"
          setPage={setPage}
        />
      </Card>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(v) => { if (!v) setDeleteId(null) }}
        title="Supprimer cet examen ?"
        description="Cette action est irréversible. L'examen sera définitivement retiré de l'historique."
        onConfirm={() => {
          if (deleteId) {
            deleteExamen(deleteId)
            toast.success('Examen supprimé.')
            setDeleteId(null)
          }
        }}
      />

      <ModifierExamenDialog
        examen={editExamen}
        open={showEdit}
        onOpenChange={(v) => {
          setShowEdit(v)
          if (!v) setEditExamen(null)
        }}
      />
    </>
  )
}

// --- Sub-component: Sessions collectives grid ---
function SessionsCollectives() {
  const examenSessions = useDataStore((s) => s.examenSessions)
  const setActiveView = useNavStore((s) => s.setActiveView)
  const { page: pageCourante, setPage, totalPages, pageItems: sessionsPage, debut } = usePagination(examenSessions, 9)

  return (
    <div>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {sessionsPage.map((sess) => (
        <Card key={sess.id} className="flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 font-mono text-xs font-bold text-foreground">
                {sess.numeroBordereau}
              </span>
              <div className="mt-2 flex items-center gap-2">
                <TypeExamenBadge type={sess.typeExamen} />
                <span className="text-xs text-muted-foreground">
                  {sess.candidats.length} candidat{sess.candidats.length > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Session info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Date</div>
              <div className="mt-0.5 font-medium text-foreground">{sess.date} · {sess.heure}</div>
            </div>
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Centre</div>
              <div className="mt-0.5 font-medium text-foreground">{sess.centre}</div>
            </div>
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Inspecteur</div>
              <div className="mt-0.5 font-medium text-foreground">{sess.inspecteur}</div>
            </div>
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Véhicule</div>
              <div className="mt-0.5 font-medium text-foreground">{sess.vehicule}</div>
            </div>
          </div>

          {/* Action */}
          <button
            onClick={() => setActiveView('bordereaux')}
            className={cn(
              'flex h-9 items-center justify-center gap-2 rounded-lg border border-input bg-background px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
            )}
          >
            <FileText className="h-4 w-4" />
            Voir le bordereau
          </button>
        </Card>
      ))}
    </div>
    {totalPages > 1 && (
      <div className="mt-4">
        <Card className="p-0">
          <PaginationFooter
            pageCourante={pageCourante}
            totalPages={totalPages}
            total={examenSessions.length}
            debut={debut}
            pageDataLength={sessionsPage.length}
            label="sessions"
            setPage={setPage}
          />
        </Card>
      </div>
    )}
    </div>
  )
}

// --- Main component ---
export function ExamensView() {
  const [showAdd, setShowAdd] = useState(false)
  return (
    <>
      <ViewHeader
        title="Examens & Sessions"
        description="Suivi des examens individuels et sessions collectives"
        actions={
          <ActionButton variant="primary" onClick={() => setShowAdd(true)}>
            <Plus className="h-4 w-4" />
            Nouvel examen
          </ActionButton>
        }
      />

      <Tabs defaultValue="individuels" className="w-full">
        <TabsList>
          <TabsTrigger value="individuels">Examens individuels</TabsTrigger>
          <TabsTrigger value="collectives">Sessions collectives</TabsTrigger>
        </TabsList>

        <TabsContent value="individuels" className="mt-4">
          <ExamensIndividuels />
        </TabsContent>
        <TabsContent value="collectives" className="mt-4">
          <SessionsCollectives />
        </TabsContent>
      </Tabs>

      <NouvelExamenDialog open={showAdd} onOpenChange={setShowAdd} />
    </>
  )
}
