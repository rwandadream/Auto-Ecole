'use client'

import {
  LayoutGrid,
  Users,
  Car,
  CalendarDays,
  ClipboardCheck,
  Receipt,
  Wallet,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ScanLine,
  UserCog,
  Shield,
  HelpCircle,
  ScrollText,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useNavStore, type ViewKey } from '@/store/nav-store'
import { useAuthStore } from '@/store/auth-store'
import { useDataStore } from '@/store/data-store'
import { LogoutDialog } from '@/components/dashboard/logout-dialog'
import { BrandLogo } from '@/components/dashboard/brand-logo'

type NavItem = {
  label: string
  view?: ViewKey
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  /** Roles allowed to see this item. If omitted, item is visible to everyone. */
  roles?: string[]
  /** If true, clicking opens the logout dialog instead of navigating */
  isLogout?: boolean
}

type NavSection = {
  title: string
  items: NavItem[]
}

// Helper: normalize role for matching (the auth-store may return 'Administrateur'
// for unknown emails — treat it as an admin)
function normalizeRole(role: string): string {
  if (role === 'Administrateur') return 'Administrateur principal'
  return role
}

const navSections: NavSection[] = [
  {
    title: 'Pilotage',
    items: [
      { label: 'Tableau de bord', view: 'dashboard', icon: LayoutGrid },
      { label: 'Élèves', view: 'eleves', icon: Users, roles: ['Administrateur principal', 'Administrateur secondaire', 'Moniteur', 'Conseiller'] },
      { label: 'Scanner CNI', view: 'scanner', icon: ScanLine, roles: ['Administrateur principal', 'Administrateur secondaire', 'Moniteur', 'Conseiller'] },
      { label: 'Moniteurs', view: 'moniteurs', icon: UserCog, roles: ['Administrateur principal', 'Administrateur secondaire', 'Moniteur'] },
      { label: 'Véhicules', view: 'vehicules', icon: Car, roles: ['Administrateur principal', 'Administrateur secondaire', 'Moniteur'] },
      { label: 'Inspecteurs', view: 'inspecteurs', icon: Shield, roles: ['Administrateur principal', 'Administrateur secondaire', 'Moniteur'] },
    ],
  },
  {
    title: 'Activité',
    items: [
      { label: 'Planning & Séances', view: 'planning', icon: CalendarDays, roles: ['Administrateur principal', 'Administrateur secondaire', 'Moniteur'] },
      { label: 'Examens & Sessions', view: 'examens', icon: ClipboardCheck, roles: ['Administrateur principal', 'Administrateur secondaire', 'Moniteur'] },
      { label: 'Facturation', view: 'facturation', icon: Receipt, roles: ['Administrateur principal', 'Administrateur secondaire', 'Comptable'] },
      { label: 'Comptabilité', view: 'comptabilite', icon: Wallet, roles: ['Administrateur principal', 'Administrateur secondaire', 'Comptable'] },
      { label: 'Bordereaux', view: 'bordereaux', icon: FileText, roles: ['Administrateur principal', 'Administrateur secondaire', 'Comptable', 'Moniteur'] },
    ],
  },
  {
    title: 'Général',
    items: [
      { label: 'Assistance', view: 'assistance', icon: HelpCircle, roles: ['Administrateur principal', 'Administrateur secondaire', 'Comptable', 'Moniteur', 'Conseiller'] },
      { label: "Journal d'audit", view: 'audit', icon: ScrollText, roles: ['Administrateur principal', 'Administrateur secondaire'] },
      { label: 'Paramètres', view: 'parametres', icon: Settings, roles: ['Administrateur principal', 'Administrateur secondaire'] },
      { label: 'Déconnexion', icon: LogOut, isLogout: true },
    ],
  },
]

export function Sidebar() {
  const { activeView, setActiveView, collapsed, toggleCollapsed } = useNavStore()
  const user = useAuthStore((s) => s.user)
  const [showLogout, setShowLogout] = useState(false)

  // Dynamic badges from the store
  const elevesCount = useDataStore((s) => s.eleves.length)
  const seancesPlanifiees = useDataStore(
    (s) => s.seances.filter((se) => se.statut === 'Planifié').length
  )

  // Build a lookup for dynamic badges
  const dynamicBadges: Partial<Record<ViewKey, string>> = {
    eleves: String(elevesCount),
    planning: String(seancesPlanifiees),
  }

  // Determine the current user's role (only for admin mode)
  const currentRole = user?.mode === 'admin' ? normalizeRole(user.role) : null

  // Filter sections based on role
  const visibleSections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (!item.roles) return true // visible to everyone
        if (!currentRole) return false // no role → no items with role restriction
        return item.roles.includes(currentRole)
      }),
    }))
    .filter((section) => section.items.length > 0)

  return (
    <aside
      className={cn(
        'flex h-screen flex-col border-r border-border bg-sidebar transition-[width] duration-300 ease-in-out',
        collapsed ? 'w-[78px]' : 'w-[260px]'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-5">
        <BrandLogo />
        {!collapsed && (
          <div className="flex flex-col leading-tight">
            <span className="text-base font-bold tracking-tight text-foreground">
              SARAH AUTO
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              ERP Auto-École
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
        {visibleSections.map((section) => (
          <div key={section.title} className="mb-6">
            {!collapsed && (
              <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {section.title}
              </h3>
            )}
            <ul className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon
                const isActive = activeView === item.view
                const badge = item.view ? dynamicBadges[item.view] : undefined
                return (
                  <li key={item.label} className="relative">
                    <button
                      onClick={() => {
                        if (item.isLogout) {
                          setShowLogout(true)
                        } else if (item.view) {
                          setActiveView(item.view)
                        }
                      }}
                      className={cn(
                        'group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                        item.isLogout
                          ? 'text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
                          : isActive
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                        collapsed && 'justify-center px-2'
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon className="h-[18px] w-[18px] shrink-0" />
                      {!collapsed && (
                        <span className="flex-1 text-left">{item.label}</span>
                      )}
                      {!collapsed && badge && (
                        <span
                          className={cn(
                            'flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold',
                            isActive
                              ? 'bg-primary-foreground/20 text-primary-foreground'
                              : 'bg-primary/10 text-primary'
                          )}
                        >
                          {badge}
                        </span>
                      )}
                      {collapsed && badge && (
                        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Logout confirmation dialog */}
      <LogoutDialog open={showLogout} onOpenChange={setShowLogout} />
    </aside>
  )
}
