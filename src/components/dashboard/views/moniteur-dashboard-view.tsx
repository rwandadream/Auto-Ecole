'use client'

import {
  CalendarClock,
  CheckCircle2,
  Clock,
  Users,
  Car,
  MapPin,
  TrendingUp,
  CalendarX,
  User as UserIcon,
} from 'lucide-react'
import { useMemo } from 'react'
import { useAuthStore } from '@/store/auth-store'
import { useDataStore } from '@/store/data-store'
import { cn } from '@/lib/utils'
import { ViewHeader, Card, StatusBadge, statutSeanceTone, formatXOF, dureeLabel } from './shared'

const jours = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
const TODAY = new Date().toISOString().slice(0, 10)
const START_OF_WEEK = (() => {
  const d = new Date()
  d.setDate(d.getDate() - d.getDay() + 1)
  return d.toISOString().slice(0, 10)
})()
const END_OF_WEEK = (() => {
  const d = new Date()
  d.setDate(d.getDate() - d.getDay() + 7)
  return d.toISOString().slice(0, 10)
})()

function formatDateFr(iso: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso
  const d = new Date(iso + 'T00:00:00')
  return `${jours[d.getDay()]} ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
}

function KpiCard({
  label,
  value,
  sub,
  icon,
  tone = 'primary',
}: {
  label: string
  value: string | number
  sub?: string
  icon: React.ReactNode
  tone?: 'primary' | 'success' | 'warning' | 'muted'
}) {
  const toneMap = {
    primary: { bg: 'bg-primary/10', text: 'text-primary', val: 'text-primary' },
    success: { bg: 'bg-success/10', text: 'text-success', val: 'text-success' },
    warning: { bg: 'bg-warning/10', text: 'text-warning', val: 'text-foreground' },
    muted: { bg: 'bg-muted', text: 'text-muted-foreground', val: 'text-foreground' },
  }
  const t = toneMap[tone]
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', t.bg, t.text)}>
          {icon}
        </div>
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      </div>
      <p className={cn('mt-3 text-2xl font-bold', t.val)}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </Card>
  )
}

export function MoniteurDashboardView() {
  const user = useAuthStore((s) => s.user)
  const seances = useDataStore((s) => s.seances)
  const eleves = useDataStore((s) => s.eleves)
  const moniteurs = useDataStore((s) => s.moniteurs)

  const prenom = user?.mode === 'admin' ? user.name.split(' ')[0] : 'Moniteur'

  // Find the moniteur record matching the logged-in user by name
  const moniteurRecord = useMemo(() => {
    if (user?.mode !== 'admin') return null
    const nameLower = user.name.toLowerCase()
    return moniteurs.find((m) => {
      const full = `${m.prenom} ${m.nom}`.toLowerCase()
      const fullRev = `${m.nom} ${m.prenom}`.toLowerCase()
      return full === nameLower || fullRev === nameLower ||
        full.includes(nameLower) || nameLower.includes(m.prenom.toLowerCase())
    }) ?? null
  }, [user, moniteurs])

  // All séances assigned to this moniteur
  const mySeances = useMemo(() => {
    if (!moniteurRecord) return seances.filter((s) => s.moniteur === (user?.mode === 'admin' ? user.name : ''))
    return seances.filter((s) => s.moniteurId === moniteurRecord.id)
  }, [seances, moniteurRecord, user])

  const seancesAujourdhui = mySeances.filter((s) => s.date === TODAY)
  const seancesSemaine = mySeances.filter((s) => s.date >= START_OF_WEEK && s.date <= END_OF_WEEK)
  const seancesAVenir = mySeances.filter((s) => s.date > TODAY && s.statut === 'Planifié')
  const seancesEffectuees = mySeances.filter((s) => s.statut === 'Effectué')
  const tauxPresence = mySeances.filter((s) => s.statut !== 'Planifié').length > 0
    ? Math.round(seancesEffectuees.length / mySeances.filter((s) => s.statut !== 'Planifié').length * 100)
    : null

  // Students assigned to this moniteur
  const mesEleves = useMemo(() => {
    if (!moniteurRecord) return eleves.filter((e) => e.moniteur === (user?.mode === 'admin' ? user.name : ''))
    return eleves.filter((e) => {
      const seanceEleve = mySeances.find((s) => s.eleveCode === e.code)
      return !!seanceEleve
    })
  }, [eleves, moniteurRecord, mySeances, user])

  const uniqueEleves = useMemo(() => {
    const seen = new Set<string>()
    return mesEleves.filter((e) => { if (seen.has(e.code)) return false; seen.add(e.code); return true })
  }, [mesEleves])

  const seancesParDate = useMemo(() => {
    const grouped: Record<string, typeof mySeances> = {}
    for (const s of seancesAVenir.slice(0, 15)) {
      if (!grouped[s.date]) grouped[s.date] = []
      grouped[s.date].push(s)
    }
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b))
  }, [seancesAVenir])

  return (
    <>
      <ViewHeader
        title={`Bonjour ${prenom} 👋`}
        description="Votre tableau de bord moniteur"
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard
          label="Aujourd'hui"
          value={seancesAujourdhui.length}
          sub="séance(s) ce jour"
          icon={<CalendarClock className="h-5 w-5" />}
          tone="primary"
        />
        <KpiCard
          label="Cette semaine"
          value={seancesSemaine.length}
          sub="séances planifiées"
          icon={<Clock className="h-5 w-5" />}
          tone="muted"
        />
        <KpiCard
          label="Mes élèves"
          value={uniqueEleves.length}
          sub="apprenants actifs"
          icon={<Users className="h-5 w-5" />}
          tone="success"
        />
        <KpiCard
          label="Taux présence"
          value={tauxPresence !== null ? `${tauxPresence}%` : '—'}
          sub={`sur ${mySeances.filter((s) => s.statut !== 'Planifié').length} séances réalisées`}
          icon={<TrendingUp className="h-5 w-5" />}
          tone="warning"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Planning à venir */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-bold text-foreground">Mes prochaines séances</h2>
          {seancesParDate.length === 0 ? (
            <Card>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CalendarX className="h-10 w-10 text-muted-foreground/40" />
                <p className="mt-3 text-sm font-medium text-foreground">Aucune séance à venir</p>
                <p className="mt-1 text-xs text-muted-foreground">Vos prochaines séances apparaîtront ici.</p>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {seancesParDate.map(([date, ss]) => (
                <div key={date}>
                  <div className="mb-2 flex items-center gap-2">
                    <div className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <span className="text-[9px] font-semibold uppercase">{jours[new Date(date + 'T00:00:00').getDay()]}</span>
                      <span className="text-sm font-bold leading-none">{String(new Date(date + 'T00:00:00').getDate()).padStart(2, '0')}</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground">{formatDateFr(date)}</p>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{ss.length} séance{ss.length > 1 ? 's' : ''}</span>
                  </div>
                  <div className="space-y-2 pl-1">
                    {ss.map((s) => (
                      <Card key={s.id} className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="text-center">
                            <p className="text-sm font-bold text-foreground">{s.heureDebut}</p>
                            <p className="text-[10px] text-muted-foreground">{s.heureFin}</p>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">{s.eleve}</p>
                            <div className="mt-0.5 flex flex-wrap items-center gap-2">
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Car className="h-3 w-3" />{s.vehicule}
                              </span>
                              {s.lieuRdv && (
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <MapPin className="h-3 w-3" />{s.lieuRdv}
                                </span>
                              )}
                            </div>
                          </div>
                          <StatusBadge label={s.statut} tone={statutSeanceTone[s.statut]} />
                        </div>
                        {s.notes && (
                          <p className="mt-2 text-xs text-muted-foreground bg-muted/40 rounded px-2 py-1">{s.notes}</p>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mes élèves */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-foreground">Mes élèves ({uniqueEleves.length})</h2>
          {uniqueEleves.length === 0 ? (
            <Card>
              <p className="py-8 text-center text-sm text-muted-foreground">Aucun élève assigné</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {uniqueEleves.map((e) => {
                const pct = e.seancesTotales > 0 ? Math.round(e.seancesFaites / e.seancesTotales * 100) : 0
                return (
                  <Card key={e.id} className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {e.prenom[0]}{e.nom[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">{e.prenom} {e.nom}</p>
                        <p className="text-xs text-muted-foreground">{e.code} · Permis {e.typePermis}</p>
                        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <p className="mt-0.5 text-[10px] text-muted-foreground">{e.seancesFaites}/{e.seancesTotales} séances ({pct}%)</p>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
