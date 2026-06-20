'use client'

import { useState } from 'react'
import { FileDown, ClipboardEdit, Plus, FileText } from 'lucide-react'
import { examenSessions, type ResultatExamen } from '@/lib/mock-data'
import {
  ViewHeader,
  StatusBadge,
  ActionButton,
  Card,
} from './shared'
import { SaisieResultatsDialog } from '@/components/dashboard/dialogs/saisie-resultats-dialog'

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

// --- Info cell helper ---
function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 truncate text-sm font-medium text-foreground">{value}</div>
    </div>
  )
}

// --- Main component ---
export function BordereauxView() {
  const [saisieSession, setSaisieSession] = useState<typeof examenSessions[number] | null>(null)

  return (
    <>
      <ViewHeader
        title="Bordereaux d'examen"
        description="Sessions collectives et génération de bordereaux PDF officiels"
        actions={
          <ActionButton>
            <Plus className="h-4 w-4" />
            Nouvelle session
          </ActionButton>
        }
      />

      <div className="flex flex-col gap-6">
        {examenSessions.map((sess) => (
          <Card key={sess.id} className="flex flex-col gap-5 p-5">
            {/* Card header */}
            <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-md bg-muted px-2.5 py-1 font-mono text-sm font-bold text-foreground">
                  {sess.numeroBordereau}
                </span>
                {typeExamenBadge(sess.typeExamen)}
                <span className="text-xs text-muted-foreground">
                  {sess.candidats.length} candidat{sess.candidats.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex h-9 items-center gap-2 rounded-lg border border-input bg-background px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                  <FileDown className="h-4 w-4" />
                  Générer PDF
                </button>
                <ActionButton onClick={() => setSaisieSession(sess)}>
                  <ClipboardEdit className="h-4 w-4" />
                  Saisir les résultats
                </ActionButton>
              </div>
            </div>

            {/* Session info grid */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <InfoCell label="Date" value={sess.date} />
              <InfoCell label="Heure" value={sess.heure} />
              <InfoCell label="Centre" value={sess.centre} />
              <InfoCell label="Type examen" value={sess.typeExamen} />
              <InfoCell label="Inspecteur" value={sess.inspecteur} />
              <InfoCell label="Véhicule" value={sess.vehicule} />
            </div>

            {/* Candidats table */}
            <div className="rounded-lg border border-border">
              <div className="custom-scrollbar overflow-x-auto">
                <table className="w-full min-w-[760px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">N°</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nom complet</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Identifiant</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Téléphone</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Catégorie permis</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Résultat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {sess.candidats.map((c, idx) => (
                      <tr key={c.identifiant} className="hover:bg-muted/40">
                        <td className="px-4 py-3">
                          <span className="text-sm font-semibold text-muted-foreground">{String(idx + 1).padStart(2, '0')}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium text-foreground">{c.nomComplet}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs text-muted-foreground">{c.identifiant}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-muted-foreground">{c.telephone}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-semibold text-foreground">
                            {c.categoriePermis}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge label={c.resultat} tone={resultatTone(c.resultat)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <SaisieResultatsDialog session={saisieSession} open={!!saisieSession} onOpenChange={(v) => { if (!v) setSaisieSession(null) }} />
    </>
  )
}
