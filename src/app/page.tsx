'use client'

import { useAuthStore } from '@/store/auth-store'
import { useNavStore } from '@/store/nav-store'
import { LoginView } from '@/components/dashboard/login-view'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { StudentSidebar } from '@/components/dashboard/student-sidebar'
import { StudentHeader } from '@/components/dashboard/student-header'
import { DashboardView } from '@/components/dashboard/views/dashboard-view'
import { ElevesView } from '@/components/dashboard/views/eleves-view'
import { ScannerCniView } from '@/components/dashboard/views/scanner-cni-view'
import { MoniteursView } from '@/components/dashboard/views/moniteurs-view'
import { VehiculesView } from '@/components/dashboard/views/vehicules-view'
import { PlanningView } from '@/components/dashboard/views/planning-view'
import { ExamensView } from '@/components/dashboard/views/examens-view'
import { BordereauxView } from '@/components/dashboard/views/bordereaux-view'
import { FacturationView } from '@/components/dashboard/views/facturation-view'
import { ComptabiliteView } from '@/components/dashboard/views/comptabilite-view'
import { ParametresView } from '@/components/dashboard/views/parametres-view'
import { AssistanceView } from '@/components/dashboard/views/assistance-view'
import { DeconnexionView } from '@/components/dashboard/views/deconnexion-view'
import { StudentDashboardView } from '@/components/dashboard/views/student-dashboard-view'
import { StudentPlanningView } from '@/components/dashboard/views/student-planning-view'
import { StudentFacturesView } from '@/components/dashboard/views/student-factures-view'
import { StudentProfilView } from '@/components/dashboard/views/student-profil-view'

const viewMap = {
  dashboard: DashboardView,
  eleves: ElevesView,
  scanner: ScannerCniView,
  moniteurs: MoniteursView,
  vehicules: VehiculesView,
  planning: PlanningView,
  examens: ExamensView,
  bordereaux: BordereauxView,
  facturation: FacturationView,
  comptabilite: ComptabiliteView,
  parametres: ParametresView,
  assistance: AssistanceView,
  deconnexion: DeconnexionView,
} as const

const studentViewMap = {
  'student-dashboard': StudentDashboardView,
  'student-planning': StudentPlanningView,
  'student-factures': StudentFacturesView,
  'student-profil': StudentProfilView,
} as const

export default function Home() {
  const { isAuthenticated, user } = useAuthStore()
  const activeView = useNavStore((s) => s.activeView)

  // Not authenticated → show login
  if (!isAuthenticated || !user) {
    return <LoginView />
  }

  // Student portal
  if (user.mode === 'eleve') {
    const ViewComponent = studentViewMap[activeView as keyof typeof studentViewMap] ?? StudentDashboardView
    return (
      <div className="flex h-screen overflow-hidden bg-background">
        <StudentSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <StudentHeader />
          <main className="custom-scrollbar flex-1 overflow-y-auto p-6">
            <ViewComponent />
          </main>
        </div>
      </div>
    )
  }

  // Admin ERP
  const ViewComponent = viewMap[activeView as keyof typeof viewMap] ?? DashboardView
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="custom-scrollbar flex-1 overflow-y-auto p-6">
          <ViewComponent />
        </main>
      </div>
    </div>
  )
}
