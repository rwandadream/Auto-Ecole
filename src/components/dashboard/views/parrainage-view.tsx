'use client'

import { useMemo, useState } from 'react'
import {
  Gift,
  Users,
  CheckCircle2,
  BadgeDollarSign,
  Settings2,
  Search,
  TrendingUp,
  ChevronRight,
  UserRound,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDataStore } from '@/store/data-store'
import { useNavStore } from '@/store/nav-store'
import type { Eleve } from '@/store/data-store'
import {
  ViewHeader,
  Card,
  KpiCard,
  StatusBadge,
  ActionButton,
  PaginationFooter,
  statutEleveTone,
  formatXOF,
  initials,
  PageToolbar,
} from './shared'
import {
  ResponsiveDataView,
  MobileListCard,
  MobileListCardRow,
} from '@/components/dashboard/responsive-data-view'
import {
  Modal,
  ModalCancelButton,
  ModalPrimaryButton,
  Field,
  FormInput,
} from '@/components/dashboard/modal'

const COMMISSION_KEY = 'sarah_commission_parrainage'
const DEFAULT_COMMISSION = 5000

type FiltreParrain = 'Tous' | 'Commissions' | 'En cours'

type ParrainGroup = {
  parrainNom: string
  eleves: Eleve[]
  valides: number
  enCours: number
  commission: number
  tauxReussite: number
}

function loadCommission(): number {
  if (typeof window === 'undefined') return DEFAULT_COMMISSION
  const stored = localStorage.getItem(COMMISSION_KEY)
  const n = stored ? parseInt(stored, 10) : NaN
  return Number.isNaN(n) || n < 0 ? DEFAULT_COMMISSION : n
}

function isDiplome(statut: Eleve['statut']) {
  return statut === 'Admis' || statut === 'Terminé'
}

function ProgressBar({ value, className }: { value: number; className?: string }) {
  const pct = Math.min(100, Math.max(0, value))
  return (
    <div className={cn('h-1.5 w-full overflow-hidden rounded-full bg-muted', className)}>
      <div
        className="h-full rounded-full bg-success transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export function ParrainageView() {
  const eleves = useDataStore((s) => s.eleves)
  const setActiveView = useNavStore((s) => s.setActiveView)
  const setSelectedEleveCode = useNavStore((s) => s.setSelectedEleveCode)

  const [commissionUnitaire, setCommissionUnitaire] = useState<number>(loadCommission)
  const [showCommissionModal, setShowCommissionModal] = useState(false)
  const [pageRecap, setPageRecap] = useState(1)
  const PAR_PAGE_RECAP = 10
  const [tempCommission, setTempCommission] = useState('')
  const [search, setSearch] = useState('')
  const [filtre, setFiltre] = useState<FiltreParrain>('Tous')
  const [selectedParrain, setSelectedParrain] = useState<string | null>(null)

  const parraines = useMemo(
    () => eleves.filter((e) => e.estParraine && e.parrainNom.trim() !== ''),
    [eleves],
  )

  const byParrain = useMemo((): ParrainGroup[] => {
    const map = new Map<string, ParrainGroup>()
    for (const e of parraines) {
      const nom = e.parrainNom.trim()
      if (!map.has(nom)) {
        map.set(nom, {
          parrainNom: nom,
          eleves: [],
          valides: 0,
          enCours: 0,
          commission: 0,
          tauxReussite: 0,
        })
      }
      const entry = map.get(nom)!
      entry.eleves.push(e)
      if (isDiplome(e.statut)) {
        entry.valides += 1
        entry.commission += commissionUnitaire
      } else if (e.statut !== 'Abandon') {
        entry.enCours += 1
      }
    }
    return Array.from(map.values())
      .map((p) => ({
        ...p,
        tauxReussite: p.eleves.length > 0 ? Math.round((p.valides / p.eleves.length) * 100) : 0,
      }))
      .sort((a, b) => b.commission - a.commission || b.eleves.length - a.eleves.length)
  }, [parraines, commissionUnitaire])

  const filteredParrains = useMemo(() => {
    const q = search.trim().toLowerCase()
    return byParrain.filter((p) => {
      if (filtre === 'Commissions' && p.commission <= 0) return false
      if (filtre === 'En cours' && p.enCours <= 0) return false
      if (!q) return true
      return (
        p.parrainNom.toLowerCase().includes(q) ||
        p.eleves.some(
          (e) =>
            `${e.prenom} ${e.nom}`.toLowerCase().includes(q) ||
            e.code.toLowerCase().includes(q),
        )
      )
    })
  }, [byParrain, search, filtre])

  const activeParrainNom = useMemo(() => {
    if (filteredParrains.length === 0) return null
    if (selectedParrain && filteredParrains.some((p) => p.parrainNom === selectedParrain)) {
      return selectedParrain
    }
    return filteredParrains[0].parrainNom
  }, [filteredParrains, selectedParrain])

  const selected = useMemo(
    () =>
      activeParrainNom
        ? filteredParrains.find((p) => p.parrainNom === activeParrainNom) ?? null
        : null,
    [filteredParrains, activeParrainNom],
  )

  const totalEleves = parraines.length
  const totalParrains = byParrain.length
  const totalValides = byParrain.reduce((s, p) => s + p.valides, 0)
  const totalCommission = byParrain.reduce((s, p) => s + p.commission, 0)
  const tauxGlobal = totalEleves > 0 ? Math.round((totalValides / totalEleves) * 100) : 0

  const openCommissionModal = () => {
    setTempCommission(String(commissionUnitaire))
    setShowCommissionModal(true)
  }

  const handleSaveCommission = () => {
    const n = parseInt(tempCommission, 10)
    if (!Number.isNaN(n) && n >= 0) {
      setCommissionUnitaire(n)
      localStorage.setItem(COMMISSION_KEY, String(n))
    }
    setShowCommissionModal(false)
  }

  const goToEleve = (code: string) => {
    setSelectedEleveCode(code)
    setActiveView('eleve-detail')
  }

  const FILTRES: FiltreParrain[] = ['Tous', 'Commissions', 'En cours']

  const emptyState = (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
        <Gift className="h-7 w-7 text-primary" />
      </div>
      <p className="mt-4 text-base font-semibold text-foreground">Aucun parrainage enregistré</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Renseignez un parrain lors de l&apos;inscription d&apos;un élève pour suivre les filleuls et calculer les commissions.
      </p>
    </div>
  )

  return (
    <>
      <ViewHeader
        title="Parrainage & Commissions"
        description="Suivi des parrains et calcul des commissions sur élèves diplômés"
        actions={
          <ActionButton variant="outline" onClick={openCommissionModal}>
            <Settings2 className="h-4 w-4" />
            {formatXOF(commissionUnitaire)} / diplômé
          </ActionButton>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        <KpiCard
          label="Parrains actifs"
          value={String(totalParrains)}
          icon={<Gift className="h-5 w-5" />}
          tone="primary"
        />
        <KpiCard
          label="Élèves parrainés"
          value={String(totalEleves)}
          icon={<Users className="h-5 w-5" />}
          tone="neutral"
        />
        <KpiCard
          label="Diplômés validés"
          value={String(totalValides)}
          icon={<CheckCircle2 className="h-5 w-5" />}
          tone="success"
        />
        <KpiCard
          label="Taux de réussite"
          value={`${tauxGlobal} %`}
          icon={<TrendingUp className="h-5 w-5" />}
          tone="secondary"
        />
        <div className="col-span-2 lg:col-span-1">
          <KpiCard
            label="Commissions dues"
            value={formatXOF(totalCommission)}
            icon={<BadgeDollarSign className="h-5 w-5" />}
            tone="warning"
          />
        </div>
      </div>

      {/* Synthèse */}
      {byParrain.length > 0 && (
        <Card className="mt-4 border-primary/20 bg-gradient-to-r from-primary/5 via-card to-card p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total commissions à verser</p>
                <p className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">
                  {formatXOF(totalCommission)}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {totalValides} diplômé{totalValides > 1 ? 's' : ''} × {formatXOF(commissionUnitaire)}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 rounded-xl border border-border bg-background/80 p-3 sm:min-w-[280px]">
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">{totalParrains}</p>
                <p className="text-[11px] font-medium text-muted-foreground">Parrains</p>
              </div>
              <div className="border-x border-border text-center">
                <p className="text-lg font-bold text-success">{totalValides}</p>
                <p className="text-[11px] font-medium text-muted-foreground">Validés</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">
                  {byParrain.reduce((s, p) => s + p.enCours, 0)}
                </p>
                <p className="text-[11px] font-medium text-muted-foreground">En cours</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {byParrain.length === 0 ? (
        <Card className="mt-6 p-0">{emptyState}</Card>
      ) : (
        <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,340px)_1fr] lg:gap-6">
          {/* Liste parrains */}
          <Card className="flex flex-col p-0 lg:max-h-[calc(100dvh-22rem)]">
            <div className="border-b border-border p-4">
              <PageToolbar className="mb-0">
                <div className="relative w-full">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Rechercher un parrain ou filleul…"
                    className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
                  />
                </div>
              </PageToolbar>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {FILTRES.map((f) => {
                  const active = filtre === f
                  return (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFiltre(f)}
                      className={cn(
                        'rounded-full px-3 py-1 text-xs font-semibold transition-colors',
                        active
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground',
                      )}
                    >
                      {f}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="custom-scrollbar flex-1 overflow-y-auto p-2">
              {filteredParrains.length === 0 ? (
                <p className="px-2 py-8 text-center text-sm text-muted-foreground">
                  Aucun parrain ne correspond à votre recherche.
                </p>
              ) : (
                <ul className="space-y-1.5">
                  {filteredParrains.map((p) => {
                    const active = activeParrainNom === p.parrainNom
                    return (
                      <li key={p.parrainNom}>
                        <button
                          type="button"
                          onClick={() => setSelectedParrain(p.parrainNom)}
                          className={cn(
                            'w-full rounded-xl border px-3 py-3 text-left transition-all',
                            active
                              ? 'border-primary/40 bg-primary/5 shadow-sm'
                              : 'border-transparent bg-transparent hover:border-border hover:bg-muted/40',
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold',
                                active ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary',
                              )}
                            >
                              {initials(p.parrainNom)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-foreground">{p.parrainNom}</p>
                              <p className="text-xs text-muted-foreground">
                                {p.eleves.length} filleul{p.eleves.length > 1 ? 's' : ''} · {p.valides} diplômé{p.valides > 1 ? 's' : ''}
                              </p>
                              <ProgressBar value={p.tauxReussite} className="mt-2" />
                            </div>
                            <div className="shrink-0 text-right">
                              <p
                                className={cn(
                                  'text-sm font-bold',
                                  p.commission > 0 ? 'text-primary' : 'text-muted-foreground',
                                )}
                              >
                                {formatXOF(p.commission)}
                              </p>
                              <ChevronRight
                                className={cn(
                                  'ml-auto mt-1 h-4 w-4 text-muted-foreground transition-transform lg:hidden',
                                  active && 'rotate-90 text-primary',
                                )}
                              />
                            </div>
                          </div>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </Card>

          {/* Détail parrain */}
          <Card className="flex flex-col p-0">
            {!selected ? (
              <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
                <UserRound className="h-10 w-10 text-muted-foreground/40" />
                <p className="mt-3 text-sm font-medium text-foreground">Sélectionnez un parrain</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Consultez le détail des filleuls et la commission associée.
                </p>
              </div>
            ) : (
              <>
                <div className="border-b border-border bg-muted/20 px-4 py-4 sm:px-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-base font-bold text-primary-foreground">
                        {initials(selected.parrainNom)}
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-foreground">{selected.parrainNom}</h2>
                        <p className="text-sm text-muted-foreground">
                          {selected.eleves.length} filleul{selected.eleves.length > 1 ? 's' : ''} parrainé{selected.eleves.length > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-center sm:text-right">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Commission due
                      </p>
                      <p className="text-2xl font-bold text-primary">{formatXOF(selected.commission)}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <div className="rounded-lg border border-border bg-background px-3 py-2 text-center">
                      <p className="text-lg font-bold text-foreground">{selected.eleves.length}</p>
                      <p className="text-[11px] font-medium text-muted-foreground">Référés</p>
                    </div>
                    <div className="rounded-lg border border-border bg-background px-3 py-2 text-center">
                      <p className="text-lg font-bold text-success">{selected.valides}</p>
                      <p className="text-[11px] font-medium text-muted-foreground">Diplômés</p>
                    </div>
                    <div className="rounded-lg border border-border bg-background px-3 py-2 text-center">
                      <p className="text-lg font-bold text-foreground">{selected.enCours}</p>
                      <p className="text-[11px] font-medium text-muted-foreground">En cours</p>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium text-muted-foreground">Taux de réussite</span>
                      <span className="font-semibold text-foreground">{selected.tauxReussite} %</span>
                    </div>
                    <ProgressBar value={selected.tauxReussite} />
                  </div>
                </div>

                <div className="border-b border-border px-4 py-3 sm:px-5">
                  <h3 className="text-sm font-semibold text-foreground">Filleuls parrainés</h3>
                  <p className="text-xs text-muted-foreground">
                    Cliquez sur un élève pour ouvrir sa fiche
                  </p>
                </div>

                <ResponsiveDataView
                  empty={selected.eleves.length === 0}
                  emptyState={
                    <p className="p-6 text-center text-sm text-muted-foreground">Aucun filleul.</p>
                  }
                  mobile={selected.eleves.map((e) => (
                    <MobileListCard key={e.id} onClick={() => goToEleve(e.code)}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {e.prenom} {e.nom}
                          </p>
                          <p className="text-xs text-muted-foreground">{e.code}</p>
                        </div>
                        <StatusBadge label={e.statut} tone={statutEleveTone[e.statut]} />
                      </div>
                      <div className="mt-2 space-y-1">
                        <MobileListCardRow label="Permis">{e.typePermis}</MobileListCardRow>
                        <MobileListCardRow label="Inscription">{e.dateInscription}</MobileListCardRow>
                        <MobileListCardRow label="Commission">
                          {isDiplome(e.statut) ? (
                            <span className="font-semibold text-primary">{formatXOF(commissionUnitaire)}</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </MobileListCardRow>
                      </div>
                    </MobileListCard>
                  ))}
                  desktop={
                    <div className="custom-scrollbar overflow-x-auto">
                      <table className="w-full min-w-[640px] text-sm">
                        <thead>
                          <tr className="border-b border-border bg-muted/30 text-left">
                            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              Élève
                            </th>
                            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              Permis
                            </th>
                            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              Inscription
                            </th>
                            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              Statut
                            </th>
                            <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              Commission
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {selected.eleves.map((e) => (
                            <tr
                              key={e.id}
                              onClick={() => goToEleve(e.code)}
                              className="cursor-pointer transition-colors hover:bg-muted/40"
                            >
                              <td className="px-5 py-3">
                                <p className="font-medium text-foreground">
                                  {e.prenom} {e.nom}
                                </p>
                                <p className="text-xs text-muted-foreground">{e.code}</p>
                              </td>
                              <td className="px-5 py-3 text-muted-foreground">{e.typePermis}</td>
                              <td className="px-5 py-3 text-muted-foreground">{e.dateInscription}</td>
                              <td className="px-5 py-3">
                                <StatusBadge label={e.statut} tone={statutEleveTone[e.statut]} />
                              </td>
                              <td className="px-5 py-3 text-right">
                                {isDiplome(e.statut) ? (
                                  <span className="font-bold text-primary">
                                    {formatXOF(commissionUnitaire)}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">—</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t border-border bg-muted/30 font-semibold">
                            <td colSpan={4} className="px-5 py-3 text-foreground">
                              Total parrain
                            </td>
                            <td className="px-5 py-3 text-right text-primary">
                              {formatXOF(selected.commission)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  }
                />
              </>
            )}
          </Card>
        </div>
      )}

      {/* Tableau récap desktop (vue d'ensemble) */}
      {byParrain.length > 0 && (() => {
        const totalPagesRecap = Math.max(1, Math.ceil(byParrain.length / PAR_PAGE_RECAP))
        const pageRecapCourante = Math.min(pageRecap, totalPagesRecap)
        const debutRecap = (pageRecapCourante - 1) * PAR_PAGE_RECAP
        const recapPage = byParrain.slice(debutRecap, debutRecap + PAR_PAGE_RECAP)
        return (
        <Card className="mt-6 hidden p-0 xl:block">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-base font-semibold text-foreground">Vue d&apos;ensemble</h2>
            <p className="text-sm text-muted-foreground">Récapitulatif de tous les parrains</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30 text-left">
                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Parrain
                      </th>
                      <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Référés
                      </th>
                      <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Diplômés
                      </th>
                      <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        En cours
                      </th>
                      <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Réussite
                      </th>
                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Commission
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {recapPage.map((p) => (
                      <tr
                        key={p.parrainNom}
                        onClick={() => setSelectedParrain(p.parrainNom)}
                        className="cursor-pointer transition-colors hover:bg-muted/30"
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                              {initials(p.parrainNom)}
                            </div>
                            <span className="font-medium text-foreground">{p.parrainNom}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-center font-semibold text-foreground">
                          {p.eleves.length}
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span className="inline-flex min-w-7 items-center justify-center rounded-full bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">
                            {p.valides}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-center text-muted-foreground">{p.enCours}</td>
                        <td className="px-5 py-3">
                          <div className="mx-auto flex max-w-[120px] items-center gap-2">
                            <ProgressBar value={p.tauxReussite} className="flex-1" />
                            <span className="text-xs font-medium text-muted-foreground">{p.tauxReussite}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <span
                            className={cn(
                              'font-bold',
                              p.commission > 0 ? 'text-primary' : 'text-muted-foreground',
                            )}
                          >
                            {formatXOF(p.commission)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-border bg-muted/40 font-bold">
                      <td className="px-5 py-3 text-foreground">Total</td>
                      <td className="px-5 py-3 text-center text-foreground">{totalEleves}</td>
                      <td className="px-5 py-3 text-center text-success">{totalValides}</td>
                      <td className="px-5 py-3 text-center text-foreground">
                        {byParrain.reduce((s, p) => s + p.enCours, 0)}
                      </td>
                      <td className="px-5 py-3 text-center text-muted-foreground">{tauxGlobal}%</td>
                      <td className="px-5 py-3 text-right text-primary">{formatXOF(totalCommission)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
          {byParrain.length > PAR_PAGE_RECAP && (
            <PaginationFooter
              pageCourante={pageRecapCourante}
              totalPages={totalPagesRecap}
              total={byParrain.length}
              debut={debutRecap}
              pageDataLength={recapPage.length}
              label="parrains"
              setPage={setPageRecap}
            />
          )}
        </Card>
        )
      })()}

      <Modal
        open={showCommissionModal}
        onOpenChange={setShowCommissionModal}
        title="Commission parrainage"
        description="Montant versé au parrain pour chaque filleul diplômé (Admis ou Terminé)"
        size="sm"
        scroll={false}
        footer={
          <>
            <ModalCancelButton onClick={() => setShowCommissionModal(false)}>
              Annuler
            </ModalCancelButton>
            <ModalPrimaryButton onClick={handleSaveCommission}>
              Enregistrer
            </ModalPrimaryButton>
          </>
        }
      >
        <Field label="Montant unitaire (XOF)" required>
          <FormInput
            type="text"
            inputMode="numeric"
            value={tempCommission}
            onChange={(e) => setTempCommission(e.target.value.replace(/\D/g, ''))}
            placeholder="5000"
          />
        </Field>
        <p className="text-xs text-muted-foreground">
          Ce montant est appliqué automatiquement à chaque élève parrainé au statut Admis ou Terminé.
        </p>
      </Modal>
    </>
  )
}
