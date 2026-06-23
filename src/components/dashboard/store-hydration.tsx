'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/auth-store'
import { assertSupabaseConfigured } from '@/lib/supabase/config'
import { syncDataForEleve } from '@/lib/supabase/sync-data'
import { DATA_STORE_KEY } from '@/store/persist-config'

export function StoreHydration({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    void (async () => {
      assertSupabaseConfigured()
      localStorage.removeItem(DATA_STORE_KEY)
      await useAuthStore.persist.rehydrate()

      const restoredAdmin = await useAuthStore.getState().restoreSupabaseSession()
      const { user, isAuthenticated } = useAuthStore.getState()

      if (!restoredAdmin && isAuthenticated && user?.mode === 'eleve') {
        // Re-validate the student session server-side. If the RPC fails (network
        // error, tampered localStorage, deactivated account) clear the session
        // rather than letting stale / forged credentials grant UI access.
        const synced = await syncDataForEleve(user.code, user.telephone)
        if (!synced) {
          useAuthStore.setState({ isAuthenticated: false, user: null })
        }
      } else if (!restoredAdmin && isAuthenticated && user?.mode === 'admin') {
        useAuthStore.setState({ isAuthenticated: false, user: null })
      }

      setReady(true)
    })()
  }, [])

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Chargement SARAH AUTO…</p>
      </div>
    )
  }

  return <>{children}</>
}
