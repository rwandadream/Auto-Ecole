'use client'

import { useMemo, useState } from 'react'
import { Bell, HelpCircle } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useAuthStore } from '@/store/auth-store'
import { useDataStore } from '@/store/data-store'
import { formatXOFFcfa } from '@/lib/format'
import { initials, StatusBadge, statutEleveTone } from '@/components/dashboard/views/shared'
import { MobileMenuButton } from '@/components/dashboard/mobile-menu-button'

const TODAY = new Date().toISOString().slice(0, 10)

function addDays(iso: string, days: number): string {
  const d = new Date(iso + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

type StudentNotification = {
  id: string
  message: string
}

function buildStudentNotifications(params: {
  code: string
  statut: string
  seances: ReturnType<typeof useDataStore.getState>['seances']
  factures: ReturnType<typeof useDataStore.getState>['factures']
}): StudentNotification[] {
  const { code, statut, seances, factures } = params
  const items: StudentNotification[] = []
  const horizon = addDays(TODAY, 7)

  for (const s of seances) {
    if (
      s.eleveCode === code &&
      s.statut === 'Planifié' &&
      s.date >= TODAY &&
      s.date <= horizon
    ) {
      items.push({
        id: `seance-${s.id}`,
        message: `Séance le ${s.date} à ${s.heureDebut}`,
      })
    }
  }

  for (const f of factures) {
    if (f.eleveCode === code && f.reste > 0) {
      items.push({
        id: `facture-${f.id}`,
        message: `Facture ${f.numero} : ${formatXOFFcfa(f.reste)} restants`,
      })
    }
  }

  if (statut === 'Examen') {
    items.push({
      id: 'statut-examen',
      message: 'Votre dossier est en phase examen — consultez votre planning.',
    })
  }

  return items
}

export function StudentHeader() {
  const user = useAuthStore((s) => s.user)
  const seances = useDataStore((s) => s.seances)
  const factures = useDataStore((s) => s.factures)
  const [readIds, setReadIds] = useState<Set<string>>(new Set())
  const [notifOpen, setNotifOpen] = useState(false)

  const notifications = useMemo(() => {
    if (!user || user.mode !== 'eleve') return []
    return buildStudentNotifications({
      code: user.code,
      statut: user.statut,
      seances,
      factures,
    })
  }, [user, seances, factures])

  if (!user || user.mode !== 'eleve') return null

  const prenom = user.nomComplet.split(' ')[0]
  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length

  const handleNotifOpenChange = (open: boolean) => {
    setNotifOpen(open)
    if (open) {
      setReadIds(new Set(notifications.map((n) => n.id)))
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 min-w-0 items-center gap-2 border-b border-border bg-card px-4 sm:gap-4 sm:px-6">
      <MobileMenuButton />
      {/* Greeting */}
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-foreground sm:text-base">
          Bonjour, {prenom}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Statut</span>
          <StatusBadge
            label={user.statut}
            tone={statutEleveTone[user.statut as keyof typeof statutEleveTone] ?? 'neutral'}
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-1">
        {/* Notifications */}
        <Popover open={notifOpen} onOpenChange={handleNotifOpenChange}>
          <PopoverTrigger asChild>
            <button
              className="relative flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground ring-2 ring-card">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="border-b border-border px-4 py-3">
              <p className="text-sm font-semibold text-foreground">Notifications</p>
              <p className="text-xs text-muted-foreground">
                {notifications.length} alerte{notifications.length > 1 ? 's' : ''}
              </p>
            </div>
            <ul className="max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <li className="px-4 py-6 text-center text-sm text-muted-foreground">
                  Aucune notification pour le moment.
                </li>
              ) : (
                notifications.map((n) => (
                  <li
                    key={n.id}
                    className="border-b border-border px-4 py-3 text-sm text-foreground last:border-0"
                  >
                    {n.message}
                  </li>
                ))
              )}
            </ul>
          </PopoverContent>
        </Popover>

        {/* Help */}
        <a
          href="mailto:support@sarahauto.ci?subject=Assistance%20portail%20%C3%A9l%C3%A8ve"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Aide"
        >
          <HelpCircle className="h-5 w-5" />
        </a>

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
