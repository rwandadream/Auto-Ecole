export function getSupabaseErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message: unknown }).message
    if (typeof message === 'string' && message.trim()) return message
  }
  return 'Erreur Supabase'
}

export function assertNoSupabaseError(error: { message: string } | null): void {
  if (error) throw new Error(error.message)
}
