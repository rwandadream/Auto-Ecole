'use client'

import { ArrowLeft, Pencil, Phone, Mail, MapPin, Calendar, User, CreditCard, Car, Gift } from 'lucide-react'
import { useDataStore } from '@/store/data-store'
import { useNavStore } from '@/store/nav-store'
import {
  ViewHeader,
  StatusBadge,
  Card,
  initials,
  formatXOF,
  statutEleveTone,
  statutSeanceTone,
  resultatExamenTone,
  statutFactureTone,
  formatDateFr,
} from './shared'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ActionButton } from './shared'

function formatDate(d: string) {
  if (!d) return '—'
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
    const date = new Date(d)
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
  }
  return d
}

function InfoRow({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-background p-3">
      {icon && <span className="mt-0.5 text-muted-foreground">{icon}</span>}
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value || '—'}</p>
      </div>
    </div>
  )
}

export function EleveDetailView({ eleveCode }: { eleveCode: string }) {
  const setActiveView = useNavStore((s) => s.setActiveView)
  const eleves = useDataStore((s) => s.eleves)
  const seances = useDataStore((s) => s.seances)
  const examens = useDataStore((s) => s.examens)
  const factures = useDataStore((s) => s.factures)

  const eleve = eleves.find((e) => e.code === eleveCode)

  if (!eleve) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-sm text-muted-foreground">Aucun élève trouvé.</p>
        <ActionButton variant="outline" onClick={() => setActiveView('eleves')}>
          <ArrowLeft className="h-4 w-4" />
          Retour à la liste
        </ActionButton>
      </div>
    )
  }

  const eleveSeances = seances.filter((s) => s.eleveCode === eleve.code)
  const eleveExamens = examens.filter((x) => x.eleveCode === eleve.code)
  const eleveFactures = factures.filter((f) => f.eleveCode === eleve.code)
  const progressPct = eleve.seancesTotales > 0 ? Math.round((eleve.seancesFaites / eleve.seancesTotales) * 100) : 0
  const nomComplet = `${eleve.prenom} ${eleve.nom}`
  const totalPaye = eleveFactures.reduce((sum, f) => sum + f.paye, 0)
  const totalReste = eleveFactures.reduce((sum, f) => sum + f.reste, 0)

  return (
    <div>
      {/* Back button + actions */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => setActiveView('eleves')}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-input bg-background px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la liste
        </button>
        <ActionButton variant="primary" onClick={() => setActiveView('eleves')}>
          <Pencil className="h-4 w-4" />
          Modifier
        </ActionButton>
      </div>

      {/* En-tête : avatar + identité + statut */}
      <Card className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-2xl font-bold text-primary">
            {initials(nomComplet)}
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{nomComplet}</h1>
              <StatusBadge label={eleve.statut} tone={statutEleveTone[eleve.statut]} />
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
      </Card>

      {/* KPIs élève */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Séances</p>
          <p className="mt-1 text-2xl font-bold text-primary">
            {eleve.seancesFaites}<span className="text-base font-normal text-muted-foreground"> / {eleve.seancesTotales}</span>
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Examens passés</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{eleveExamens.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total payé</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">{formatXOF(totalPaye)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Reste à payer</p>
          <p className="mt-1 text-2xl font-bold text-rose-600">{formatXOF(totalReste)}</p>
        </Card>
      </div>

      {/* Barre de progression */}
      <Card className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">Progression des séances</p>
          <p className="text-sm font-semibold text-primary">
            {eleve.seancesFaites} / {eleve.seancesTotales} séances ({progressPct}%)
          </p>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">{progressPct}% du programme réalisé</p>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="infos" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="infos">Informations</TabsTrigger>
          <TabsTrigger value="seances">Séances ({eleveSeances.length})</TabsTrigger>
          <TabsTrigger value="examens">Examens ({eleveExamens.length})</TabsTrigger>
          <TabsTrigger value="factures">Factures ({eleveFactures.length})</TabsTrigger>
        </TabsList>

        {/* Tab Informations */}
        <TabsContent value="infos" className="mt-4">
          <Card>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Identité
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <InfoRow label="Nom" value={eleve.nom} icon={<User className="h-4 w-4" />} />
              <InfoRow label="Prénom" value={eleve.prenom} icon={<User className="h-4 w-4" />} />
              <InfoRow label="Téléphone" value={eleve.telephone} icon={<Phone className="h-4 w-4" />} />
              <InfoRow label="Email" value={eleve.email} icon={<Mail className="h-4 w-4" />} />
              <InfoRow label="Date de naissance" value={formatDate(eleve.dateNaissance)} icon={<Calendar className="h-4 w-4" />} />
              <InfoRow label="Lieu de naissance" value={eleve.lieuNaissance} icon={<MapPin className="h-4 w-4" />} />
              <InfoRow label="Sexe" value={eleve.sexe === 'F' ? 'Féminin' : 'Masculin'} icon={<User className="h-4 w-4" />} />
              <InfoRow label="Nationalité" value={eleve.nationalite} icon={<User className="h-4 w-4" />} />
              <InfoRow label="Type de pièce" value={eleve.typePiece} icon={<CreditCard className="h-4 w-4" />} />
              <InfoRow label="Numéro de pièce" value={eleve.numPiece} icon={<CreditCard className="h-4 w-4" />} />
            </div>

            <h3 className="mb-4 mt-6 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Formation
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <InfoRow label="Type de permis" value={eleve.typePermis} icon={<Car className="h-4 w-4" />} />
              <InfoRow label="Moniteur assigné" value={eleve.moniteur} icon={<User className="h-4 w-4" />} />
              <InfoRow label="Date d'inscription" value={eleve.dateInscription} icon={<Calendar className="h-4 w-4" />} />
            </div>

            <h3 className="mb-4 mt-6 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Parrainage
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <InfoRow label="Parrainé" value={eleve.estParraine ? 'Oui' : 'Non'} icon={<Gift className="h-4 w-4" />} />
              {eleve.estParraine && <InfoRow label="Parrain" value={eleve.parrainNom} icon={<User className="h-4 w-4" />} />}
            </div>
          </Card>
        </TabsContent>

        {/* Tab Séances */}
        <TabsContent value="seances" className="mt-4">
          <Card className="p-0">
            <div className="custom-scrollbar max-h-[500px] overflow-auto">
              <table className="w-full min-w-[700px] text-sm">
                <thead className="sticky top-0 z-10 bg-card">
                  <tr className="border-b border-border text-left">
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Horaire</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Moniteur</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Véhicule</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {eleveSeances.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">
                        Aucune séance enregistrée.
                      </td>
                    </tr>
                  ) : (
                    eleveSeances.map((s) => (
                      <tr key={s.id} className="hover:bg-muted/40">
                        <td className="whitespace-nowrap px-4 py-3 text-foreground">{formatDateFr(s.date, { withYear: true })}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                          {s.heureDebut} – {s.heureFin}
                        </td>
                        <td className="px-4 py-3 text-foreground">{s.moniteur}</td>
                        <td className="px-4 py-3 text-muted-foreground">{s.vehicule}</td>
                        <td className="px-4 py-3">
                          <StatusBadge label={s.statut} tone={statutSeanceTone[s.statut]} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Tab Examens */}
        <TabsContent value="examens" className="mt-4">
          <Card className="p-0">
            <div className="custom-scrollbar max-h-[500px] overflow-auto">
              <table className="w-full min-w-[700px] text-sm">
                <thead className="sticky top-0 z-10 bg-card">
                  <tr className="border-b border-border text-left">
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Inspecteur</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Résultat</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {eleveExamens.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">
                        Aucun examen enregistré.
                      </td>
                    </tr>
                  ) : (
                    eleveExamens.map((x) => (
                      <tr key={x.id} className="hover:bg-muted/40">
                        <td className="whitespace-nowrap px-4 py-3 text-foreground">
                          {x.typeExamen} ({x.typePermis})
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{x.dateExamen}</td>
                        <td className="px-4 py-3 text-foreground">{x.inspecteur}</td>
                        <td className="px-4 py-3">
                          <StatusBadge label={x.resultat} tone={resultatExamenTone[x.resultat]} />
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{x.notes || '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Tab Factures */}
        <TabsContent value="factures" className="mt-4">
          <Card className="p-0">
            <div className="custom-scrollbar max-h-[500px] overflow-auto">
              <table className="w-full min-w-[800px] text-sm">
                <thead className="sticky top-0 z-10 bg-card">
                  <tr className="border-b border-border text-left">
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Numéro</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Formation</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Montant</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Payé</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Reste</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Statut</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {eleveFactures.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">
                        Aucune facture enregistrée.
                      </td>
                    </tr>
                  ) : (
                    eleveFactures.map((f) => (
                      <tr key={f.id} className="hover:bg-muted/40">
                        <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-foreground">{f.numero}</td>
                        <td className="px-4 py-3 text-muted-foreground">{f.formation}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-right font-medium text-foreground">{formatXOF(f.montant)}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-emerald-600">{formatXOF(f.paye)}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-rose-600">{formatXOF(f.reste)}</td>
                        <td className="px-4 py-3">
                          <StatusBadge label={f.statut} tone={statutFactureTone[f.statut]} />
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{f.dateEmission}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
