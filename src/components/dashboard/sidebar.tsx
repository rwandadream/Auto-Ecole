'use client'

import { useState } from 'react'
import {
  LayoutGrid,
  Users,
  GraduationCap,
  Car,
  CalendarDays,
  ClipboardCheck,
  Receipt,
  Wallet,
  FileText,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ScanLine,
  UserCog,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type NavItem = {
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  active?: boolean
}

type NavSection = {
  title: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    title: 'Pilotage',
    items: [
      { label: 'Tableau de bord', icon: LayoutGrid, active: true },
      { label: 'Élèves', icon: Users, badge: '20' },
      { label: 'Scanner CNI', icon: ScanLine },
      { label: 'Moniteurs', icon: UserCog },
      { label: 'Véhicules', icon: Car },
    ],
  },
  {
    title: 'Activité',
    items: [
      { label: 'Planning & Séances', icon: CalendarDays, badge: '2' },
      { label: 'Examens & Sessions', icon: ClipboardCheck },
      { label: 'Facturation', icon: Receipt },
      { label: 'Comptabilité', icon: Wallet },
      { label: 'Bordereaux', icon: FileText },
    ],
  },
  {
    title: 'Général',
    items: [
      { label: 'Paramètres', icon: Settings },
      { label: 'Assistance', icon: HelpCircle },
      { label: 'Déconnexion', icon: LogOut },
    ],
  },
]

export function Sidebar() {
  const [activeItem, setActiveItem] = useState('Tableau de bord')
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'flex h-screen flex-col border-r border-border bg-sidebar transition-[width] duration-300 ease-in-out',
        collapsed ? 'w-[78px]' : 'w-[260px]'
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
              ERP Auto-École
            </span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
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
        {navSections.map((section) => (
          <div key={section.title} className="mb-6">
            {!collapsed && (
              <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {section.title}
              </h3>
            )}
            <ul className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon
                const isActive = activeItem === item.label
                return (
                  <li key={item.label} className="relative">
                    <button
                      onClick={() => setActiveItem(item.label)}
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
                      {!collapsed && (
                        <span className="flex-1 text-left">{item.label}</span>
                      )}
                      {!collapsed && item.badge && (
                        <span
                          className={cn(
                            'flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold',
                            isActive
                              ? 'bg-primary-foreground/20 text-primary-foreground'
                              : 'bg-primary/10 text-primary'
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                      {collapsed && item.badge && (
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

      {/* Upgrade Card */}
      {!collapsed && (
        <div className="px-3 pb-4">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary to-primary/80 p-4">
            <div className="relative z-10">
              <p className="text-sm font-semibold text-primary-foreground">
                Relances WhatsApp
              </p>
              <p className="mt-1 text-xs text-primary-foreground/80">
                5 factures impayées à relancer
              </p>
              <button className="mt-3 w-full rounded-lg bg-primary-foreground px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary-foreground/90">
                Relancer maintenant
              </button>
            </div>
            <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-primary-foreground/10" />
            <div className="absolute -bottom-6 -right-6 h-16 w-16 rounded-full bg-primary-foreground/10" />
          </div>
        </div>
      )}
    </aside>
  )
}
