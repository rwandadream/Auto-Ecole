'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { syncDataFromSupabase } from '@/lib/supabase/sync-data'
import { useAuthStore } from '@/store/auth-store'

const DEBOUNCE_MS = 2000

/** Re-synchronise les données admin quand séances/factures/paiements changent en base. */
export function useSupabaseRealtime() {
  const user = useAuthStore((s) => s.user)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (user?.mode !== 'admin') return

    const supabase = createClient()

    const scheduleSync = () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        void syncDataFromSupabase()
      }, DEBOUNCE_MS)
    }

    const channel = supabase
      .channel('sarah-auto-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'seances' }, scheduleSync)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'factures' }, scheduleSync)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'paiements' }, scheduleSync)
      .subscribe()

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      void supabase.removeChannel(channel)
    }
  }, [user?.mode])
}
