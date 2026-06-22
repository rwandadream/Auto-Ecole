'use client'

import { useState } from 'react'
import { FileDown, ClipboardEdit, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useDataStore } from '@/store/data-store'
import { useAuthStore } from '@/store/auth-store'
import { generateBordereauPdf } from '@/lib/utils-docs'
import {
  ViewHeader,
  StatusBadge,
  ActionButton,
  Card,
  resultatExamenTone,
  TypeExamenBadge,
} from './shared'
import {
  ResponsiveDataView,
  MobileListCard,
  MobileListCardRow,
} from '@/components/dashboard/responsive-data-view'
import { SaisieResultatsDialog } from '@/components/dashboard/dialogs/saisie-resultats-dialog'
import { NouvelleSessionDialog } from '@/components/dashboard/dialogs/nouvelle-session-dialog'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'

// --- Info cell helper ---
function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 truncate text-sm font-medium text-foreground">{value}</div>
    </div>
  )
}

function canDeleteSession(role: string): boolean {
  return role === 'Administrateur principal' || role === 'Administrateur secondaire' || role === 'Administrateur'
}

// --- Main component ---
export function BordereauxView() {
  const examenSessions = useDataStore((s) => s.examenSessions)
  const deleteExamenSession = useDataStore((s) => s.deleteExamenSession)
  const user = useAuthStore((s) => s.user)
  const [saisieSession, setSaisieSession] = useState<typeof examenSessions[number] | null>(null)
  const [showAddSession, setShowAddSession] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const showDelete = user?.mode === 'admin' && canDeleteSession(user.role)
  const deletingSession = deletingId ? examenSessions.find((s) => s.id === deletingId) : null

  const handleConfirmDelete = () => {
    if (!deletingId) return
    const num = deletingSession?.numeroBordereau ?? deletingId
    deleteExamenSession(deletingId)
    setDeletingId(null)
    toast.success(`Session ${num} supprimée.`)
  }

  return (
    <>
      <ViewHeader
        title="Bordereaux d'examen"
        description="Sessions collectives et génération de bordereaux PDF officiels"
        actions={
          <ActionButton variant="primary" onClick={() => setShowAddSession(true)}>
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
                <TypeExamenBadge type={sess.typeExamen} />
                <span className="text-xs text-muted-foreground">
                  {sess.candidats.length} candidat{sess.candidats.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    void generateBordereauPdf(sess)
                    toast.success(`Bordereau ${sess.numeroBordereau} généré.`)
                  }}
                  className="flex h-9 items-center gap-2 rounded-lg border border-input bg-background px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <FileDown className="h-4 w-4" />
                  Générer PDF
                </button>
                <ActionButton onClick={() => setSaisieSession(sess)}>
                  <ClipboardEdit className="h-4 w-4" />
                  Saisir les résultats
                </ActionButton>
                {showDelete && (
                  <button
                    onClick={() => setDeletingId(sess.id)}
                    className="flex h-9 items-center gap-2 rounded-lg border border-destructive/30 bg-background px-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                    Supprimer
                  </button>
                )}
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

            {/* Candidats table / cartes mobile */}
            <div className="rounded-lg border border-border">
              <ResponsiveDataView
                empty={sess.candidats.length === 0}
                emptyState={
                  <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                    Aucun candidat pour cette session.
                  </p>
                }
                mobile={sess.candidats.map((c, idx) => (
                  <MobileListCard key={c.identifiant}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-muted-foreground">
                          N° {String(idx + 1).padStart(2, '0')}
                        </span>
                        <p className="mt-1 font-semibold text-foreground">{c.nomComplet}</p>
                        <p className="font-mono text-xs text-muted-foreground">{c.identifiant}</p>
                      </div>
                      <StatusBadge label={c.resultat} tone={resultatExamenTone[c.resultat]} />
                    </div>
                    <div className="mt-3 space-y-1 border-t border-border pt-3">
                      <MobileListCardRow label="Téléphone">{c.telephone}</MobileListCardRow>
                      <MobileListCardRow label="Catégorie permis">
                        <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-semibold text-foreground">
                          {c.categoriePermis}
                        </span>
                      </MobileListCardRow>
                    </div>
                  </MobileListCard>
                ))}
                desktop={
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
                          <StatusBadge label={c.resultat} tone={resultatExamenTone[c.resultat]} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                  </div>
                }
              />
            </div>
          </Card>
        ))}
      </div>
      <SaisieResultatsDialog session={saisieSession} open={!!saisieSession} onOpenChange={(v) => { if (!v) setSaisieSession(null) }} />
      <NouvelleSessionDialog open={showAddSession} onOpenChange={setShowAddSession} />

      <AlertDialog open={!!deletingId} onOpenChange={(v) => { if (!v) setDeletingId(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette session ?</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingSession ? (
                <>
                  Vous êtes sur le point de supprimer la session{' '}
                  <strong>{deletingSession.numeroBordereau}</strong> ({deletingSession.candidats.length} candidat
                  {deletingSession.candidats.length > 1 ? 's' : ''}). Cette action est irréversible et sera tracée
                  dans le journal d&apos;audit.
                </>
              ) : (
                'Cette action est irréversible.'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              variant="destructive"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
