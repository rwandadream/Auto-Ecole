'use client'

import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { MetricCards } from '@/components/dashboard/metric-cards'
import { RevenueAnalytics } from '@/components/dashboard/revenue-analytics'
import { TotalIncome } from '@/components/dashboard/total-income'
import { RecentOrders } from '@/components/dashboard/recent-orders'
import { CalendarRange } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />

        <main className="custom-scrollbar flex-1 overflow-y-auto p-6">
          {/* Sales Overview Header */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Sales Overview
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Monitor your store performance and key metrics
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-input bg-card px-3 py-2">
              <CalendarRange className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                April 10, 2026 - May 11, 2026
              </span>
            </div>
          </div>

          {/* Metric Cards */}
          <MetricCards />

          {/* Charts Grid */}
          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <RevenueAnalytics />
            <TotalIncome />
          </div>

          {/* Recent Orders */}
          <div className="mt-6">
            <RecentOrders />
          </div>
        </main>
      </div>
    </div>
  )
}
