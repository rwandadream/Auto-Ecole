'use client'

import { useEffect, useRef } from 'react'

/** Préremplit le formulaire à chaque ouverture du dialog (open → true). */
export function useDialogReset(open: boolean, onOpen: () => void) {
  const onOpenRef = useRef(onOpen)
  onOpenRef.current = onOpen

  useEffect(() => {
    if (open) onOpenRef.current()
  }, [open])
}
