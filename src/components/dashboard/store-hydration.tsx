'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/auth-store'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { syncDataForEleve } from '@/lib/supabase/sync-data'
import { DATA_STORE_KEY } from '@/store/persist-config'

export function StoreHydration({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)
  const [fatalError, setFatalError] = useState<string | null>(null)

  useEffect(() => {
    void (async () => {
      try {
        if (!isSupabaseConfigured()) {
          setFatalError(
            'Supabase non configuré : vérifiez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.',
          )
          return
        }

        localStorage.removeItem(DATA_STORE_KEY)
        await useAuthStore.persist.rehydrate()

        const restoredAdmin = await useAuthStore.getState().restoreSupabaseSession()
        const { user, isAuthenticated } = useAuthStore.getState()

        if (!restoredAdmin && isAuthenticated && user?.mode === 'eleve') {
          const synced = await syncDataForEleve(user.code, user.telephone)
          if (!synced) {
            useAuthStore.setState({ isAuthenticated: false, user: null })
          }
        } else if (!restoredAdmin && isAuthenticated && user?.mode === 'admin') {
          useAuthStore.setState({ isAuthenticated: false, user: null })
        }
      } catch (err) {
        setFatalError(
          err instanceof Error ? err.message : 'Erreur lors de l’initialisation de l’application.',
        )
      } finally {
        setReady(true)
      }
    })()
  }, [])

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Chargement SARAH AUTO…</p>
      </div>
    )
  }

  if (fatalError) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-background p-6 text-center">
        <p className="text-sm font-semibold text-destructive">Configuration requise</p>
        <p className="max-w-md text-sm text-muted-foreground">{fatalError}</p>
      </div>
    )
  }

  return <>{children}</>
}
