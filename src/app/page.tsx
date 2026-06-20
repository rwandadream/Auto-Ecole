'use client'

import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { useNavStore } from '@/store/nav-store'
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

export default function Home() {
  const activeView = useNavStore((s) => s.activeView)
  const ViewComponent = viewMap[activeView] ?? DashboardView

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
