// Raw Supabase/PostgreSQL patterns that reveal schema internals — map them to
// user-friendly messages before showing in toasts or error UI.
const DB_ERROR_MAP: [RegExp, string][] = [
  [/duplicate key value violates unique constraint/i, 'Cette entrée existe déjà.'],
  [/violates foreign key constraint/i, 'Impossible : des données liées existent encore.'],
  [/violates not-null constraint/i, 'Un champ obligatoire est manquant.'],
  [/violates check constraint/i, 'Les données ne respectent pas les règles métier.'],
  [/permission denied/i, 'Accès refusé. Vérifiez vos droits.'],
  [/jwt expired/i, 'Votre session a expiré. Reconnectez-vous.'],
  [/invalid token/i, 'Session invalide. Reconnectez-vous.'],
  [/row-level security/i, 'Accès refusé par la politique de sécurité.'],
  [/connection refused/i, 'Impossible de joindre la base de données.'],
  [/timeout/i, 'La requête a pris trop de temps. Réessayez.'],
]

function sanitizeDbMessage(raw: string): string {
  for (const [pattern, friendly] of DB_ERROR_MAP) {
    if (pattern.test(raw)) return friendly
  }
  // Truncate very long error strings (stack traces, etc.) — don't leak them
  if (raw.length > 120) return 'Une erreur est survenue. Réessayez ou contactez l\'assistance.'
  return raw
}

export function getSupabaseErrorMessage(error: unknown): string {
  if (error instanceof Error) return sanitizeDbMessage(error.message)
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message: unknown }).message
    if (typeof message === 'string' && message.trim()) return sanitizeDbMessage(message)
  }
  return 'Erreur Supabase'
}

export function assertNoSupabaseError(error: { message: string } | null): void {
  if (error) throw new Error(error.message)
}
