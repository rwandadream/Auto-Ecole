import type { AdminSlice } from './slices/admin-slice'
import type { ResourceSlice } from './slices/resource-slice'
import type { ActivitySlice } from './slices/activity-slice'
import type { FinanceSlice } from './slices/finance-slice'

export type AuditEntry = {
  id: string
  action: 'INSERT' | 'UPDATE' | 'DELETE'
  entity: string
  entityId: string
  description: string
  timestamp: string
  user: string
  oldData?: Record<string, unknown>
  newData?: Record<string, unknown>
}

export type DataState = AdminSlice & ResourceSlice & ActivitySlice & FinanceSlice
