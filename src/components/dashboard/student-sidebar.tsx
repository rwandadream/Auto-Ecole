'use client'

import { useState } from 'react'
import {
  GraduationCap,
  LayoutGrid,
  CalendarDays,
  Receipt,
  User,
  LogOut,
  ChevronLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useNavStore, type ViewKey } from '@/store/nav-store'
import { LogoutDialog } from '@/components/dashboard/logout-dialog'

type NavItem = {
  label: string
  view: ViewKey
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { label: 'Accueil', view: 'student-dashboard', icon: LayoutGrid },
  { label: 'Mon Planning', view: 'student-planning', icon: CalendarDays },
  { label: 'Mes Factures', view: 'student-factures', icon: Receipt },
  { label: 'Mon Profil', view: 'student-profil', icon: User },
]

export function StudentSidebar() {
  const activeView = useNavStore((s) => s.activeView)
  const setActiveView = useNavStore((s) => s.setActiveView)
  const collapsed = useNavStore((s) => s.collapsed)
  const toggleCollapsed = useNavStore((s) => s.toggleCollapsed)
  const [showLogout, setShowLogout] = useState(false)

  return (
    <aside
      className={cn(
        'flex h-screen flex-col border-r border-border bg-sidebar transition-[width] duration-300 ease-in-out',
        collapsed ? 'w-[78px]' : 'w-[240px]'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary shadow-sm">
          <GraduationCap className="h-5 w-5 text-primary-foreground" />
        </div>
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
        <button
          onClick={toggleCollapsed}
          className="ml-auto flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Réduire le menu"
        >
          <ChevronLeft
            className={cn(
              'h-4 w-4 transition-transform duration-300',
              collapsed && 'rotate-180'
            )}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="custom-scrollbar flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeView === item.view
            return (
              <li key={item.label}>
                <button
                  onClick={() => setActiveView(item.view)}
                  className={cn(
                    'group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    collapsed && 'justify-center px-2'
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

      {/* Déconnexion */}
      <div className="border-t border-border p-3">
        <button
          onClick={() => setShowLogout(true)}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-rose-500/10 hover:text-rose-600',
            collapsed && 'justify-center px-2'
          )}
          title={collapsed ? 'Déconnexion' : undefined}
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span className="flex-1 text-left">Déconnexion</span>}
        </button>
      </div>

      {/* Logout confirmation dialog */}
      <LogoutDialog open={showLogout} onOpenChange={setShowLogout} />
    </aside>
  )
}
