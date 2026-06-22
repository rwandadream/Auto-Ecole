'use client'

import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useNavStore } from '@/store/nav-store'
import { LogoutDialog } from '@/components/dashboard/logout-dialog'
import { SidebarNav } from '@/components/dashboard/sidebar-nav'
import { BrandLogo } from '@/components/dashboard/brand-logo'
import { Sheet, SheetContent } from '@/components/ui/sheet'

function DesktopSidebarHeader({
  collapsed,
  onToggle,
}: {
  collapsed: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex h-16 shrink-0 items-center gap-3 border-b border-border px-5">
      <BrandLogo />
      {!collapsed && (
        <div className="flex min-w-0 flex-1 flex-col leading-tight">
          <span className="text-base font-bold tracking-tight text-foreground">
            SARAH AUTO
          </span>
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            ERP Auto-École
          </span>
        </div>
      )}
      <button
        type="button"
        onClick={onToggle}
        className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Réduire le menu"
      >
        <ChevronLeft
          className={cn(
            'h-4 w-4 transition-transform duration-300',
            collapsed && 'rotate-180',
          )}
        />
      </button>
    </div>
  )
}

export function Sidebar() {
  const collapsed = useNavStore((s) => s.collapsed)
  const toggleCollapsed = useNavStore((s) => s.toggleCollapsed)
  const mobileNavOpen = useNavStore((s) => s.mobileNavOpen)
  const setMobileNavOpen = useNavStore((s) => s.setMobileNavOpen)
  const [showLogout, setShowLogout] = useState(false)

  const handleLogout = () => setShowLogout(true)

  return (
    <>
      <aside
        className={cn(
          'hidden h-dvh shrink-0 flex-col border-r border-border bg-sidebar transition-[width] duration-300 ease-in-out lg:flex',
          collapsed ? 'w-[78px]' : 'w-[260px]',
        )}
      >
        <DesktopSidebarHeader collapsed={collapsed} onToggle={toggleCollapsed} />
        <SidebarNav collapsed={collapsed} onLogout={handleLogout} showHeader={false} />
      </aside>

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="flex w-[min(280px,85vw)] flex-col gap-0 p-0">
          <SidebarNav collapsed={false} onLogout={handleLogout} />
        </SheetContent>
      </Sheet>

      <LogoutDialog open={showLogout} onOpenChange={setShowLogout} />
    </>
  )
}
