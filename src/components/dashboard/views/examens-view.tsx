'use client'

import { useState } from 'react'
import { Plus, FileText, MoreHorizontal } from 'lucide-react'
import { type ResultatExamen } from '@/lib/mock-data'
import { useDataStore } from '@/store/data-store'
import { useNavStore } from '@/store/nav-store'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import {
  ViewHeader,
  StatusBadge,
  ActionButton,
  Card,
  initials,
} from './shared'
import { NouvelExamenDialog } from '@/components/dashboard/dialogs/nouvel-examen-dialog'

// --- Helpers ---
function resultatTone(r: ResultatExamen): 'amber' | 'emerald' | 'rose' {
  switch (r) {
    case 'En attente':
      return 'amber'
    case 'Admis':
      return 'emerald'
    case 'Échec':
      return 'rose'
  }
}

function typeExamenBadge(type: string) {
  if (type === 'Code') {
    return (
      <span className="inline-flex items-center rounded-md bg-sky-500/10 px-2 py-0.5 text-xs font-semibold text-sky-600">
        Code
      </span>
    )
  }
  return (
    <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
      Conduite
    </span>
  )
}

// --- Sub-component: Examens individuels table ---
function ExamensIndividuels() {
  const examens = useDataStore((s) => s.examens)
  return (
    <Card className="p-0">
      <div className="custom-scrollbar overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse text-left">
          <thead>
            <tr className="border-b border-border">
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Élève</th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type examen</th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type permis</th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Inspecteur</th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Résultat</th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {examens.map((x) => (
              <tr key={x.id} className="hover:bg-muted/40">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {initials(x.eleve)}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-foreground">{x.eleve}</div>
                      <div className="text-xs text-muted-foreground">{x.eleveCode}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5">{typeExamenBadge(x.typeExamen)}</td>
                <td className="px-5 py-3.5">
                  <span className="text-sm font-medium text-foreground">{x.typePermis}</span>
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-sm text-foreground">{x.dateExamen}</span>
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-sm text-muted-foreground">{x.inspecteur}</span>
                </td>
                <td className="px-5 py-3.5">
                  <StatusBadge label={x.resultat} tone={resultatTone(x.resultat)} />
                </td>
                <td className="px-5 py-3.5 max-w-[220px]">
                  {x.notes ? (
                    <span className="line-clamp-1 text-sm text-muted-foreground" title={x.notes}>
                      {x.notes}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground/50">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

// --- Sub-component: Sessions collectives grid ---
function SessionsCollectives() {
  const examenSessions = useDataStore((s) => s.examenSessions)
  const setActiveView = useNavStore((s) => s.setActiveView)

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {examenSessions.map((sess) => (
        <Card key={sess.id} className="flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 font-mono text-xs font-bold text-foreground">
                {sess.numeroBordereau}
              </span>
              <div className="mt-2 flex items-center gap-2">
                {typeExamenBadge(sess.typeExamen)}
                <span className="text-xs text-muted-foreground">
                  {sess.candidats.length} candidat{sess.candidats.length > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Session info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Date</div>
              <div className="mt-0.5 font-medium text-foreground">{sess.date} · {sess.heure}</div>
            </div>
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Centre</div>
              <div className="mt-0.5 font-medium text-foreground">{sess.centre}</div>
            </div>
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Inspecteur</div>
              <div className="mt-0.5 font-medium text-foreground">{sess.inspecteur}</div>
            </div>
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Véhicule</div>
              <div className="mt-0.5 font-medium text-foreground">{sess.vehicule}</div>
            </div>
          </div>

          {/* Action */}
          <button
            onClick={() => setActiveView('bordereaux')}
            className={cn(
              'flex h-9 items-center justify-center gap-2 rounded-lg border border-input bg-background px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
            )}
          >
            <FileText className="h-4 w-4" />
            Voir le bordereau
          </button>
        </Card>
      ))}
    </div>
  )
}

// --- Main component ---
export function ExamensView() {
  const [showAdd, setShowAdd] = useState(false)
  return (
    <>
      <ViewHeader
        title="Examens & Sessions"
        description="Suivi des examens individuels et sessions collectives"
        actions={
          <ActionButton variant="primary" onClick={() => setShowAdd(true)}>
            <Plus className="h-4 w-4" />
            Nouvel examen
          </ActionButton>
        }
      />

      <Tabs defaultValue="individuels" className="w-full">
        <TabsList>
          <TabsTrigger value="individuels">Examens individuels</TabsTrigger>
          <TabsTrigger value="collectives">Sessions collectives</TabsTrigger>
        </TabsList>

        <TabsContent value="individuels" className="mt-4">
          <ExamensIndividuels />
        </TabsContent>
        <TabsContent value="collectives" className="mt-4">
          <SessionsCollectives />
        </TabsContent>
      </Tabs>

      <NouvelExamenDialog open={showAdd} onOpenChange={setShowAdd} />
    </>
  )
}
