'use client'

import { cn } from '@/lib/utils'

type ResponsiveDataViewProps = {
  mobile: React.ReactNode
  desktop: React.ReactNode
  empty?: boolean
  emptyState?: React.ReactNode
  className?: string
}

export function ResponsiveDataView({
  mobile,
  desktop,
  empty,
  emptyState,
  className,
}: ResponsiveDataViewProps) {
  if (empty && emptyState) {
    return <>{emptyState}</>
  }

  return (
    <div className={className}>
      <div className="space-y-3 lg:hidden">{mobile}</div>
      <div className="hidden lg:block">{desktop}</div>
    </div>
  )
}

export function MobileListCard({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'w-full rounded-lg border border-border bg-card p-4 text-left shadow-sm transition-colors',
        onClick && 'hover:bg-muted/30',
        className,
      )}
    >
      {children}
    </Tag>
  )
}

export function MobileListCardRow({
  label,
  children,
  className,
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex items-start justify-between gap-3 py-1', className)}>
      <span className="shrink-0 text-xs font-medium text-muted-foreground">{label}</span>
      <div className="min-w-0 text-right text-sm text-foreground">{children}</div>
    </div>
  )
}
