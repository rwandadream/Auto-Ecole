'use client'

import {
  Clock,
  CalendarClock,
  Wallet,
  CheckCircle2,
  Car,
  User as UserIcon,
  ArrowRight,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth-store'
import { useDataStore } from '@/store/data-store'
import type { StatutEleve } from '@/lib/domain/types'
import { cn } from '@/lib/utils'
import {
  ViewHeader,
  Card,
  formatXOF,
} from './shared'

// Date helpers (consistent with planning-view)
const jours = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
const mois = [
  'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
  'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc',
]

function formatDateFr(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso
  const d = new Date(iso + 'T00:00:00')
  const j = jours[d.getDay()]
  const jour = String(d.getDate()).padStart(2, '0')
  const m = mois[d.getMonth()]
  return `${j} ${jour} ${m}`
}

const TODAY = new Date().toISOString().slice(0, 10)

// Lifecycle steps for "Mon parcours"
const lifecycle: { label: string; value: StatutEleve }[] = [
  { label: 'Prospect', value: 'Prospect' },
  { label: 'Inscrit', value: 'Inscrit' },
  { label: 'En formation', value: 'En formation' },
  { label: 'Examen', value: 'Examen' },
  { label: 'Admis', value: 'Admis' },
]

// Map any statut to an index in the lifecycle (Ajourné = step Examen, Terminé = step Admis)
function lifecycleIndex(statut: StatutEleve): number {
  switch (statut) {
    case 'Prospect':
      return 0
    case 'Inscrit':
      return 1
    case 'En formation':
      return 2
    case 'Examen':
    case 'Ajourné':
      return 3
    case 'Admis':
    case 'Terminé':
      return 4
    case 'Abandon':
      return -1
  }
}

export function StudentDashboardView() {
  const user = useAuthStore((s) => s.user)
  const seances = useDataStore((s) => s.seances)
  const eleves = useDataStore((s) => s.eleves)

  if (!user || user.mode !== 'eleve') return null

  const me = eleves.find((e) => e.code === user.code)
  const prenom = user.nomComplet.split(' ')[0]

  // Upcoming séances: eleveCode match + date >= today + statut Planifié, sorted by date+time
  const upcoming = seances
    .filter(
      (s) =>
        s.eleveCode === user.code &&
        s.date >= TODAY &&
        s.statut === 'Planifié'
    )
    .sort((a, b) =>
      a.date === b.date
        ? a.heureDebut.localeCompare(b.heureDebut)
        : a.date.localeCompare(b.date)
    )

  const prochaine = upcoming[0]
  const seancesFaites = me?.seancesFaites ?? 0
  const seancesTotales = me?.seancesTotales ?? 0
  const progress = seancesTotales > 0 ? Math.round((seancesFaites / seancesTotales) * 100) : 0
  const currentStep = me ? lifecycleIndex(me.statut as StatutEleve) : -1

  return (
    <>
      <ViewHeader
        title={`Bonjour ${prenom} 👋`}
        description="Résumé de votre parcours de conduite"
      />

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Séances effectuées */}
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Séances
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-foreground">
            {seancesFaites}{' '}
            <span className="text-base font-medium text-muted-foreground">
              / {seancesTotales}
            </span>
          </p>
          <p className="text-xs text-muted-foreground">Séances effectuées</p>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-1.5 text-right text-xs font-medium text-primary">{progress}%</p>
        </Card>

        {/* Prochaine séance */}
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
              <CalendarClock className="h-5 w-5" />
            </div>
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Prochaine
            </span>
          </div>
          {prochaine ? (
            <>
              <p className="mt-3 text-2xl font-bold text-foreground">
                {formatDateFr(prochaine.date)}
              </p>
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {prochaine.heureDebut} – {prochaine.heureFin}
              </p>
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-muted/60 px-2.5 py-1.5">
                <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="truncate text-xs font-medium text-foreground">
                  {prochaine.moniteur}
                </span>
              </div>
            </>
          ) : (
            <p className="mt-6 text-sm text-muted-foreground">
              Aucune séance planifiée
            </p>
          )}
        </Card>

        {/* Solde restant */}
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10 text-warning">
              <Wallet className="h-5 w-5" />
            </div>
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Solde
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-foreground">
            {formatXOF(me?.solde ?? 0)}
          </p>
          <p className="text-xs text-muted-foreground">Reste à payer</p>
          <div className="mt-3">
            {me && me.solde > 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-warning/10 px-2.5 py-1 text-xs font-semibold text-warning">
                <span className="h-1.5 w-1.5 rounded-full bg-warning" />
                Paiement en attente
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                Soldé
              </span>
            )}
          </div>
        </Card>
      </div>

      {/* Mes prochaines séances + Mon parcours */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Upcoming sessions */}
        <Card className="lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground">Mes prochaines séances</h2>
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
              {upcoming.length} à venir
            </span>
          </div>

          {upcoming.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <CalendarClock className="h-10 w-10 text-muted-foreground/50" />
              <p className="mt-3 text-sm font-medium text-foreground">
                Aucune séance planifiée
              </p>
              <p className="text-xs text-muted-foreground">
                Vos prochaines séances apparaîtront ici.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {upcoming.map((s) => (
                <li
                  key={s.id}
                  className="flex items-start gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/40"
                >
                  <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <span className="text-[10px] font-semibold uppercase">
                      {jours[new Date(s.date + 'T00:00:00').getDay()]}
                    </span>
                    <span className="text-base font-bold leading-none">
                      {String(new Date(s.date + 'T00:00:00').getDate()).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">
                      {s.heureDebut} – {s.heureFin}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <UserIcon className="h-3 w-3" />
                      {s.moniteur}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Car className="h-3 w-3" />
                      <span className="truncate">{s.vehicule}</span>
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Planifié
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Lifecycle */}
        <Card className="lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground">Mon parcours</h2>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </div>

          {/* Horizontal stepper */}
          <div className="flex flex-col gap-1">
            {lifecycle.map((step, idx) => {
              const isDone = currentStep >= 0 && idx < currentStep
              const isActive = idx === currentStep
              const isPending = currentStep >= 0 && idx > currentStep
              return (
                <div key={step.label} className="flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors',
                        isDone && 'bg-primary text-primary-foreground',
                        isActive && 'bg-primary text-primary-foreground ring-4 ring-primary/20',
                        isPending && 'bg-muted text-muted-foreground',
                        currentStep < 0 && 'bg-muted text-muted-foreground'
                      )}
                    >
                      {isDone ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                    </div>
                    {idx < lifecycle.length - 1 && (
                      <div
                        className={cn(
                          'my-0.5 h-6 w-0.5',
                          isDone ? 'bg-primary' : 'bg-border'
                        )}
                      />
                    )}
                  </div>
                  <div className="flex-1 pb-2">
                    <p
                      className={cn(
                        'text-sm font-semibold',
                        isActive ? 'text-primary' : isDone ? 'text-foreground' : 'text-muted-foreground'
                      )}
                    >
                      {step.label}
                    </p>
                    {isActive && (
                      <p className="text-xs text-muted-foreground">Étape actuelle</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {me && (
            <div className="mt-4 rounded-lg bg-muted/60 p-3">
              <p className="text-xs text-muted-foreground">Type de permis</p>
              <p className="mt-0.5 text-sm font-bold text-foreground">
                Permis {me.typePermis}
              </p>
            </div>
          )}
        </Card>
      </div>
    </>
  )
}
