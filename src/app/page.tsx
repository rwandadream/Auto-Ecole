'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef } from 'react'
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

function ViewLoading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <p className="text-sm text-muted-foreground">Chargement de la vue…</p>
    </div>
  )
}

const DashboardView = dynamic(
  () => import('@/components/dashboard/views/dashboard-view').then((m) => m.DashboardView),
  { loading: () => <ViewLoading /> },
)
const ElevesView = dynamic(
  () => import('@/components/dashboard/views/eleves-view').then((m) => m.ElevesView),
  { loading: () => <ViewLoading /> },
)
const EleveDetailView = dynamic(
  () => import('@/components/dashboard/views/eleve-detail-view').then((m) => m.EleveDetailView),
  { loading: () => <ViewLoading /> },
)
const EleveEditView = dynamic(
  () => import('@/components/dashboard/views/eleve-edit-view').then((m) => m.EleveEditView),
  { loading: () => <ViewLoading /> },
)
const EleveCreateView = dynamic(
  () => import('@/components/dashboard/views/eleve-create-view').then((m) => m.EleveCreateView),
  { loading: () => <ViewLoading /> },
)
const ScannerCniView = dynamic(
  () => import('@/components/dashboard/views/scanner-cni-view').then((m) => m.ScannerCniView),
  { loading: () => <ViewLoading /> },
)
const MoniteursView = dynamic(
  () => import('@/components/dashboard/views/moniteurs-view').then((m) => m.MoniteursView),
  { loading: () => <ViewLoading /> },
)
const VehiculesView = dynamic(
  () => import('@/components/dashboard/views/vehicules-view').then((m) => m.VehiculesView),
  { loading: () => <ViewLoading /> },
)
const PlanningView = dynamic(
  () => import('@/components/dashboard/views/planning-view').then((m) => m.PlanningView),
  { loading: () => <ViewLoading /> },
)
const ExamensView = dynamic(
  () => import('@/components/dashboard/views/examens-view').then((m) => m.ExamensView),
  { loading: () => <ViewLoading /> },
)
const BordereauxView = dynamic(
  () => import('@/components/dashboard/views/bordereaux-view').then((m) => m.BordereauxView),
  { loading: () => <ViewLoading /> },
)
const FacturationView = dynamic(
  () => import('@/components/dashboard/views/facturation-view').then((m) => m.FacturationView),
  { loading: () => <ViewLoading /> },
)
const ComptabiliteView = dynamic(
  () => import('@/components/dashboard/views/comptabilite-view').then((m) => m.ComptabiliteView),
  { loading: () => <ViewLoading /> },
)
const ParametresView = dynamic(
  () => import('@/components/dashboard/views/parametres-view').then((m) => m.ParametresView),
  { loading: () => <ViewLoading /> },
)
const InspecteursView = dynamic(
  () => import('@/components/dashboard/views/inspecteurs-view').then((m) => m.InspecteursView),
  { loading: () => <ViewLoading /> },
)
const MoniteurDashboardView = dynamic(
  () => import('@/components/dashboard/views/moniteur-dashboard-view').then((m) => m.MoniteurDashboardView),
  { loading: () => <ViewLoading /> },
)
const ParrainageView = dynamic(
  () => import('@/components/dashboard/views/parrainage-view').then((m) => m.ParrainageView),
  { loading: () => <ViewLoading /> },
)
const StudentDashboardView = dynamic(
  () => import('@/components/dashboard/views/student-dashboard-view').then((m) => m.StudentDashboardView),
  { loading: () => <ViewLoading /> },
)
const StudentPlanningView = dynamic(
  () => import('@/components/dashboard/views/student-planning-view').then((m) => m.StudentPlanningView),
  { loading: () => <ViewLoading /> },
)
const StudentFacturesView = dynamic(
  () => import('@/components/dashboard/views/student-factures-view').then((m) => m.StudentFacturesView),
  { loading: () => <ViewLoading /> },
)
const StudentProfilView = dynamic(
  () => import('@/components/dashboard/views/student-profil-view').then((m) => m.StudentProfilView),
  { loading: () => <ViewLoading /> },
)

const studentViewMap = {
  'student-dashboard': StudentDashboardView,
  'student-planning': StudentPlanningView,
  'student-factures': StudentFacturesView,
  'student-profil': StudentProfilView,
} as const

const adminViewMap = {
  dashboard: DashboardView,
  'moniteur-dashboard': MoniteurDashboardView,
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
  parrainage: ParrainageView,
} as const

export default function Home() {
  return (
    <StoreHydration>
      <HomeContent />
    </StoreHydration>
  )
}

function HomeContent() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)
  const activeView = useNavStore((s) => s.activeView)
  const setActiveView = useNavStore((s) => s.setActiveView)
  const selectedEleveCode = useNavStore((s) => s.selectedEleveCode)
  const redirectedRef = useRef<string | null>(null)

  const adminUserId = user?.mode === 'admin' ? user.id : null
  const adminRole = user?.mode === 'admin' ? user.role : null

  useSupabaseRealtime()

  useEffect(() => {
    if (!adminUserId || !adminRole) {
      redirectedRef.current = null
      return
    }
    if (canAccessView(adminRole, activeView)) {
      redirectedRef.current = null
      return
    }
    const fallback = getDefaultViewForRole(adminRole)
    const key = `${adminUserId}:${fallback}`
    if (fallback !== activeView && redirectedRef.current !== key) {
      redirectedRef.current = key
      setActiveView(fallback)
    }
  }, [adminUserId, adminRole, activeView, setActiveView])

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
