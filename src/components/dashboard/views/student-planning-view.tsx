'use client'

import { useState } from 'react'
import {
  CalendarX,
  Clock,
  Car,
  User as UserIcon,
  FileText,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth-store'
import { seances, type StatutSeance } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import {
  ViewHeader,
  Card,
  StatusBadge,
} from './shared'

// Date helpers (consistent with planning-view)
const joursLong = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
const jours = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
const mois = [
  'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
  'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc',
]

function formatDayName(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso
  return joursLong[new Date(iso + 'T00:00:00').getDay()]
}

function formatDateFr(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso
  const d = new Date(iso + 'T00:00:00')
  const j = jours[d.getDay()]
  const jour = String(d.getDate()).padStart(2, '0')
  const m = mois[d.getMonth()]
  const y = d.getFullYear()
  return `${j} ${jour} ${m} ${y}`
}

function statutTone(statut: StatutSeance): 'primary' | 'emerald' | 'amber' | 'rose' {
  switch (statut) {
    case 'Planifié':
      return 'primary'
    case 'Effectué':
      return 'emerald'
    case 'Absent élève':
      return 'amber'
    case 'Annulé':
      return 'rose'
  }
}

function dureeLabel(min: number): string {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, '0')}`
}

type Filtre = 'avenir' | 'passees' | 'toutes'

const filtres: { key: Filtre; label: string }[] = [
  { key: 'avenir', label: 'À venir' },
  { key: 'passees', label: 'Passées' },
  { key: 'toutes', label: 'Toutes' },
]

// Fixed "today" reference aligned with mock data timeline
const TODAY = '2026-12-02'

export function StudentPlanningView() {
  const user = useAuthStore((s) => s.user)
  const [filtre, setFiltre] = useState<Filtre>('avenir')

  if (!user || user.mode !== 'eleve') return null

  // All séances of the student
  const mySeances = seances
    .filter((s) => s.eleveCode === user.code)
    .sort((a, b) =>
      a.date === b.date
        ? a.heureDebut.localeCompare(b.heureDebut)
        : a.date.localeCompare(b.date)
    )

  // Filtered
  const filtered = mySeances.filter((s) => {
    if (filtre === 'toutes') return true
    if (filtre === 'avenir') return s.date >= TODAY && s.statut === 'Planifié'
    // passees
    return s.date < TODAY || s.statut !== 'Planifié'
  })

  // Group by date
  const grouped = filtered.reduce<Record<string, typeof filtered>>((acc, s) => {
    if (!acc[s.date]) acc[s.date] = []
    acc[s.date].push(s)
    return acc
  }, {})
  const dates = Object.keys(grouped).sort((a, b) =>
    filtre === 'passees' ? b.localeCompare(a) : a.localeCompare(b)
  )

  return (
    <>
      <ViewHeader
        title="Mon Planning"
        description="Vos séances de conduite passées et à venir"
      />

      {/* Filter toggle */}
      <div className="mb-5 flex items-center gap-1 rounded-lg bg-muted p-1 sm:w-fit">
        {filtres.map((f) => (
          <button
            key={f.key}
            onClick={() => setFiltre(f.key)}
            className={cn(
              'h-8 flex-1 rounded-md px-4 text-sm font-medium transition-colors sm:flex-none',
              filtre === f.key
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {f.label}
            <span className="ml-1.5 text-xs">
              ({f.key === 'avenir'
                ? mySeances.filter((s) => s.date >= TODAY && s.statut === 'Planifié').length
                : f.key === 'passees'
                ? mySeances.filter((s) => s.date < TODAY || s.statut !== 'Planifié').length
                : mySeances.length})
            </span>
          </button>
        ))}
      </div>

      {/* Timeline / empty state */}
      {filtered.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <CalendarX className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="mt-4 text-base font-semibold text-foreground">
              Aucune séance planifiée
            </p>
            <p className="mt-1 max-w-xs text-sm text-muted-foreground">
              Vous n&apos;avez pas de séance dans cette catégorie pour le moment.
              Contactez votre auto-école pour planifier votre prochain cours.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-5">
          {dates.map((date) => (
            <div key={date}>
              {/* Date section header */}
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <span className="text-[9px] font-semibold uppercase">
                    {jours[new Date(date + 'T00:00:00').getDay()]}
                  </span>
                  <span className="text-sm font-bold leading-none">
                    {String(new Date(date + 'T00:00:00').getDate()).padStart(2, '0')}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{formatDayName(date)}</p>
                  <p className="text-xs text-muted-foreground">{formatDateFr(date)}</p>
                </div>
              </div>

              {/* Séances of that day */}
              <div className="space-y-3 pl-1">
                {grouped[date].map((s) => (
                  <Card key={s.id} className="p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      {/* Left: time + moniteur + vehicule */}
                      <div className="flex items-start gap-3">
                        <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-muted/40 px-3 py-2 text-center">
                          <span className="text-sm font-bold text-foreground">
                            {s.heureDebut}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {s.heureFin}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                              <Clock className="h-3 w-3" />
                              {dureeLabel(s.duree)}
                            </span>
                            <StatusBadge label={s.statut} tone={statutTone(s.statut)} />
                          </div>
                          <div className="mt-2 flex flex-col gap-1">
                            <p className="flex items-center gap-1.5 text-sm text-foreground">
                              <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="font-medium">{s.moniteur}</span>
                            </p>
                            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Car className="h-3.5 w-3.5" />
                              {s.vehicule}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    {s.notes && (
                      <div className="mt-3 flex items-start gap-2 rounded-lg bg-muted/40 p-2.5">
                        <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">Note du moniteur : </span>
                          {s.notes}
                        </p>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
