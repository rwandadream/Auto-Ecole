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
  ScanLine,
  UserCog,
  Shield,
  Gift,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useNavStore, type ViewKey } from '@/store/nav-store'
import { useAuthStore } from '@/store/auth-store'
import { useDataStore } from '@/store/data-store'
import { BrandLogo } from '@/components/dashboard/brand-logo'

export type AdminNavItem = {
  label: string
  view?: ViewKey
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  roles?: string[]
  isLogout?: boolean
}

export type AdminNavSection = {
  title: string
  items: AdminNavItem[]
}

function normalizeRole(role: string): string {
  if (role === 'Administrateur') return 'Administrateur principal'
  return role
}

export const adminNavSections: AdminNavSection[] = [
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
      { label: 'Parrainage', view: 'parrainage', icon: Gift, roles: ['Administrateur principal', 'Administrateur secondaire'] },
    ],
  },
  {
    title: 'Général',
    items: [
      { label: 'Paramètres', view: 'parametres', icon: Settings, roles: ['Administrateur principal', 'Administrateur secondaire', 'Comptable', 'Moniteur', 'Conseiller'] },
      { label: 'Déconnexion', icon: LogOut, isLogout: true },
    ],
  },
]

type SidebarNavProps = {
  collapsed?: boolean
  onLogout: () => void
  showHeader?: boolean
  headerSubtitle?: string
}

export function SidebarNav({
  collapsed = false,
  onLogout,
  showHeader = true,
  headerSubtitle = 'ERP Auto-École',
}: SidebarNavProps) {
  const activeView = useNavStore((s) => s.activeView)
  const setActiveView = useNavStore((s) => s.setActiveView)
  const user = useAuthStore((s) => s.user)

  const elevesCount = useDataStore((s) => s.eleves.length)
  const seancesPlanifiees = useDataStore(
    (s) => s.seances.filter((se) => se.statut === 'Planifié').length,
  )

  const dynamicBadges: Partial<Record<ViewKey, string>> = {
    eleves: String(elevesCount),
    planning: String(seancesPlanifiees),
  }

  const currentRole = user?.mode === 'admin' ? normalizeRole(user.role) : null

  const visibleSections = adminNavSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (!item.roles) return true
        if (!currentRole) return false
        return item.roles.includes(currentRole)
      }),
    }))
    .filter((section) => section.items.length > 0)

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
                {headerSubtitle}
              </span>
            </div>
          )}
        </div>
      )}

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
                      type="button"
                      onClick={() => {
                        if (item.isLogout) {
                          onLogout()
                        } else if (item.view) {
                          setActiveView(item.view)
                        }
                      }}
                      className={cn(
                        'group flex w-full min-h-[44px] items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                        item.isLogout
                          ? 'text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
                          : isActive
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                        collapsed && 'justify-center px-2',
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
                              : 'bg-primary/10 text-primary',
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
    </div>
  )
}
