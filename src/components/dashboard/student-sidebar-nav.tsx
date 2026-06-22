'use client'

import {
  LayoutGrid,
  CalendarDays,
  Receipt,
  User,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useNavStore, type ViewKey } from '@/store/nav-store'
import { BrandLogo } from '@/components/dashboard/brand-logo'

export type StudentNavItem = {
  label: string
  view: ViewKey
  icon: React.ComponentType<{ className?: string }>
}

export const studentNavItems: StudentNavItem[] = [
  { label: 'Accueil', view: 'student-dashboard', icon: LayoutGrid },
  { label: 'Mon Planning', view: 'student-planning', icon: CalendarDays },
  { label: 'Mes Factures', view: 'student-factures', icon: Receipt },
  { label: 'Mon Profil', view: 'student-profil', icon: User },
]

type StudentSidebarNavProps = {
  collapsed?: boolean
  onLogout: () => void
  showHeader?: boolean
}

export function StudentSidebarNav({
  collapsed = false,
  onLogout,
  showHeader = true,
}: StudentSidebarNavProps) {
  const activeView = useNavStore((s) => s.activeView)
  const setActiveView = useNavStore((s) => s.setActiveView)

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {showHeader && (
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-border px-5">
          <BrandLogo />
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-base font-bold tracking-tight text-foreground">
                SARAH AUTO
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Mon Espace
              </span>
            </div>
          )}
        </div>
      )}

      <nav className="custom-scrollbar flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {studentNavItems.map((item) => {
            const Icon = item.icon
            const isActive = activeView === item.view
            return (
              <li key={item.label}>
                <button
                  type="button"
                  onClick={() => setActiveView(item.view)}
                  className={cn(
                    'group flex w-full min-h-[44px] items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    collapsed && 'justify-center px-2',
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  {!collapsed && <span className="flex-1 text-left">{item.label}</span>}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="shrink-0 border-t border-border p-3">
        <button
          type="button"
          onClick={onLogout}
          className={cn(
            'flex w-full min-h-[44px] items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive',
            collapsed && 'justify-center px-2',
          )}
          title={collapsed ? 'Déconnexion' : undefined}
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span className="flex-1 text-left">Déconnexion</span>}
        </button>
      </div>
    </div>
  )
}
