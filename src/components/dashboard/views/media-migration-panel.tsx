'use client'

import { useState } from 'react'
import { HardDriveUpload, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Card, ActionButton } from '@/components/dashboard/views/shared'
import { useDataStore } from '@/store/data-store'
import { migrateInlineMediaToStorage } from '@/lib/supabase/migrate-inline-media'

export function MediaMigrationPanel() {
  const depenses = useDataStore((s) => s.depenses)
  const eleves = useDataStore((s) => s.eleves)
  const updateDepense = useDataStore((s) => s.updateDepense)
  const updateEleve = useDataStore((s) => s.updateEleve)
  const [running, setRunning] = useState(false)

  const inlineCount =
    depenses.filter((d) => d.justificatif.startsWith('data:')).length +
    eleves.filter((e) => e.photoCni.startsWith('data:') || e.photoProfil.startsWith('data:')).length

  const handleMigrate = async () => {
    if (running) return
    setRunning(true)
    try {
      const result = await migrateInlineMediaToStorage(
        depenses,
        eleves,
        (id, justificatif) => updateDepense(id, { justificatif }),
        (id, patch) => updateEleve(id, patch),
      )
      toast.success(
        `Migration terminée : ${result.depensesMigrated} justificatif(s), ${result.elevesMigrated} élève(s).`,
      )
      if (result.errors.length > 0) {
        toast.warning(
          `${result.errors.length} erreur(s) : ${result.errors.slice(0, 2).join(' · ')}`,
        )
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Migration impossible')
    } finally {
      setRunning(false)
    }
  }

  return (
    <Card className="mt-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">Migration médias base64</h2>
          <p className="text-sm text-muted-foreground">
            Déplace les justificatifs et photos encore encodés en base64 vers Supabase Storage.
            {inlineCount > 0 ? ` ${inlineCount} élément(s) détecté(s).` : ' Aucun élément à migrer.'}
          </p>
        </div>
        <ActionButton
          variant="primary"
          onClick={() => void handleMigrate()}
          disabled={running || inlineCount === 0}
        >
          {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <HardDriveUpload className="h-4 w-4" />}
          {running ? 'Migration…' : 'Migrer vers Storage'}
        </ActionButton>
      </div>
    </Card>
  )
}
