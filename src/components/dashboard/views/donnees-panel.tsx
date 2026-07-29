'use client'

import { useRef, useState } from 'react'
import {
  AlertTriangle,
  Database,
  Download,
  Loader2,
  Trash2,
  Upload,
} from 'lucide-react'
import { toast } from 'sonner'
import { Card } from '@/components/dashboard/views/shared'
import { FormInput } from '@/components/dashboard/modal'
import { syncDataFromSupabase } from '@/lib/supabase/sync-data'
import { useNavStore } from '@/store/nav-store'
import { canPerformAction } from '@/lib/permissions'
import { useAuthStore } from '@/store/auth-store'
import { backupFilename } from '@/lib/backup/platform-backup'

const WIPE_PHRASE = 'SUPPRIMER'
const RESTORE_PHRASE = 'RESTAURER'

type ResetResponse = {
  ok?: boolean
  deleted?: Record<string, number>
  storageRemoved?: number
  storageWarnings?: string[]
  error?: string
}

type ImportResponse = {
  ok?: boolean
  imported?: Record<string, number>
  error?: string
}

export function DonneesPanel() {
  const user = useAuthStore((s) => s.user)
  const role = user?.mode === 'admin' ? user.role : ''
  const canExport = canPerformAction(role, 'export_backup')
  const canImport = canPerformAction(role, 'import_backup')
  const canReset = canPerformAction(role, 'reset_platform')

  const fileInputRef = useRef<HTMLInputElement>(null)

  const [exporting, setExporting] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [restoreConfirmation, setRestoreConfirmation] = useState('')
  const [importing, setImporting] = useState(false)

  const [wipeConfirmation, setWipeConfirmation] = useState('')
  const [wiping, setWiping] = useState(false)

  if (!canExport && !canImport && !canReset) return null

  const restoreOk = restoreConfirmation.trim() === RESTORE_PHRASE
  const wipeOk = wipeConfirmation.trim() === WIPE_PHRASE

  const handleExport = async () => {
    if (exporting) return
    setExporting(true)
    try {
      const res = await fetch('/api/admin/backup/export')
      if (!res.ok) {
        const json = (await res.json().catch(() => ({}))) as { error?: string }
        toast.error(json.error ?? 'Export impossible')
        return
      }
      const blob = await res.blob()
      const disposition = res.headers.get('Content-Disposition')
      const match = disposition?.match(/filename="([^"]+)"/)
      const name = match?.[1] ?? backupFilename()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = name
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      toast.success('Sauvegarde téléchargée.')
    } catch {
      toast.error('Erreur réseau lors de l’export')
    } finally {
      setExporting(false)
    }
  }

  const handleImport = async () => {
    if (!restoreOk || !importFile || importing) return
    setImporting(true)
    try {
      const form = new FormData()
      form.set('confirmation', RESTORE_PHRASE)
      form.set('file', importFile)
      const res = await fetch('/api/admin/backup/import', {
        method: 'POST',
        body: form,
      })
      const json = (await res.json()) as ImportResponse
      if (!res.ok) {
        toast.error(json.error ?? 'Restauration impossible')
        return
      }

      useNavStore.getState().setSelectedEleveCode(null)
      await syncDataFromSupabase()
      setImportFile(null)
      setRestoreConfirmation('')
      if (fileInputRef.current) fileInputRef.current.value = ''

      const eleves = json.imported?.eleves ?? 0
      const factures = json.imported?.factures ?? 0
      toast.success(
        `Sauvegarde restaurée : ${eleves} élève(s), ${factures} facture(s) réimportés.`,
      )
    } catch {
      toast.error('Erreur réseau lors de l’import')
    } finally {
      setImporting(false)
    }
  }

  const handleWipe = async () => {
    if (!wipeOk || wiping) return
    setWiping(true)
    try {
      const res = await fetch('/api/admin/reset-platform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmation: WIPE_PHRASE }),
      })
      const json = (await res.json()) as ResetResponse
      if (!res.ok) {
        toast.error(json.error ?? 'Échec de la purge des données')
        return
      }

      useNavStore.getState().setSelectedEleveCode(null)
      await syncDataFromSupabase()
      setWipeConfirmation('')

      const eleves = json.deleted?.eleves ?? 0
      const factures = json.deleted?.factures ?? 0
      const storage = json.storageRemoved ?? 0
      toast.success(
        `Plateforme réinitialisée : ${eleves} élève(s), ${factures} facture(s) supprimés` +
          (storage > 0 ? `, ${storage} fichier(s) Storage` : '') +
          '.',
      )
      if (json.storageWarnings?.length) {
        toast.warning(
          `Données purgées, mais Storage partiel : ${json.storageWarnings.slice(0, 2).join(' · ')}`,
        )
      }
    } catch {
      toast.error('Erreur réseau lors de la purge')
    } finally {
      setWiping(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Export ── */}
      {canExport && (
        <Card>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Download className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Exporter une sauvegarde
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Télécharge un fichier JSON de toutes les données métier et du catalogue.
                  Les comptes utilisateurs ne sont pas inclus. Les fichiers médias (photos CNI,
                  justificatifs) restent dans Storage et ne sont pas emballés dans le JSON.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => void handleExport()}
              disabled={exporting}
              className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {exporting ? 'Export…' : 'Télécharger .json'}
            </button>
          </div>
        </Card>
      )}

      {/* ── Import ── */}
      {canImport && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <div className="flex flex-col gap-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-400">
                <Upload className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Importer une sauvegarde
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Remplace les données actuelles (élèves, factures, catalogue, FAQ…) par le
                  contenu du fichier. Les comptes staff sont conservés. Action irréversible.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Fichier .json</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                disabled={importing}
                onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
                className="block w-full max-w-lg text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-muted file:px-3 file:py-2 file:text-sm file:font-medium file:text-foreground hover:file:bg-muted/80"
              />
              {importFile && (
                <p className="text-xs text-muted-foreground">
                  Sélectionné : {importFile.name} ({Math.round(importFile.size / 1024)} Ko)
                </p>
              )}
            </div>

            <div className="space-y-2 border-t border-amber-500/20 pt-4">
              <label className="text-sm font-medium text-foreground">
                Pour confirmer, tapez{' '}
                <span className="font-mono font-semibold text-amber-700 dark:text-amber-400">
                  {RESTORE_PHRASE}
                </span>
              </label>
              <FormInput
                value={restoreConfirmation}
                onChange={(e) => setRestoreConfirmation(e.target.value)}
                placeholder={RESTORE_PHRASE}
                autoComplete="off"
                disabled={importing}
                className="max-w-sm font-mono"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => void handleImport()}
                disabled={!restoreOk || !importFile || importing}
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-amber-600 px-3 text-sm font-semibold text-white transition-colors hover:bg-amber-600/90 disabled:pointer-events-none disabled:opacity-50"
              >
                {importing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {importing ? 'Restauration…' : 'Restaurer depuis le fichier'}
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* ── Zone dangereuse ── */}
      {canReset && (
        <Card className="border-destructive/40 bg-destructive/5">
          <div className="flex flex-col gap-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-destructive/15 text-destructive">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">Zone dangereuse</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Supprime définitivement toutes les données métier de la plateforme, sans
                  restauration. Exportez une sauvegarde avant si besoin.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-destructive/25 bg-background/80 p-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-destructive">
                  Sera effacé
                </p>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li>Élèves, inscriptions, séances, examens</li>
                  <li>Bordereaux, factures, paiements, dépenses</li>
                  <li>Moniteurs, véhicules, inspecteurs</li>
                  <li>Journal d&apos;audit et fichiers médias</li>
                </ul>
              </div>
              <div className="rounded-lg border border-border bg-background/80 p-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Conservé
                </p>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li>Comptes utilisateurs (équipe)</li>
                  <li>Types de permis et formations</li>
                  <li>Modes de paiement et catégories</li>
                  <li>FAQ / assistance</li>
                </ul>
              </div>
            </div>

            <div className="space-y-2 border-t border-destructive/20 pt-4">
              <label className="text-sm font-medium text-foreground">
                Pour confirmer, tapez{' '}
                <span className="font-mono font-semibold text-destructive">{WIPE_PHRASE}</span>
              </label>
              <FormInput
                value={wipeConfirmation}
                onChange={(e) => setWipeConfirmation(e.target.value)}
                placeholder={WIPE_PHRASE}
                autoComplete="off"
                disabled={wiping}
                className="max-w-sm font-mono"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => void handleWipe()}
                disabled={!wipeOk || wiping}
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-destructive px-3 text-sm font-semibold text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:pointer-events-none disabled:opacity-50"
              >
                {wiping ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                {wiping ? 'Purge en cours…' : 'Effacer toutes les données'}
              </button>
            </div>
          </div>
        </Card>
      )}

      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <Database className="h-3.5 w-3.5" />
        Réservé au Super Administrateur — format <code className="font-mono">sarah-auto-backup</code>{' '}
        v1.
      </p>
    </div>
  )
}
