'use client'

import { useState } from 'react'
import { Save, Calendar, Clock, MapPin, Award, User } from 'lucide-react'
import { toast } from 'sonner'
import { Modal, ModalCancelButton, ModalPrimaryButton } from '@/components/dashboard/modal'
import { StatusBadge } from '@/components/dashboard/views/shared'
import { useDataStore, type Eleve, type Examen } from '@/store/data-store'

type SessionCandidat = {
  nomComplet: string
  identifiant: string
  telephone: string
  categoriePermis: string
  resultat: string
}

type Session = {
  id: string
  numeroBordereau: string
  date: string
  heure: string
  centre: string
  lieu?: string
  typeExamen: string
  inspecteur: string
  vehicule: string
  candidats: SessionCandidat[]
}

type ResultRow = SessionCandidat & { notes: string }

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
  const [meta, setMeta] = useState({ date: '', heure: '', centre: '', lieu: '' })
  const [prevSession, setPrevSession] = useState<Session | null>(session)
  const updateSessionResultats = useDataStore((s) => s.updateSessionResultats)
  const updateExamenSessionMeta = useDataStore((s) => s.updateExamenSessionMeta)
  const updateEleve = useDataStore((s) => s.updateEleve)
  const addExamen = useDataStore((s) => s.addExamen)
  const eleves = useDataStore((s) => s.eleves)
  if (session !== prevSession) {
    setPrevSession(session)
    setResults(
      session
        ? session.candidats.map((c) => ({ ...c, notes: '' }))
        : []
    )
    setMeta(
      session
        ? { date: session.date, heure: session.heure, centre: session.centre, lieu: session.lieu ?? '' }
        : { date: '', heure: '', centre: '', lieu: '' }
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

  const apte = results.filter((r) => r.resultat === 'Apte').length
  const inapte = results.filter((r) => r.resultat === 'Inapte').length
  const absent = results.filter((r) => r.resultat === 'Absent').length
  const attente = results.filter((r) => r.resultat === 'En attente').length

  const updateResultat = (idx: number, resultat: string) => {
    setResults((prev) => prev.map((r, i) => (i === idx ? { ...r, resultat } : r)))
  }

  const updateNotes = (idx: number, notes: string) => {
    setResults((prev) => prev.map((r, i) => (i === idx ? { ...r, notes } : r)))
  }

  // Un résultat "Absent" ne change pas le statut du dossier élève : il doit
  // repasser l'examen, son statut 'Examen' est conservé.
  const RESULTAT_TO_STATUT_ELEVE: Partial<Record<string, Eleve['statut']>> = {
    Apte: 'Apte',
    Inapte: 'Inapte',
  }

  const handleSave = () => {
    // 1. Met à jour les métadonnées de la session (centre/lieu/date/heure)
    updateExamenSessionMeta(session.id, meta)

    // 2. Met à jour la session avec les résultats saisis
    updateSessionResultats(
      session.id,
      results.map((r) => ({
        nomComplet: r.nomComplet,
        identifiant: r.identifiant,
        telephone: r.telephone,
        categoriePermis: r.categoriePermis,
        resultat: r.resultat,
        notes: r.notes,
      })) as unknown as Parameters<typeof updateSessionResultats>[1]
    )

    // 3. Pour chaque candidat dont le résultat n'est plus « En attente »,
    //    on met à jour le statut de l'élève et on crée un enregistrement examen individuel.
    let updatedCount = 0
    for (const c of results) {
      if (c.resultat === 'En attente') continue

      const eleve = eleves.find((e) => e.code === c.identifiant)
      const nouveauStatut = RESULTAT_TO_STATUT_ELEVE[c.resultat]
      if (eleve && nouveauStatut) {
        updateEleve(eleve.id, { statut: nouveauStatut })
      }

      addExamen({
        eleve: c.nomComplet,
        eleveCode: c.identifiant,
        typeExamen: session.typeExamen,
        typePermis: c.categoriePermis,
        dateExamen: meta.date,
        inspecteur: session.inspecteur,
        resultat: c.resultat as Examen['resultat'],
        notes: c.notes || '',
      })
      updatedCount++
    }

    toast.success(
      updatedCount > 0
        ? `Résultats enregistrés — ${updatedCount} élève${updatedCount > 1 ? 's' : ''} mis à jour`
        : 'Résultats enregistrés'
    )
    onOpenChange(false)
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
          <ModalCancelButton onClick={() => onOpenChange(false)}>
            Annuler
          </ModalCancelButton>
          <ModalPrimaryButton onClick={handleSave}>
            <Save className="h-4 w-4" />
            Enregistrer les résultats
          </ModalPrimaryButton>
        </>
      }
    >
      <div className="space-y-4">
        {/* Bannière infos session (Date/Heure/Centre/Lieu modifiables) */}
        <div className="grid grid-cols-2 gap-3 rounded-lg bg-muted p-3 sm:grid-cols-3 lg:grid-cols-6">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0 text-primary" />
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Date</p>
              <input
                type="date"
                value={meta.date}
                onChange={(e) => setMeta((m) => ({ ...m, date: e.target.value }))}
                className="mt-0.5 h-7 w-full rounded-md border border-input bg-background px-1.5 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 shrink-0 text-primary" />
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Heure</p>
              <input
                type="time"
                value={meta.heure}
                onChange={(e) => setMeta((m) => ({ ...m, heure: e.target.value }))}
                className="mt-0.5 h-7 w-full rounded-md border border-input bg-background px-1.5 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0 text-primary" />
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Centre</p>
              <input
                type="text"
                value={meta.centre}
                onChange={(e) => setMeta((m) => ({ ...m, centre: e.target.value }))}
                className="mt-0.5 h-7 w-full rounded-md border border-input bg-background px-1.5 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0 text-primary" />
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Lieu</p>
              <input
                type="text"
                value={meta.lieu}
                onChange={(e) => setMeta((m) => ({ ...m, lieu: e.target.value }))}
                className="mt-0.5 h-7 w-full rounded-md border border-input bg-background px-1.5 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring"
              />
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

        {/* Tableau / cartes des candidats */}
        <div className="overflow-hidden rounded-xl border border-border">
          {/* Mobile cards */}
          <div className="max-h-[45vh] space-y-3 overflow-y-auto p-3 sm:hidden">
            {results.map((c, idx) => (
              <div key={c.identifiant} className="rounded-lg border border-border bg-card p-3">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {idx + 1}. {c.nomComplet}
                    </p>
                    <p className="font-mono text-xs text-muted-foreground">{c.identifiant}</p>
                    <p className="text-xs text-muted-foreground">Catégorie {c.categoriePermis}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-muted-foreground">
                    Résultat
                    <select
                      value={c.resultat}
                      onChange={(e) => updateResultat(idx, e.target.value)}
                      className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring"
                    >
                      <option value="En attente">En attente</option>
                      <option value="Apte">Apte</option>
                      <option value="Inapte">Inapte</option>
                      <option value="Absent">Absent</option>
                    </select>
                  </label>
                  <label className="block text-xs font-medium text-muted-foreground">
                    Notes
                    <input
                      type="text"
                      value={c.notes}
                      onChange={(e) => updateNotes(idx, e.target.value)}
                      placeholder="—"
                      className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring"
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="custom-scrollbar hidden max-h-[40vh] overflow-auto sm:block">
            <table className="w-full min-w-[640px] text-sm">
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
                        <option value="Apte">Apte</option>
                        <option value="Inapte">Inapte</option>
                        <option value="Absent">Absent</option>
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
          <StatusBadge label={`${apte} Apte`} tone="success" />
          <StatusBadge label={`${inapte} Inapte`} tone="destructive" />
          <StatusBadge label={`${absent} Absent`} tone="neutral" />
          <StatusBadge label={`${attente} En attente`} tone="warning" />
        </div>
      </div>
    </Modal>
  )
}
