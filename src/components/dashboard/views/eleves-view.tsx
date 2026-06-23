'use client'

import { useMemo, useState } from 'react'
import { useRef } from 'react'
import {
  Plus,
  Search,
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  Users,
  GraduationCap,
  Award,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Gift,
  ShieldOff,
  ShieldCheck,
  Upload,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { type StatutEleve } from '@/lib/domain/types'
import { canPerformAction } from '@/lib/permissions'
import { useDataStore } from '@/store/data-store'
import { useAuthStore } from '@/store/auth-store'
import { useNavStore } from '@/store/nav-store'
import {
  ViewHeader,
  StatusBadge,
  ActionButton,
  Card,
  formatXOF,
  initials,
  KpiCard,
  statutEleveTone,
} from '@/components/dashboard/views/shared'
import {
  ResponsiveDataView,
  MobileListCard,
  MobileListCardRow,
} from '@/components/dashboard/responsive-data-view'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

type StatutFiltre = 'Tous' | StatutEleve

const STATUT_FILTRES: StatutFiltre[] = [
  'Tous',
  'Prospect',
  'Inscrit',
  'En formation',
  'Examen',
  'Admis',
  'Ajourné',
  'Terminé',
  'Abandon',
]

type CsvRow = { nom: string; prenom: string; telephone: string; typePermis: string; email: string; adresse: string; valid: boolean; error: string }

function parseElevesCsv(text: string): CsvRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim())
  if (lines.length === 0) return []
  // Detect if first line is header
  const firstLower = lines[0].toLowerCase()
  const hasHeader = firstLower.includes('nom') || firstLower.includes('prenom') || firstLower.includes('prénom')
  const dataLines = hasHeader ? lines.slice(1) : lines
  return dataLines.map((line) => {
    const cols = line.split(/[;,\t]/).map((c) => c.trim().replace(/^["']|["']$/g, ''))
    const [nom = '', prenom = '', telephone = '', typePermis = 'B', email = '', adresse = ''] = cols
    const valid = nom.length >= 2 && prenom.length >= 2 && telephone.length >= 8
    return {
      nom,
      prenom,
      telephone,
      typePermis: typePermis || 'B',
      email,
      adresse,
      valid,
      error: !valid ? 'Nom, prénom ou téléphone manquant' : '',
    }
  })
}

export function ElevesView() {
  const eleves = useDataStore((s) => s.eleves)
  const examens = useDataStore((s) => s.examens)
  const { setActiveView, setselectedEleveCode } = useNavStore()
  const [recherche, setRecherche] = useState('')
  const [statutFiltre, setStatutFiltre] = useState<StatutFiltre>('Tous')
  const [page, setPage] = useState(1)

  const [deleteEleveId, setDeleteEleveId] = useState<string | null>(null)
  const deleteEleve = useDataStore((s) => s.deleteEleve)
  const addEleve = useDataStore((s) => s.addEleve)
  const updateEleve = useDataStore((s) => s.updateEleve)
  const user = useAuthStore((s) => s.user)
  const canDeleteEleve = canPerformAction(user?.mode === 'admin' ? user.role : '', 'delete_eleve')

  // CSV import
  const csvInputRef = useRef<HTMLInputElement>(null)
  const [csvRows, setCsvRows] = useState<CsvRow[]>([])
  const [showCsvPreview, setShowCsvPreview] = useState(false)
  const [csvImporting, setCsvImporting] = useState(false)

  const handleCsvFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const rows = parseElevesCsv(text)
      if (rows.length === 0) { toast.error('Fichier CSV vide ou non reconnu.'); return }
      setCsvRows(rows)
      setShowCsvPreview(true)
    }
    reader.readAsText(file, 'UTF-8')
    e.target.value = ''
  }

  const handleCsvImport = async () => {
    const valid = csvRows.filter((r) => r.valid)
    if (valid.length === 0) { toast.error('Aucune ligne valide à importer.'); return }
    setCsvImporting(true)
    for (const row of valid) {
      addEleve({
        nom: row.nom,
        prenom: row.prenom,
        telephone: row.telephone,
        typePermis: row.typePermis,
        email: row.email,
        adresse: row.adresse,
        sexe: 'M',
        nationalite: 'Ivoirienne',
        dateNaissance: '',
        lieuNaissance: '',
        typePiece: 'CNI',
        numPiece: '',
      })
    }
    setCsvImporting(false)
    setShowCsvPreview(false)
    setCsvRows([])
    toast.success(`${valid.length} élève${valid.length > 1 ? 's' : ''} importé${valid.length > 1 ? 's' : ''} avec succès.`)
  }

  const toggleAccesPportail = (id: string, nom: string, current: boolean) => {
    updateEleve(id, { accesPortail: !current })
    toast.success(!current ? `Accès apprenant activé pour ${nom}.` : `Accès apprenant désactivé pour ${nom}.`)
  }

  const elevesFiltres = useMemo(() => {
    return eleves.filter((e) => {
      const matchStatut = statutFiltre === 'Tous' || e.statut === statutFiltre
      const q = recherche.trim().toLowerCase()
      const matchRecherche =
        q === '' ||
        `${e.nom} ${e.prenom}`.toLowerCase().includes(q) ||
        e.code.toLowerCase().includes(q) ||
        e.telephone.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.typePermis.toLowerCase().includes(q)
      return matchStatut && matchRecherche
    })
  }, [eleves, recherche, statutFiltre])

  const totalEleves = eleves.length
  const enFormation = eleves.filter((e) => e.statut === 'En formation').length
  const admis = eleves.filter((e) => e.statut === 'Admis').length
  const examensTermines = examens.filter((x) => x.resultat !== 'En attente')
  const tauxReussite = examensTermines.length > 0
    ? Math.round((examensTermines.filter((x) => x.resultat === 'Admis').length / examensTermines.length) * 1000) / 10
    : null
  const parPage = 8
  const totalPages = Math.max(1, Math.ceil(elevesFiltres.length / parPage))
  const pageCourante = Math.min(page, totalPages)
  const debut = (pageCourante - 1) * parPage
  const elevesPage = elevesFiltres.slice(debut, debut + parPage)

  return (
    <div>
      <ViewHeader
        title="Élèves"
        description="Registre central des apprenants — du prospect à l'admis"
        actions={
          <div className="flex items-center gap-2">
            <input ref={csvInputRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleCsvFile} />
            <ActionButton variant="outline" onClick={() => csvInputRef.current?.click()}>
              <Upload className="h-4 w-4" />
              Importer CSV
            </ActionButton>
            <ActionButton variant="primary" onClick={() => setActiveView('eleve-create')}>
              <Plus className="h-4 w-4" />
              Ajouter un élève
            </ActionButton>
          </div>
        }
      />

      {/* KPI summary row */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total élèves"
          value={String(totalEleves)}
          icon={<Users className="h-5 w-5" />}
          tone="primary"
        />
        <KpiCard
          label="En formation"
          value={String(enFormation)}
          icon={<GraduationCap className="h-5 w-5" />}
          tone="secondary"
        />
        <KpiCard
          label="Admis ce mois"
          value={String(admis)}
          icon={<Award className="h-5 w-5" />}
          tone="success"
        />
        <KpiCard
          label="Taux réussite"
          value={tauxReussite !== null ? `${tauxReussite.toString().replace('.', ',')} %` : '—'}
          icon={<TrendingUp className="h-5 w-5" />}
          tone="warning"
        />
      </div>

      {/* Toolbar */}
      <Card className="mb-4 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={recherche}
              onChange={(e) => {
                setRecherche(e.target.value)
                setPage(1)
              }}
              placeholder="Rechercher un élève..."
              className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
            />
          </div>

          <div className="custom-scrollbar -mx-1 flex items-center gap-1.5 overflow-x-auto px-1 pb-1 lg:pb-0">
            {STATUT_FILTRES.map((s) => {
              const actif = statutFiltre === s
              return (
                <button
                  key={s}
                  onClick={() => {
                    setStatutFiltre(s)
                    setPage(1)
                  }}
                  className={
                    actif
                      ? 'h-8 shrink-0 rounded-full bg-primary px-3 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90'
                      : 'h-8 shrink-0 rounded-full border border-border bg-background px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
                  }
                >
                  {s}
                </button>
              )
            })}
          </div>
        </div>
      </Card>

      {/* Table / cartes mobile */}
      <Card className="p-0">
        <ResponsiveDataView
          empty={elevesPage.length === 0}
          emptyState={
            <p className="px-4 py-12 text-center text-sm text-muted-foreground">
              Aucun élève ne correspond à votre recherche.
            </p>
          }
          mobile={elevesPage.map((e) => {
            const nomComplet = `${e.prenom} ${e.nom}`
            const progres = Math.round((e.seancesFaites / e.seancesTotales) * 100)
            return (
              <MobileListCard key={e.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {initials(nomComplet)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-foreground">{nomComplet}</p>
                      <p className="font-mono text-xs text-muted-foreground">{e.code}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        aria-label="Actions"
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                      <DropdownMenuItem
                        onSelect={() => {
                          setselectedEleveCode(e.code)
                          setActiveView('eleve-detail')
                        }}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Voir le détail
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => {
                          setselectedEleveCode(e.code)
                          setActiveView('eleve-edit')
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => toggleAccesPportail(e.id, `${e.prenom} ${e.nom}`, e.accesPortail !== false)}
                      >
                        {e.accesPortail !== false
                          ? <><ShieldOff className="mr-2 h-4 w-4 text-warning" />Désactiver accès</>
                          : <><ShieldCheck className="mr-2 h-4 w-4 text-success" />Activer accès</>}
                      </DropdownMenuItem>
                      {canDeleteEleve && (
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onSelect={() => setDeleteEleveId(e.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="mt-3 space-y-1 border-t border-border pt-3">
                  <MobileListCardRow label="Statut">
                    <StatusBadge label={e.statut} tone={statutEleveTone[e.statut]} />
                  </MobileListCardRow>
                  <MobileListCardRow label="Permis">{e.typePermis}</MobileListCardRow>
                  <MobileListCardRow label="Séances">
                    {e.seancesFaites}/{e.seancesTotales} ({progres}%)
                  </MobileListCardRow>
                  <MobileListCardRow label="Solde">
                    {e.solde > 0 ? (
                      <span className="font-semibold text-destructive">{formatXOF(e.solde)}</span>
                    ) : (
                      <span className="text-success">Soldé</span>
                    )}
                  </MobileListCardRow>
                  <MobileListCardRow label="Téléphone">{e.telephone}</MobileListCardRow>
                </div>
              </MobileListCard>
            )
          })}
          desktop={
            <div className="custom-scrollbar overflow-x-auto">
              <table className="w-full min-w-[1100px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Code dossier
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Élève
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Téléphone
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Type permis
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Statut
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Séances
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Solde
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Parrainé
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Moniteur
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {elevesPage.map((e) => {
                const nomComplet = `${e.prenom} ${e.nom}`
                const progres = Math.round((e.seancesFaites / e.seancesTotales) * 100)
                return (
                  <tr key={e.id} className="transition-colors hover:bg-muted/40">
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-medium text-muted-foreground">
                      {e.code}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {initials(nomComplet)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-foreground">{nomComplet}</p>
                          <p className="truncate text-xs text-muted-foreground">{e.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {e.telephone}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex h-7 min-w-8 items-center justify-center rounded-md bg-muted px-2 text-xs font-bold text-foreground">
                        {e.typePermis}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge label={e.statut} tone={statutEleveTone[e.statut]} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-medium text-foreground">
                          {e.seancesFaites} / {e.seancesTotales}
                        </span>
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${progres}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      {e.solde > 0 ? (
                        <span className="font-semibold text-destructive">{formatXOF(e.solde)}</span>
                      ) : (
                        <span className="text-xs font-medium text-success">Soldé</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {e.estParraine ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                          <Gift className="h-3 w-3" />
                          {e.parrainNom}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {e.moniteur}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            aria-label="Actions"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                          <DropdownMenuItem
                            onSelect={() => {
                              setselectedEleveCode(e.code)
                              setActiveView('eleve-detail')
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Voir le détail
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => {
                              setselectedEleveCode(e.code)
                              setActiveView('eleve-edit')
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => toggleAccesPportail(e.id, `${e.prenom} ${e.nom}`, e.accesPortail !== false)}
                          >
                            {e.accesPortail !== false
                              ? <><ShieldOff className="mr-2 h-4 w-4 text-warning" />Désactiver accès</>
                              : <><ShieldCheck className="mr-2 h-4 w-4 text-success" />Activer accès</>}
                          </DropdownMenuItem>
                          {canDeleteEleve && (
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onSelect={() => setDeleteEleveId(e.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Supprimer
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                )
              })}

              {elevesPage.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    Aucun élève ne correspond à votre recherche.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
            </div>
          }
        />

        {/* Footer / pagination */}
        <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Affichage de <span className="font-semibold text-foreground">{elevesFiltres.length === 0 ? 0 : debut + 1}</span> à{' '}
            <span className="font-semibold text-foreground">{debut + elevesPage.length}</span> sur{' '}
            <span className="font-semibold text-foreground">{totalEleves}</span> élèves
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={pageCourante <= 1}
              className="inline-flex h-8 items-center gap-1 rounded-md border border-border bg-background px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Précédent
            </button>
            <span className="px-2 text-xs font-medium text-muted-foreground">
              Page <span className="font-semibold text-foreground">{pageCourante}</span> / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={pageCourante >= totalPages}
              className="inline-flex h-8 items-center gap-1 rounded-md border border-border bg-background px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
            >
              Suivant
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Card>


      {/* CSV import preview dialog */}
      <AlertDialog open={showCsvPreview} onOpenChange={(v) => { if (!v) { setShowCsvPreview(false); setCsvRows([]) } }}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Aperçu de l&apos;import CSV</AlertDialogTitle>
            <AlertDialogDescription>
              {csvRows.filter((r) => r.valid).length} ligne{csvRows.filter((r) => r.valid).length > 1 ? 's' : ''} valide{csvRows.filter((r) => r.valid).length > 1 ? 's' : ''} sur {csvRows.length} détectée{csvRows.length > 1 ? 's' : ''}.
              Format attendu : <span className="font-mono text-xs">nom;prenom;telephone;type_permis;email;adresse</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="max-h-72 overflow-y-auto rounded-lg border border-border">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-muted text-muted-foreground">
                <tr>
                  <th className="p-2 text-left">#</th>
                  <th className="p-2 text-left">Nom</th>
                  <th className="p-2 text-left">Prénom</th>
                  <th className="p-2 text-left">Téléphone</th>
                  <th className="p-2 text-left">Permis</th>
                  <th className="p-2 text-center">Statut</th>
                </tr>
              </thead>
              <tbody>
                {csvRows.map((row, i) => (
                  <tr key={i} className={row.valid ? 'even:bg-muted/30' : 'bg-destructive/10'}>
                    <td className="p-2 font-mono text-muted-foreground">{i + 1}</td>
                    <td className="p-2 font-medium">{row.nom || <span className="text-destructive">—</span>}</td>
                    <td className="p-2">{row.prenom || <span className="text-destructive">—</span>}</td>
                    <td className="p-2 font-mono">{row.telephone || <span className="text-destructive">—</span>}</td>
                    <td className="p-2">{row.typePermis}</td>
                    <td className="p-2 text-center">
                      {row.valid
                        ? <CheckCircle2 className="mx-auto h-4 w-4 text-success" />
                        : <span title={row.error}><AlertCircle className="mx-auto h-4 w-4 text-destructive" /></span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCsvImport}
              disabled={csvImporting || csvRows.filter((r) => r.valid).length === 0}
            >
              {csvImporting ? 'Import en cours…' : `Importer ${csvRows.filter((r) => r.valid).length} élève${csvRows.filter((r) => r.valid).length > 1 ? 's' : ''}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={deleteEleveId !== null}
        onOpenChange={(v) => { if (!v) setDeleteEleveId(null) }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet élève ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L&apos;élève sera définitivement retiré du registre,
              ainsi que ses factures, paiements, séances, examens et inscriptions associés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (deleteEleveId) {
                  deleteEleve(deleteEleveId)
                  toast.success('Élève supprimé.')
                  setDeleteEleveId(null)
                }
              }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
