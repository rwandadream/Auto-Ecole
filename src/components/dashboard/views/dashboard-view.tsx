'use client'

import { MetricCards } from '@/components/dashboard/metric-cards'
import { RevenueAnalytics } from '@/components/dashboard/revenue-analytics'
import { TotalIncome } from '@/components/dashboard/total-income'
import { RecentOrders } from '@/components/dashboard/recent-orders'
import { UnpaidInvoices } from '@/components/dashboard/unpaid-invoices'
import { CalendarRange } from 'lucide-react'
import { ViewHeader } from './shared'

export function DashboardView() {
  return (
    <>
      <ViewHeader
        title="Centre de pilotage"
        description="Indicateurs clés de l'auto-école en temps réel — élèves, finances et examens"
        actions={
          <div className="flex items-center gap-2 rounded-lg border border-input bg-card px-3 py-2">
            <CalendarRange className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">01 Avr 2026 - 31 Mai 2026</span>
          </div>
        }
      />
      <MetricCards />
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RevenueAnalytics />
        <TotalIncome />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RecentOrders />
        </div>
        <div className="xl:col-span-1">
          <UnpaidInvoices />
        </div>
      </div>
    </>
  )
}
