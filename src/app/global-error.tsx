'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="fr">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 bg-neutral-950 p-6 text-center text-white">
        <p className="text-sm font-medium">SARAH AUTO — erreur critique</p>
        <p className="max-w-md text-sm text-neutral-400">
          {error.message || 'Impossible de charger l’application.'}
        </p>
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Recharger
        </button>
      </body>
    </html>
  )
}
