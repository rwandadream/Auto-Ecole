'use client'

import { useState } from 'react'
import { Plus, Save } from 'lucide-react'
import { toast } from 'sonner'
import { Modal, ModalCancelButton, ModalPrimaryButton, Field, FormInput, FormSelect } from '@/components/dashboard/modal'
import { useDataStore } from '@/store/data-store'
import { CATEGORIES_DEPENSE, MODES_PAIEMENT } from '@/lib/constants'
import { formatXOF, todayFrShort } from '@/lib/format'
// MODES_PAIEMENT / CATEGORIES_DEPENSE are fallbacks when DB tables not yet synced
import { readImageAsBase64, MAX_IMAGE_BYTES } from '@/lib/image-utils'
import { uploadMedia } from '@/lib/supabase/storage'
import { createClient } from '@/lib/supabase/client'
import type { CategorieDepense, ModePaiement } from '@/lib/domain/types'

type Props = {
  open: boolean
  onOpenChange: (v: boolean) => void
  depenseId?: string | null
}

export function DepenseDialog({ open, onOpenChange, depenseId = null }: Props) {
  const addDepense = useDataStore((s) => s.addDepense)
  const updateDepense = useDataStore((s) => s.updateDepense)
  const depenses = useDataStore((s) => s.depenses)
  const vehiculesList = useDataStore((s) => s.vehicules)
  const modesPaiement = useDataStore((s) => s.modesPaiement)
  const categoriesDepense = useDataStore((s) => s.categoriesDepense)
  const modeOpts = modesPaiement.length > 0 ? modesPaiement.map((m) => m.label) : MODES_PAIEMENT
  const catOpts = categoriesDepense.length > 0 ? categoriesDepense.map((c) => c.label) : CATEGORIES_DEPENSE

  const today = todayFrShort()
  const isEdit = !!depenseId

  const [categorie, setCategorie] = useState<CategorieDepense>('Carburant')
  const [description, setDescription] = useState('')
  const [montant, setMontant] = useState<number>(0)
  const [modePaiement, setModePaiement] = useState<ModePaiement>('Espèces')
  const [vehicule, setVehicule] = useState('—')
  const [date, setDate] = useState(today)
  const [justificatif, setJustificatif] = useState('')
  const [uploading, setUploading] = useState(false)

  const [prevOpen, setPrevOpen] = useState(false)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      if (depenseId) {
        const target = depenses.find((d) => d.id === depenseId)
        if (target) {
          setCategorie(target.categorie)
          setDescription(target.description)
          setMontant(target.montant)
          setModePaiement(target.modePaiement)
          setVehicule(target.vehicule)
          setDate(target.date)
          setJustificatif(target.justificatif ?? '')
        }
      } else {
        setCategorie('Carburant')
        setDescription('')
        setMontant(0)
        setModePaiement('Espèces')
        setVehicule('—')
        setDate(today)
        setJustificatif('')
      }
    }
  }

  const reset = () => {
    setCategorie('Carburant')
    setDescription('')
    setMontant(0)
    setModePaiement('Espèces')
    setVehicule('—')
    setDate(today)
    setJustificatif('')
  }

  const handleCancel = () => {
    reset()
    onOpenChange(false)
  }

  const handleSubmit = () => {
    if (!description.trim() || montant <= 0) {
      toast.error('Veuillez renseigner la description et un montant valide.')
      return
    }
    const payload = {
      categorie,
      description: description.trim(),
      montant,
      modePaiement,
      vehicule,
      date,
      justificatif,
    }
    if (isEdit && depenseId) {
      updateDepense(depenseId, payload)
      toast.success(`Dépense « ${description} » modifiée (${formatXOF(montant)}).`)
    } else {
      addDepense(payload)
      toast.success(`Dépense « ${description} » enregistrée (${formatXOF(montant)}).`)
    }
    reset()
    onOpenChange(false)
  }

  const handleJustificatifUpload = async (file: File) => {
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error('Fichier trop volumineux (max 500 Ko)')
      return
    }
    setUploading(true)
    try {
      const folder = depenseId ?? crypto.randomUUID()
      const safeName = file.name.replace(/\s+/g, '_')
      const path = `${folder}/${Date.now()}-${safeName}`

      const { data: { user } } = await createClient().auth.getUser()
      if (user) {
        const ref = await uploadMedia('justificatifs', path, file)
        setJustificatif(ref)
      } else {
        setJustificatif(await readImageAsBase64(file))
      }
      toast.success('Justificatif attaché')
    } catch (err) {
      if (err instanceof Error && err.message === 'FILE_TOO_LARGE') {
        toast.error('Fichier trop volumineux (max 500 Ko)')
      } else {
        toast.error('Impossible de téléverser le justificatif')
      }
    } finally {
      setUploading(false)
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Modifier la dépense' : 'Nouvelle dépense'}
      description={
        isEdit
          ? 'Mettez à jour les informations de la dépense'
          : "Enregistrez une dépense de l'auto-école"
      }
      size="md"
      footer={
        <>
          <ModalCancelButton onClick={handleCancel}>
            Annuler
          </ModalCancelButton>
          <ModalPrimaryButton onClick={handleSubmit} disabled={uploading}>
            {isEdit ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {isEdit ? 'Enregistrer' : 'Enregistrer la dépense'}
          </ModalPrimaryButton>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Catégorie" required>
            <FormSelect value={categorie} onChange={(e) => setCategorie(e.target.value as CategorieDepense)}>
              {catOpts.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </FormSelect>
          </Field>
          <Field label="Mode de paiement">
            <FormSelect value={modePaiement} onChange={(e) => setModePaiement(e.target.value as ModePaiement)}>
              {modeOpts.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </FormSelect>
          </Field>
        </div>

        <Field label="Description" required>
          <FormInput value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Plein Toyota Yaris" />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Montant (FCFA)" required>
            <FormInput
              type="number"
              min={0}
              value={montant}
              onChange={(e) => setMontant(Number(e.target.value))}
              placeholder="0"
            />
          </Field>
          <Field label="Date">
            <FormInput value={date} onChange={(e) => setDate(e.target.value)} placeholder="15 Nov 2026" />
          </Field>
        </div>

        <Field label="Véhicule associé">
          <FormSelect value={vehicule} onChange={(e) => setVehicule(e.target.value)}>
            <option value="—">— Aucun —</option>
            {vehiculesList.map((v) => (
              <option key={v.id} value={`${v.marque} ${v.modele} (${v.immatriculation})`}>
                {v.marque} {v.modele} ({v.immatriculation})
              </option>
            ))}
          </FormSelect>
        </Field>

        <Field label="Justificatif (photo, max 500 Ko)">
          <input
            type="file"
            accept="image/*,.pdf"
            disabled={uploading}
            className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary-foreground"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (!file) return
              void handleJustificatifUpload(file)
              e.target.value = ''
            }}
          />
          {uploading && (
            <p className="mt-1 text-xs text-muted-foreground">Téléversement en cours…</p>
          )}
          {justificatif && !uploading && (
            <p className="mt-1 text-xs text-success">Justificatif prêt à enregistrer</p>
          )}
        </Field>

        <div className="flex items-center justify-between rounded-lg bg-muted p-3">
          <span className="text-sm font-medium text-muted-foreground">Montant total</span>
          <span className="text-lg font-bold text-primary">{formatXOF(montant)}</span>
        </div>
      </div>
    </Modal>
  )
}
