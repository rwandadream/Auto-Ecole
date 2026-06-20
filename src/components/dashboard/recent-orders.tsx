'use client'

import { Search, ArrowUpDown, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

type Order = {
  id: string
  date: string
  customer: string
  category: string
  status: 'Pending' | 'Completed'
  items: string
  total: string
}

const orders: Order[] = [
  {
    id: '#878909',
    date: '2 Dec 2026',
    customer: 'Oliver John Brown',
    category: 'Shoes, Shirt',
    status: 'Pending',
    items: '2 Items',
    total: '$789.00',
  },
  {
    id: '#878910',
    date: '1 Dec 2026',
    customer: 'Noah James Smith',
    category: 'Sneakers, T-shirt',
    status: 'Completed',
    items: '3 Items',
    total: '$967.00',
  },
  {
    id: '#878911',
    date: '30 Nov 2026',
    customer: 'Emma Wilson Davis',
    category: 'Jacket, Jeans',
    status: 'Completed',
    items: '2 Items',
    total: '$1,245.00',
  },
  {
    id: '#878912',
    date: '29 Nov 2026',
    customer: 'Liam Anderson Clark',
    category: 'Watch, Belt',
    status: 'Pending',
    items: '2 Items',
    total: '$532.00',
  },
  {
    id: '#878913',
    date: '28 Nov 2026',
    customer: 'Sophia Marie Lewis',
    category: 'Dress, Heels',
    status: 'Completed',
    items: '4 Items',
    total: '$1,890.00',
  },
  {
    id: '#878914',
    date: '27 Nov 2026',
    customer: 'Mason Robert Taylor',
    category: 'Hoodie, Cap',
    status: 'Pending',
    items: '2 Items',
    total: '$445.00',
  },
  {
    id: '#878915',
    date: '26 Nov 2026',
    customer: 'Isabella Grace Lee',
    category: 'Sunglasses, Bag',
    status: 'Completed',
    items: '3 Items',
    total: '$1,120.00',
  },
]

const columns = [
  { key: 'id', label: 'Order Id' },
  { key: 'date', label: 'Date' },
  { key: 'customer', label: 'Customer' },
  { key: 'category', label: 'Category' },
  { key: 'status', label: 'Status' },
  { key: 'items', label: 'Items' },
  { key: 'total', label: 'Total' },
]

function StatusBadge({ status }: { status: Order['status'] }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
        status === 'Completed'
          ? 'bg-emerald-500/10 text-emerald-600'
          : 'bg-primary/10 text-primary'
      )}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          status === 'Completed' ? 'bg-emerald-500' : 'bg-primary'
        )}
      />
      {status}
    </span>
  )
}

export function RecentOrders() {
  return (
    <div className="rounded-xl border border-border bg-card">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Recent orders</h2>
          <p className="text-sm text-muted-foreground">
            Track and manage your latest customer orders
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex h-9 items-center gap-2 rounded-lg border border-input bg-background px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <Search className="h-4 w-4" />
            Search
          </button>
          <button className="flex h-9 items-center gap-2 rounded-lg border border-input bg-background px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <ArrowUpDown className="h-4 w-4" />
            Sort by
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="custom-scrollbar overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-border">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  {col.label}
                </th>
              ))}
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map((order) => (
              <tr key={order.id} className="transition-colors hover:bg-muted/40">
                <td className="px-5 py-4">
                  <span className="text-sm font-semibold text-foreground">{order.id}</span>
                </td>
                <td className="px-5 py-4">
                  <span className="text-sm text-muted-foreground">{order.date}</span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {order.customer
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {order.customer}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className="text-sm text-muted-foreground">{order.category}</span>
                </td>
                <td className="px-5 py-4">
                  <StatusBadge status={order.status} />
                </td>
                <td className="px-5 py-4">
                  <span className="text-sm text-muted-foreground">{order.items}</span>
                </td>
                <td className="px-5 py-4">
                  <span className="text-sm font-bold text-foreground">{order.total}</span>
                </td>
                <td className="px-5 py-4">
                  <button className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border p-4">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">1-7</span> of{' '}
          <span className="font-medium text-foreground">120</span> orders
        </p>
        <div className="flex items-center gap-1">
          <button className="flex h-8 items-center rounded-md border border-input bg-background px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            Previous
          </button>
          <button className="flex h-8 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
