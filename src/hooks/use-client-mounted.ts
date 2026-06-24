'use client'

import { useSyncExternalStore } from 'react'

const subscribe = () => () => {}

/** Évite les boucles de rendu Recharts / mesure DOM avant hydratation client. */
export function useClientMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  )
}
