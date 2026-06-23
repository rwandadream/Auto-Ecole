import type { Role } from '@/lib/domain/types'
import { mapRoleFromDb } from '@/lib/supabase/roles'

export type BadgeTone =
  | 'primary'
  | 'success'
  | 'warning'
  | 'destructive'
  | 'secondary'
  | 'neutral'

export type BadgeStyle = { badge: string; dot: string }

export const BADGE_STYLES: Record<BadgeTone, BadgeStyle> = {
  primary: { badge: 'bg-primary/10 text-primary', dot: 'bg-primary' },
  success: { badge: 'bg-success/10 text-success', dot: 'bg-success' },
  warning: { badge: 'bg-warning/10 text-warning', dot: 'bg-warning' },
  destructive: { badge: 'bg-destructive/10 text-destructive', dot: 'bg-destructive' },
  secondary: { badge: 'bg-secondary text-secondary-foreground', dot: 'bg-secondary-foreground' },
  neutral: { badge: 'bg-muted text-muted-foreground', dot: 'bg-muted-foreground' },
}

export const ROLE_BADGE_TONE: Record<Role, BadgeTone> = {
  'Super Administrateur': 'primary',
  Directeur: 'primary',
  'Responsable adjoint': 'primary',
  Comptable: 'secondary',
  Moniteur: 'warning',
  Secrétaire: 'neutral',
}

/** @deprecated Use ROLE_BADGE_TONE — kept for backward compatibility */
export const roleTone = ROLE_BADGE_TONE

export function resolveBadgeTone(tone?: string | null): BadgeTone {
  switch (tone) {
    case 'primary':
    case 'success':
    case 'warning':
    case 'destructive':
    case 'secondary':
    case 'neutral':
      return tone
    case 'muted':
    default:
      return 'neutral'
  }
}

export function getBadgeStyle(tone?: string | null): BadgeStyle {
  const resolved = resolveBadgeTone(tone)
  return BADGE_STYLES[resolved] ?? BADGE_STYLES.neutral
}

export function getRoleBadgeTone(role: string | null | undefined): BadgeTone {
  const mapped = mapRoleFromDb(role)
  return ROLE_BADGE_TONE[mapped] ?? 'neutral'
}

export function lookupTone<T extends string>(
  map: Record<T, BadgeTone>,
  key: string,
): BadgeTone {
  return (map as Record<string, BadgeTone>)[key] ?? 'neutral'
}
