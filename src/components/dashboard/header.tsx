'use client'

import { Search, X, LayoutGrid, Bell, HelpCircle, ChevronDown, Calendar } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-card px-6">
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search product"
          className="h-10 w-full rounded-lg border border-input bg-background pl-10 pr-9 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring transition-colors"
        />
        <kbd className="absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:flex">
          ⌘K
        </kbd>
      </div>

      {/* Date Range */}
      <button className="hidden md:flex h-10 items-center gap-2 rounded-lg border border-input bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">April 10, 2026 - May 11, 2026</span>
      </button>

      <div className="ml-auto flex items-center gap-1">
        {/* Action Icons */}
        <button className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" aria-label="Close">
          <X className="h-5 w-5" />
        </button>
        <button className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" aria-label="View options">
          <LayoutGrid className="h-5 w-5" />
        </button>
        <button className="relative flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary ring-2 ring-card" />
        </button>
        <button className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" aria-label="Help">
          <HelpCircle className="h-5 w-5" />
        </button>

        <div className="mx-2 h-6 w-px bg-border" />

        {/* Profile */}
        <button className="flex items-center gap-2.5 rounded-lg p-1 pr-2 transition-colors hover:bg-muted">
          <Avatar className="h-8 w-8 border border-border">
            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
              OS
            </AvatarFallback>
          </Avatar>
          <div className="hidden text-left sm:block">
            <p className="text-sm font-semibold leading-tight text-foreground">Oripio Studio</p>
            <p className="text-xs leading-tight text-muted-foreground">Admin</p>
          </div>
          <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
        </button>
      </div>
    </header>
  )
}
