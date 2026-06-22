'use client'

type AppShellProps = {
  sidebar: React.ReactNode
  header: React.ReactNode
  children: React.ReactNode
}

export function AppShell({ sidebar, header, children }: AppShellProps) {
  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      {sidebar}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {header}
        <main className="custom-scrollbar flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
