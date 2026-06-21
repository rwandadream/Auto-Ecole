'use client'

import { Bell, HelpCircle } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuthStore } from '@/store/auth-store'
import { initials } from '@/components/dashboard/views/shared'

// Statut badge tones for the student lifecycle
const statutTone: Record<string, string> = {
  Prospect: 'bg-slate-500/10 text-slate-600',
  Inscrit: 'bg-sky-500/10 text-sky-600',
  'En formation': 'bg-primary/10 text-primary',
  Examen: 'bg-amber-500/10 text-amber-600',
  Admis: 'bg-emerald-500/10 text-emerald-600',
  Ajourné: 'bg-rose-500/10 text-rose-600',
  Terminé: 'bg-emerald-500/10 text-emerald-600',
  Abandon: 'bg-slate-500/10 text-slate-600',
}

export function StudentHeader() {
  const user = useAuthStore((s) => s.user)

  if (!user || user.mode !== 'eleve') return null

  const prenom = user.nomComplet.split(' ')[0]
  const toneClass = statutTone[user.statut] ?? 'bg-muted text-muted-foreground'

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-card px-4 sm:px-6">
      {/* Greeting */}
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-foreground sm:text-base">
          Bonjour, {prenom}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Statut</span>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${toneClass}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
            {user.statut}
          </span>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-1">
        {/* Notifications */}
        <button
          className="relative flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary ring-2 ring-card" />
        </button>
        {/* Help */}
        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Aide"
        >
          <HelpCircle className="h-5 w-5" />
        </button>

        <div className="mx-1 h-6 w-px bg-border sm:mx-2" />

        {/* Profile */}
        <div className="flex items-center gap-2.5 rounded-lg p-1 pr-2">
          <Avatar className="h-8 w-8 border border-border">
            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
              {initials(user.nomComplet)}
            </AvatarFallback>
          </Avatar>
          <div className="hidden text-left sm:block">
            <p className="truncate text-sm font-semibold leading-tight text-foreground">
              {user.nomComplet}
            </p>
            <p className="font-mono text-xs leading-tight text-muted-foreground">
              {user.code}
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
