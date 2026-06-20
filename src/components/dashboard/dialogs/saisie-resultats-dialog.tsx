'use client'

import { useState } from 'react'
import { Save, Calendar, Clock, MapPin, Award, User } from 'lucide-react'
import { Modal } from '@/components/dashboard/modal'
import { StatusBadge } from '@/components/dashboard/views/shared'

type SessionCandidat = {
  nomComplet: string
  identifiant: string
  telephone: string
  categoriePermis: string
  resultat: string
}

type Session = {
  numeroBordereau: string
  date: string
  heure: string
  centre: string
  typeExamen: string
  inspecteur: string
  vehicule: string
  candidats: SessionCandidat[]
}

type ResultRow = SessionCandidat & { notes: string }

function resultatTone(r: string) {
  switch (r) {
    case 'Admis':
      return 'emerald' as const
    case 'Échec':
      return 'rose' as const
    case 'En attente':
      return 'amber' as const
    default:
      return 'slate' as const
  }
}

export function SaisieResultatsDialog({
  session,
  open,
  onOpenChange,
}: {
  session: Session | null
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const [results, setResults] = useState<ResultRow[]>([])
  const [prevSession, setPrevSession] = useState<Session | null>(session)
  if (session !== prevSession) {
    setPrevSession(session)
    setResults(
      session
        ? session.candidats.map((c) => ({ ...c, notes: '' }))
        : []
    )
  }

  if (!session) {
    return (
      <Modal open={open} onOpenChange={onOpenChange} title="Saisie des résultats" size="xl">
        <div className="py-12 text-center text-sm text-muted-foreground">
          Aucune session sélectionnée.
        </div>
      </Modal>
    )
  }

  const admis = results.filter((r) => r.resultat === 'Admis').length
  const echec = results.filter((r) => r.resultat === 'Échec').length
  const attente = results.filter((r) => r.resultat === 'En attente').length

  const updateResultat = (idx: number, resultat: string) => {
    setResults((prev) => prev.map((r, i) => (i === idx ? { ...r, resultat } : r)))
  }

  const updateNotes = (idx: number, notes: string) => {
    setResults((prev) => prev.map((r, i) => (i === idx ? { ...r, notes } : r)))
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={`Saisie des résultats — ${session.numeroBordereau}`}
      description={`Enregistrez les résultats pour les ${session.candidats.length} candidats`}
      size="xl"
      footer={
        <>
          <button
            onClick={() => onOpenChange(false)}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-input bg-background px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Annuler
          </button>
          <button
            onClick={() => onOpenChange(false)}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Save className="h-4 w-4" />
            Enregistrer les résultats
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Bannière infos session */}
        <div className="grid grid-cols-2 gap-3 rounded-lg bg-muted p-3 sm:grid-cols-3 lg:grid-cols-5">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Date</p>
              <p className="text-sm font-medium text-foreground">{session.date}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Heure</p>
              <p className="text-sm font-medium text-foreground">{session.heure}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Centre</p>
              <p className="text-sm font-medium text-foreground">{session.centre}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Type</p>
              <p className="text-sm font-medium text-foreground">{session.typeExamen}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Inspecteur</p>
              <p className="text-sm font-medium text-foreground">{session.inspecteur}</p>
            </div>
          </div>
        </div>

        {/* Tableau des candidats */}
        <div className="overflow-hidden rounded-xl border border-border">
          <div className="max-h-[40vh] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-muted/60 backdrop-blur">
                <tr className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <th className="px-3 py-3 text-left">N°</th>
                  <th className="px-3 py-3 text-left">Candidat</th>
                  <th className="px-3 py-3 text-left">Identifiant</th>
                  <th className="px-3 py-3 text-left">Catégorie</th>
                  <th className="px-3 py-3 text-left">Résultat</th>
                  <th className="px-3 py-3 text-left">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {results.map((c, idx) => (
                  <tr key={c.identifiant} className="hover:bg-muted/30">
                    <td className="px-3 py-3 text-muted-foreground">{idx + 1}</td>
                    <td className="whitespace-nowrap px-3 py-3 font-medium text-foreground">{c.nomComplet}</td>
                    <td className="whitespace-nowrap px-3 py-3 font-mono text-xs text-muted-foreground">{c.identifiant}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-foreground">{c.categoriePermis}</td>
                    <td className="px-3 py-3">
                      <select
                        value={c.resultat}
                        onChange={(e) => updateResultat(idx, e.target.value)}
                        className="h-9 rounded-lg border border-input bg-background px-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring transition-colors"
                      >
                        <option value="En attente">En attente</option>
                        <option value="Admis">Admis</option>
                        <option value="Échec">Échec</option>
                      </select>
                    </td>
                    <td className="px-3 py-3">
                      <input
                        type="text"
                        value={c.notes}
                        onChange={(e) => updateNotes(idx, e.target.value)}
                        placeholder="—"
                        className="h-9 w-full min-w-[120px] rounded-lg border border-input bg-background px-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring transition-colors"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Résumé coloré */}
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-3">
          <span className="text-sm font-medium text-muted-foreground">Résumé :</span>
          <StatusBadge label={`${admis} Admis`} tone="emerald" />
          <StatusBadge label={`${echec} Échec`} tone="rose" />
          <StatusBadge label={`${attente} En attente`} tone="amber" />
        </div>
      </div>
    </Modal>
  )
}
