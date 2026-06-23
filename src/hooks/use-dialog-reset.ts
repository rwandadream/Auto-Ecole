'use client'

import { useEffect, useLayoutEffect, useRef } from 'react'

/** Préremplit le formulaire à chaque ouverture du dialog (open → true). */
export function useDialogReset(open: boolean, onOpen: () => void) {
  const onOpenRef = useRef(onOpen)
  // Mettre à jour la ref dans un layout effect, jamais pendant le rendu
  useLayoutEffect(() => {
    onOpenRef.current = onOpen
  })

  useEffect(() => {
    if (open) onOpenRef.current()
  }, [open])
}
