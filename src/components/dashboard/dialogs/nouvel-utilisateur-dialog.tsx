'use client'

import { useState } from 'react'
import { UserPlus, Save } from 'lucide-react'
import { toast } from 'sonner'
import { Modal, Field, FormInput, FormSelect } from '@/components/dashboard/modal'
import { Switch } from '@/components/ui/switch'
import { useDataStore } from '@/store/data-store'
import { type Role } from '@/lib/mock-data'

const ROLES: Role[] = [
  'Administrateur principal',
  'Administrateur secondaire',
  'Comptable',
  'Moniteur',
  'Conseiller',
]

type Props = {
  open: boolean
  onOpenChange: (v: boolean) => void
  /** When provided, dialog runs in edit mode (pre-fill + updateProfile). Otherwise create mode. */
  profileId?: string | null
}

export function NouvelUtilisateurDialog({ open, onOpenChange, profileId = null }: Props) {
  const addProfile = useDataStore((s) => s.addProfile)
  const updateProfile = useDataStore((s) => s.updateProfile)
  const profiles = useDataStore((s) => s.profiles)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<Role>('Moniteur')
  const [actif, setActif] = useState(true)

  const isEdit = !!profileId

  const [prevOpen, setPrevOpen] = useState(false)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      if (profileId) {
        const target = profiles.find((p) => p.id === profileId)
        if (target) {
          setName(target.name)
          setEmail(target.email)
          setRole(target.role)
          setActif(target.actif)
        }
      } else {
        setName('')
        setEmail('')
        setRole('Moniteur')
        setActif(true)
      }
    }
  }

  const reset = () => {
    setName('')
    setEmail('')
    setRole('Moniteur')
    setActif(true)
  }

  const handleCancel = () => {
    reset()
    onOpenChange(false)
  }

  const handleSubmit = () => {
    if (!name.trim() || !email.trim()) {
      toast.error('Veuillez renseigner le nom complet et l\'email.')
      return
    }
    const payload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      actif,
    }
    if (isEdit && profileId) {
      updateProfile(profileId, payload)
      toast.success(`Utilisateur ${name} modifié avec succès.`)
    } else {
      addProfile(payload)
      toast.success(`Utilisateur ${name} ajouté à l'équipe.`)
    }
    reset()
    onOpenChange(false)
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Modifier l'utilisateur" : 'Ajouter un utilisateur'}
      description={
        isEdit
          ? 'Mettez à jour les informations du membre de l\'équipe'
          : 'Invitez un nouveau membre dans votre équipe SARAH AUTO'
      }
      size="md"
      footer={
        <>
          <button
            onClick={handleCancel}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-input bg-background px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {isEdit ? <Save className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
            {isEdit ? 'Enregistrer' : "Créer l'utilisateur"}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Nom complet" required>
          <FormInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Aïcha Diallo" />
        </Field>

        <Field label="Email" required>
          <FormInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="a.diallo@sarahauto.ci" />
        </Field>

        <Field label="Rôle" required>
          <FormSelect value={role} onChange={(e) => setRole(e.target.value as Role)}>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </FormSelect>
        </Field>

        <Field label="Statut">
          <div className="flex h-10 items-center gap-3 rounded-lg border border-input bg-background px-3">
            <Switch checked={actif} onCheckedChange={setActif} />
            <span className="text-sm font-medium text-foreground">
              {actif ? 'Actif' : 'Inactif'}
            </span>
            <span className="ml-auto text-xs text-muted-foreground">
              {actif ? "L'utilisateur peut se connecter" : 'Accès suspendu'}
            </span>
          </div>
        </Field>
      </div>
    </Modal>
  )
}
