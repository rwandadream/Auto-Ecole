'use client'

import { Pencil } from 'lucide-react'
import { Modal } from '@/components/dashboard/modal'
import { StatusBadge, initials, formatXOF } from '@/components/dashboard/views/shared'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { eleves, seances, examens, factures } from '@/lib/mock-data'
import type { StatutEleve, StatutSeance, ResultatExamen, StatutFacture } from '@/lib/mock-data'

function statutEleveTone(s: StatutEleve) {
  switch (s) {
    case 'Prospect':
      return 'slate' as const
    case 'Inscrit':
      return 'sky' as const
    case 'En formation':
      return 'primary' as const
    case 'Examen':
      return 'amber' as const
    case 'Admis':
    case 'Terminé':
      return 'emerald' as const
    case 'Ajourné':
      return 'rose' as const
    case 'Abandon':
      return 'slate' as const
    default:
      return 'slate' as const
  }
}

function statutSeanceTone(s: StatutSeance) {
  switch (s) {
    case 'Planifié':
      return 'primary' as const
    case 'Effectué':
      return 'emerald' as const
    case 'Absent élève':
      return 'amber' as const
    case 'Annulé':
      return 'rose' as const
    default:
      return 'slate' as const
  }
}

function resultatExamenTone(r: ResultatExamen) {
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

function statutFactureTone(s: StatutFacture) {
  switch (s) {
    case 'Payée':
      return 'emerald' as const
    case 'Partielle':
      return 'amber' as const
    case 'Impayée':
    case 'Non payée':
      return 'rose' as const
    default:
      return 'slate' as const
  }
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value || '—'}</p>
    </div>
  )
}

export function EleveDetailDialog({
  eleveCode,
  open,
  onOpenChange,
}: {
  eleveCode: string | null
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const eleve = eleves.find((e) => e.code === eleveCode)

  if (!eleve) {
    return (
      <Modal open={open} onOpenChange={onOpenChange} title="Fiche élève" size="xl">
        <div className="py-12 text-center text-sm text-muted-foreground">
          Aucun élève sélectionné.
        </div>
      </Modal>
    )
  }

  const eleveSeances = seances.filter((s) => s.eleveCode === eleve.code)
  const eleveExamens = examens.filter((x) => x.eleveCode === eleve.code)
  const eleveFactures = factures.filter((f) => f.eleveCode === eleve.code)

  const progressPct = eleve.seancesTotales > 0 ? Math.round((eleve.seancesFaites / eleve.seancesTotales) * 100) : 0
  const nomComplet = `${eleve.prenom} ${eleve.nom}`

  const formatDate = (d: string) => {
    if (!d) return '—'
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
      const date = new Date(d)
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
    }
    return d
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Fiche élève"
      size="xl"
      footer={
        <>
          <button
            onClick={() => onOpenChange(false)}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-input bg-background px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Fermer
          </button>
          <button
            onClick={() => onOpenChange(false)}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Pencil className="h-4 w-4" />
            Modifier
          </button>
        </>
      }
    >
      <div className="space-y-5">
        {/* En-tête : avatar + identité + statut */}
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
            {initials(nomComplet)}
          </div>
          <div className="flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-bold text-foreground">{nomComplet}</h2>
              <StatusBadge label={eleve.statut} tone={statutEleveTone(eleve.statut)} />
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="font-mono text-foreground">{eleve.code}</span>
              <span>·</span>
              <span>Permis {eleve.typePermis}</span>
              <span>·</span>
              <span>Inscrit le {eleve.dateInscription}</span>
            </div>
          </div>
        </div>

        {/* Barre de progression séances */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Progression des séances</p>
            <p className="text-sm font-semibold text-primary">
              {eleve.seancesFaites} / {eleve.seancesTotales} séances
            </p>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">{progressPct}% du programme réalisé</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="infos" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="infos">Informations</TabsTrigger>
            <TabsTrigger value="seances">Séances</TabsTrigger>
            <TabsTrigger value="examens">Examens</TabsTrigger>
            <TabsTrigger value="factures">Factures</TabsTrigger>
          </TabsList>

          {/* Tab Informations */}
          <TabsContent value="infos" className="mt-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                <InfoRow label="Nom" value={eleve.nom} />
                <InfoRow label="Prénom" value={eleve.prenom} />
                <InfoRow label="Téléphone" value={eleve.telephone} />
                <InfoRow label="Email" value={eleve.email} />
                <InfoRow label="Date de naissance" value={formatDate(eleve.dateNaissance)} />
                <InfoRow label="Lieu de naissance" value={eleve.lieuNaissance} />
                <InfoRow label="Sexe" value={eleve.sexe === 'F' ? 'Féminin' : 'Masculin'} />
                <InfoRow label="Nationalité" value={eleve.nationalite} />
                <InfoRow label="Type de pièce" value={eleve.typePiece} />
                <InfoRow label="Numéro de pièce" value={eleve.numPiece} />
                <InfoRow label="Type de permis" value={eleve.typePermis} />
                <InfoRow label="Moniteur" value={eleve.moniteur} />
                <InfoRow label="Parrainé" value={eleve.estParraine ? 'Oui' : 'Non'} />
                {eleve.estParraine && <InfoRow label="Parrain" value={eleve.parrainNom} />}
              </div>
            </div>
          </TabsContent>

          {/* Tab Séances */}
          <TabsContent value="seances" className="mt-4">
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="max-h-80 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-muted/60 backdrop-blur">
                    <tr className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-3 text-left">Date</th>
                      <th className="px-4 py-3 text-left">Horaire</th>
                      <th className="px-4 py-3 text-left">Moniteur</th>
                      <th className="px-4 py-3 text-left">Véhicule</th>
                      <th className="px-4 py-3 text-left">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {eleveSeances.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                          Aucune séance enregistrée.
                        </td>
                      </tr>
                    ) : (
                      eleveSeances.map((s) => (
                        <tr key={s.id} className="hover:bg-muted/30">
                          <td className="whitespace-nowrap px-4 py-3 text-foreground">{formatDate(s.date)}</td>
                          <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                            {s.heureDebut} – {s.heureFin}
                          </td>
                          <td className="px-4 py-3 text-foreground">{s.moniteur}</td>
                          <td className="px-4 py-3 text-muted-foreground">{s.vehicule}</td>
                          <td className="px-4 py-3">
                            <StatusBadge label={s.statut} tone={statutSeanceTone(s.statut)} />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Tab Examens */}
          <TabsContent value="examens" className="mt-4">
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="max-h-80 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-muted/60 backdrop-blur">
                    <tr className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-3 text-left">Type</th>
                      <th className="px-4 py-3 text-left">Date</th>
                      <th className="px-4 py-3 text-left">Inspecteur</th>
                      <th className="px-4 py-3 text-left">Résultat</th>
                      <th className="px-4 py-3 text-left">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {eleveExamens.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                          Aucun examen enregistré.
                        </td>
                      </tr>
                    ) : (
                      eleveExamens.map((x) => (
                        <tr key={x.id} className="hover:bg-muted/30">
                          <td className="whitespace-nowrap px-4 py-3 text-foreground">
                            {x.typeExamen} ({x.typePermis})
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{x.dateExamen}</td>
                          <td className="px-4 py-3 text-foreground">{x.inspecteur}</td>
                          <td className="px-4 py-3">
                            <StatusBadge label={x.resultat} tone={resultatExamenTone(x.resultat)} />
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{x.notes || '—'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Tab Factures */}
          <TabsContent value="factures" className="mt-4">
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="max-h-80 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-muted/60 backdrop-blur">
                    <tr className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-3 text-left">Numéro</th>
                      <th className="px-4 py-3 text-right">Montant</th>
                      <th className="px-4 py-3 text-right">Payé</th>
                      <th className="px-4 py-3 text-right">Reste</th>
                      <th className="px-4 py-3 text-left">Statut</th>
                      <th className="px-4 py-3 text-left">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {eleveFactures.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                          Aucune facture enregistrée.
                        </td>
                      </tr>
                    ) : (
                      eleveFactures.map((f) => (
                        <tr key={f.id} className="hover:bg-muted/30">
                          <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-foreground">{f.numero}</td>
                          <td className="whitespace-nowrap px-4 py-3 text-right font-medium text-foreground">{formatXOF(f.montant)}</td>
                          <td className="whitespace-nowrap px-4 py-3 text-right text-emerald-600">{formatXOF(f.paye)}</td>
                          <td className="whitespace-nowrap px-4 py-3 text-right text-rose-600">{formatXOF(f.reste)}</td>
                          <td className="px-4 py-3">
                            <StatusBadge label={f.statut} tone={statutFactureTone(f.statut)} />
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{f.dateEmission}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Modal>
  )
}
