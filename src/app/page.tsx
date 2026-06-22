'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/auth-store'
import { useNavStore } from '@/store/nav-store'
import { canAccessView, getDefaultViewForRole } from '@/lib/permissions'
import { StoreHydration } from '@/components/dashboard/store-hydration'
import { useSupabaseRealtime } from '@/hooks/use-supabase-realtime'
import { LoginView } from '@/components/dashboard/login-view'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { StudentSidebar } from '@/components/dashboard/student-sidebar'
import { StudentHeader } from '@/components/dashboard/student-header'
import { AppShell } from '@/components/dashboard/app-shell'
import { DashboardView } from '@/components/dashboard/views/dashboard-view'
import { ElevesView } from '@/components/dashboard/views/eleves-view'
import { EleveDetailView } from '@/components/dashboard/views/eleve-detail-view'
import { EleveEditView } from '@/components/dashboard/views/eleve-edit-view'
import { EleveCreateView } from '@/components/dashboard/views/eleve-create-view'
import { ScannerCniView } from '@/components/dashboard/views/scanner-cni-view'
import { MoniteursView } from '@/components/dashboard/views/moniteurs-view'
import { VehiculesView } from '@/components/dashboard/views/vehicules-view'
import { PlanningView } from '@/components/dashboard/views/planning-view'
import { ExamensView } from '@/components/dashboard/views/examens-view'
import { BordereauxView } from '@/components/dashboard/views/bordereaux-view'
import { FacturationView } from '@/components/dashboard/views/facturation-view'
import { ComptabiliteView } from '@/components/dashboard/views/comptabilite-view'
import { ParametresView } from '@/components/dashboard/views/parametres-view'
import { InspecteursView } from '@/components/dashboard/views/inspecteurs-view'
import { AuditLogView } from '@/components/dashboard/views/audit-log-view'
import { AssistanceView } from '@/components/dashboard/views/assistance-view'
import { StudentDashboardView } from '@/components/dashboard/views/student-dashboard-view'
import { StudentPlanningView } from '@/components/dashboard/views/student-planning-view'
import { StudentFacturesView } from '@/components/dashboard/views/student-factures-view'
import { StudentProfilView } from '@/components/dashboard/views/student-profil-view'

const studentViewMap = {
  'student-dashboard': StudentDashboardView,
  'student-planning': StudentPlanningView,
  'student-factures': StudentFacturesView,
  'student-profil': StudentProfilView,
} as const

const adminViewMap = {
  dashboard: DashboardView,
  eleves: ElevesView,
  scanner: ScannerCniView,
  moniteurs: MoniteursView,
  vehicules: VehiculesView,
  inspecteurs: InspecteursView,
  planning: PlanningView,
  examens: ExamensView,
  bordereaux: BordereauxView,
  facturation: FacturationView,
  comptabilite: ComptabiliteView,
  parametres: ParametresView,
  audit: AuditLogView,
  assistance: AssistanceView,
} as const

export default function Home() {
  return (
    <StoreHydration>
      <HomeContent />
    </StoreHydration>
  )
}

function HomeContent() {
  const { isAuthenticated, user } = useAuthStore()
  const activeView = useNavStore((s) => s.activeView)
  const setActiveView = useNavStore((s) => s.setActiveView)
  const selectedEleveCode = useNavStore((s) => s.selectedEleveCode)

  useSupabaseRealtime()

  useEffect(() => {
    if (user?.mode === 'admin' && !canAccessView(user.role, activeView)) {
      setActiveView(getDefaultViewForRole(user.role))
    }
  }, [user, activeView, setActiveView])

  if (!isAuthenticated || !user) {
    return <LoginView />
  }

  if (user.mode === 'eleve') {
    const ViewComponent = studentViewMap[activeView as keyof typeof studentViewMap] ?? StudentDashboardView
    return (
      <AppShell sidebar={<StudentSidebar />} header={<StudentHeader />}>
        <ViewComponent />
      </AppShell>
    )
  }

  if (activeView === 'eleve-detail' && selectedEleveCode) {
    return (
      <AppShell sidebar={<Sidebar />} header={<Header />}>
        <EleveDetailView eleveCode={selectedEleveCode} />
      </AppShell>
    )
  }

  if (activeView === 'eleve-edit' && selectedEleveCode) {
    return (
      <AppShell sidebar={<Sidebar />} header={<Header />}>
        <EleveEditView eleveCode={selectedEleveCode} />
      </AppShell>
    )
  }

  if (activeView === 'eleve-create') {
    return (
      <AppShell sidebar={<Sidebar />} header={<Header />}>
        <EleveCreateView />
      </AppShell>
    )
  }

  const ViewComponent = adminViewMap[activeView as keyof typeof adminViewMap] ?? DashboardView
  return (
    <AppShell sidebar={<Sidebar />} header={<Header />}>
      <ViewComponent />
    </AppShell>
  )
}
