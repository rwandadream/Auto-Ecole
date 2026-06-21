'use client'

import { useState, useMemo } from 'react'
import { Search, Bell, HelpCircle, ChevronDown, Calendar, LogOut, User, Settings } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useAuthStore } from '@/store/auth-store'
import { useNavStore } from '@/store/nav-store'
import { useDataStore } from '@/store/data-store'
import { initials } from '@/components/dashboard/views/shared'
import { LogoutDialog } from '@/components/dashboard/logout-dialog'

function formatDateRange() {
  return '01 juin 2026 - 21 juin 2026'
}

export function Header() {
  const user = useAuthStore((s) => s.user)
  const setActiveView = useNavStore((s) => s.setActiveView)
  const [showLogout, setShowLogout] = useState(false)

  // Recent audit entries for the notifications popover
  const auditLog = useDataStore((s) => s.auditLog)
  const recentAudit = useMemo(() => auditLog.slice(0, 8), [auditLog])
  const unreadCount = useMemo(
    () => auditLog.filter((a) => a.action === 'INSERT').length,
    [auditLog]
  )

  const userName = user?.mode === 'admin' ? user.name : 'Utilisateur'
  const userRole = user?.mode === 'admin' ? user.role : '—'
  const userInitials = initials(userName || 'U')
  const dateRange = formatDateRange()

  const actionColors: Record<string, string> = {
    INSERT: 'bg-emerald-500',
    UPDATE: 'bg-amber-500',
    DELETE: 'bg-rose-500',
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-card px-6">
      {/* Search (decorative — filters not wired to a global search index) */}
      <div className="relative max-w-md flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Rechercher un élève, une facture..."
          className="h-10 w-full rounded-lg border border-input bg-background pl-10 pr-9 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring transition-colors"
        />
        <kbd className="absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:flex">
          ⌘K
        </kbd>
      </div>

      {/* Dynamic Date Range */}
      <div className="hidden h-10 items-center gap-2 rounded-lg border border-input bg-background px-3 text-sm font-medium text-foreground md:flex">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">{dateRange}</span>
      </div>

      <div className="ml-auto flex items-center gap-1">
        {/* Notifications popover */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="relative flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary ring-2 ring-card" />
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="border-b border-border p-3">
              <p className="text-sm font-semibold text-foreground">Notifications</p>
              <p className="text-xs text-muted-foreground">
                {recentAudit.length} activité{recentAudit.length > 1 ? 's' : ''} récente{recentAudit.length > 1 ? 's' : ''}
              </p>
            </div>
            <div className="custom-scrollbar max-h-80 overflow-y-auto">
              {recentAudit.length === 0 ? (
                <p className="p-6 text-center text-sm text-muted-foreground">
                  Aucune activité récente
                </p>
              ) : (
                recentAudit.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-start gap-3 border-b border-border/60 px-3 py-2.5 last:border-0 hover:bg-muted/40"
                  >
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${actionColors[entry.action] || 'bg-slate-400'}`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {entry.description}
                      </p>
                      <p className="text-xs text-muted-foreground">{entry.timestamp}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <button
              onClick={() => setActiveView('audit')}
              className="w-full border-t border-border p-3 text-center text-sm font-medium text-primary transition-colors hover:bg-primary/5"
            >
              Voir tout le journal d&apos;audit
            </button>
          </PopoverContent>
        </Popover>

        {/* Help → Assistance */}
        <button
          onClick={() => setActiveView('assistance')}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Aide"
        >
          <HelpCircle className="h-5 w-5" />
        </button>

        <div className="mx-2 h-6 w-px bg-border" />

        {/* Profile dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 rounded-lg p-1 pr-2 transition-colors hover:bg-muted">
              <Avatar className="h-8 w-8 border border-border">
                <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-semibold leading-tight text-foreground">{userName}</p>
                <p className="text-xs leading-tight text-muted-foreground">{userRole}</p>
              </div>
              <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">{userName}</span>
                <span className="text-xs font-normal text-muted-foreground">{userRole}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => setActiveView('parametres')}>
              <User className="mr-2 h-4 w-4" />
              Mon profil
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setActiveView('parametres')}>
              <Settings className="mr-2 h-4 w-4" />
              Paramètres
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => setShowLogout(true)}
              className="text-rose-600 focus:text-rose-700 focus:bg-rose-500/10"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Logout confirmation dialog */}
      <LogoutDialog open={showLogout} onOpenChange={setShowLogout} />
    </header>
  )
}
