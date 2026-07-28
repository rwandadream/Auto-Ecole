'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const message =
    (error && typeof error.message === 'string' && error.message.trim()) ||
    (error?.digest ? `Erreur technique (${error.digest})` : null) ||
    'Impossible de charger l’application.'

  return (
    <html lang="fr">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 bg-neutral-950 p-6 text-center text-white">
        <p className="text-sm font-medium">SARAH AUTO — erreur critique</p>
        <p className="max-w-md text-sm text-neutral-400">{message}</p>
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
