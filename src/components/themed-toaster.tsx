'use client'

import { useSyncExternalStore } from 'react'
import { Toaster as SonnerToaster } from 'sonner'
import { useTheme } from 'next-themes'

function subscribe() {
  return () => {}
}

function useIsClient() {
  return useSyncExternalStore(subscribe, () => true, () => false)
}

export function ThemedToaster() {
  const { resolvedTheme } = useTheme()
  const mounted = useIsClient()

  const theme = !mounted ? 'light' : resolvedTheme === 'dark' ? 'dark' : 'light'

  return <SonnerToaster theme={theme} position="top-right" richColors closeButton />
}
