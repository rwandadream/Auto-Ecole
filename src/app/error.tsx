'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6 text-center">
      <p className="text-sm font-medium text-destructive">Erreur de chargement</p>
      <p className="max-w-md text-sm text-muted-foreground">
        {error.message || 'Une erreur inattendue est survenue.'}
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
      >
        Réessayer
      </button>
    </div>
  )
}
