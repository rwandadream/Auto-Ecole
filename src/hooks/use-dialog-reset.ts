'use client'

import { useEffect, useRef } from 'react'

/** Préremplit le formulaire à chaque ouverture du dialog (open → true). */
export function useDialogReset(open: boolean, onOpen: () => void) {
  const onOpenRef = useRef(onOpen)
  const wasOpenRef = useRef(false)

  useEffect(() => {
    onOpenRef.current = onOpen
  })

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      onOpenRef.current()
    }
    wasOpenRef.current = open
  }, [open])
}
