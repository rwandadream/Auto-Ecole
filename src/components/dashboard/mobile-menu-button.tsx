'use client'

import { Menu } from 'lucide-react'
import { useNavStore } from '@/store/nav-store'

export function MobileMenuButton() {
  const setMobileNavOpen = useNavStore((s) => s.setMobileNavOpen)

  return (
    <button
      type="button"
      onClick={() => setMobileNavOpen(true)}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
      aria-label="Ouvrir le menu"
    >
      <Menu className="h-5 w-5" />
    </button>
  )
}
