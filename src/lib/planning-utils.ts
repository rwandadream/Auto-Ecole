import type { Seance } from '@/store/data-store'

export type ConflictCheck = {
  date: string
  heureDebut: string
  heureFin: string
  moniteurId?: string
  vehiculeId?: string
  excludeSeanceId?: string
}

function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function timesOverlap(debutA: string, finA: string, debutB: string, finB: string): boolean {
  const aStart = toMinutes(debutA)
  const aEnd = toMinutes(finA)
  const bStart = toMinutes(debutB)
  const bEnd = toMinutes(finB)
  return aStart < bEnd && bStart < aEnd
}

const ACTIVE_STATUTS: Seance['statut'][] = ['Planifié', 'Effectué']

export function hasConflict(seances: Seance[], check: ConflictCheck): boolean {
  return seances.some((s) => {
    if (check.excludeSeanceId && s.id === check.excludeSeanceId) return false
    if (s.date !== check.date) return false
    if (!ACTIVE_STATUTS.includes(s.statut)) return false
    if (!timesOverlap(check.heureDebut, check.heureFin, s.heureDebut, s.heureFin)) return false

    const moniteurConflict =
      check.moniteurId && s.moniteurId && check.moniteurId === s.moniteurId
    const vehiculeConflict =
      check.vehiculeId && s.vehiculeId && check.vehiculeId === s.vehiculeId

    return Boolean(moniteurConflict || vehiculeConflict)
  })
}

export function getConflictMessage(seances: Seance[], check: ConflictCheck): string | null {
  const conflict = seances.find((s) => {
    if (check.excludeSeanceId && s.id === check.excludeSeanceId) return false
    if (s.date !== check.date) return false
    if (!ACTIVE_STATUTS.includes(s.statut)) return false
    if (!timesOverlap(check.heureDebut, check.heureFin, s.heureDebut, s.heureFin)) return false
    const moniteurConflict =
      check.moniteurId && s.moniteurId && check.moniteurId === s.moniteurId
    const vehiculeConflict =
      check.vehiculeId && s.vehiculeId && check.vehiculeId === s.vehiculeId
    return Boolean(moniteurConflict || vehiculeConflict)
  })
  if (!conflict) return null
  if (check.moniteurId && conflict.moniteurId === check.moniteurId) {
    return `Le moniteur ${conflict.moniteur} est déjà occupé sur ce créneau.`
  }
  if (check.vehiculeId && conflict.vehiculeId === check.vehiculeId) {
    return `Le véhicule ${conflict.vehicule} est déjà réservé sur ce créneau.`
  }
  return 'Conflit de planning sur ce créneau.'
}

export function isMoniteurAvailable(
  seances: Seance[],
  moniteurId: string,
  check: Omit<ConflictCheck, 'moniteurId' | 'vehiculeId'>,
): boolean {
  return !hasConflict(seances, { ...check, moniteurId })
}

export function isVehiculeAvailable(
  seances: Seance[],
  vehiculeId: string,
  check: Omit<ConflictCheck, 'moniteurId' | 'vehiculeId'>,
): boolean {
  return !hasConflict(seances, { ...check, vehiculeId })
}
