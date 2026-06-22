'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import type { Seance } from '@/store/data-store'

const HOURS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]
const WEEK_START = new Date()

function weekDays(start: Date): Date[] {
  const monday = new Date(start)
  const day = monday.getDay()
  const diff = day === 0 ? -6 : 1 - day
  monday.setDate(monday.getDate() + diff)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10)
}

function toMinutes(t: string) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

const jours = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

export function PlanningCalendar({
  seances,
  onSelect,
}: {
  seances: Seance[]
  onSelect: (s: Seance) => void
}) {
  const days = useMemo(() => weekDays(WEEK_START), [])
  const dayIsos = days.map(isoDate)

  const byDay = useMemo(() => {
    const map: Record<string, Seance[]> = {}
    dayIsos.forEach((d) => { map[d] = [] })
    seances.forEach((s) => {
      if (map[s.date]) map[s.date].push(s)
    })
    return map
  }, [seances, dayIsos])

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <div className="grid min-w-[800px] grid-cols-8 border-b border-border bg-muted/30">
        <div className="p-2 text-xs font-semibold text-muted-foreground">Heure</div>
        {days.map((d, i) => (
          <div key={isoDate(d)} className="border-l border-border p-2 text-center">
            <p className="text-xs font-semibold text-foreground">{jours[i]}</p>
            <p className="text-[10px] text-muted-foreground">
              {d.getDate()}/{d.getMonth() + 1}
            </p>
          </div>
        ))}
      </div>
      <div className="relative grid min-w-[800px] grid-cols-8">
        {HOURS.map((hour) => (
          <div key={hour} className="contents">
            <div className="border-b border-border px-2 py-6 text-xs text-muted-foreground">
              {String(hour).padStart(2, '0')}:00
            </div>
            {dayIsos.map((dateIso) => (
              <div key={`${dateIso}-${hour}`} className="relative min-h-[48px] border-b border-l border-border" />
            ))}
          </div>
        ))}
        {dayIsos.map((dateIso, colIndex) =>
          (byDay[dateIso] ?? []).map((s) => {
            const startMin = toMinutes(s.heureDebut) - 7 * 60
            const endMin = toMinutes(s.heureFin) - 7 * 60
            const top = (startMin / 60) * 48
            const height = Math.max(24, ((endMin - startMin) / 60) * 48)
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onSelect(s)}
                style={{
                  top: `${top}px`,
                  height: `${height}px`,
                  left: `calc(${(colIndex + 1) * 12.5}% + 2px)`,
                  width: 'calc(12.5% - 4px)',
                }}
                className={cn(
                  'absolute z-10 overflow-hidden rounded-md border border-primary/20 bg-primary/10 p-1 text-left text-[10px] hover:bg-primary/20',
                )}
              >
                <p className="truncate font-semibold text-foreground">{s.eleve.split(' ')[0]}</p>
                <p className="truncate text-muted-foreground">{s.heureDebut}-{s.heureFin}</p>
                <p className="truncate text-[9px] text-primary">{s.statut}</p>
              </button>
            )
          }),
        )}
      </div>
    </div>
  )
}
