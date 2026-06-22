'use client'

import { useState } from 'react'
import { UserPlus, Save } from 'lucide-react'
import { toast } from 'sonner'
import { Modal, ModalCancelButton, ModalPrimaryButton, Field, FormInput, FormSelect } from '@/components/dashboard/modal'
import { Switch } from '@/components/ui/switch'
import { useDataStore } from '@/store/data-store'
import { type Role } from '@/lib/domain/types'
import { DEMO_PASSWORD } from '@/lib/constants'
import { syncDataFromSupabase } from '@/lib/supabase/sync-data'

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
  profileId?: string | null
}

export function NouvelUtilisateurDialog({ open, onOpenChange, profileId = null }: Props) {
  const profiles = useDataStore((s) => s.profiles)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<Role>('Moniteur')
  const [actif, setActif] = useState(true)
  const [password, setPassword] = useState(DEMO_PASSWORD)

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
          setPassword('')
        }
      } else {
        setName('')
        setEmail('')
        setRole('Moniteur')
        setActif(true)
        setPassword(DEMO_PASSWORD)
      }
    }
  }

  const reset = () => {
    setName('')
    setEmail('')
    setRole('Moniteur')
    setActif(true)
    setPassword(DEMO_PASSWORD)
  }

  const handleCancel = () => {
    reset()
    onOpenChange(false)
  }

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim()) {
      toast.error("Veuillez renseigner le nom complet et l'email.")
      return
    }

    try {
      if (isEdit && profileId) {
        const res = await fetch('/api/admin/users', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: profileId,
            name: name.trim(),
            role,
            actif,
            password: password.trim() || undefined,
          }),
        })
        const json = await res.json()
        if (!res.ok) {
          toast.error(json.error ?? "Impossible de modifier l'utilisateur")
          return
        }
        await syncDataFromSupabase()
        toast.success(`Utilisateur ${name} modifié avec succès.`)
      } else {
        const res = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password: password.trim() || DEMO_PASSWORD,
            name: name.trim(),
            role,
            actif,
          }),
        })
        const json = await res.json()
        if (!res.ok) {
          toast.error(json.error ?? "Impossible de créer l'utilisateur")
          return
        }
        await syncDataFromSupabase()
        toast.success(`Utilisateur ${name} créé avec succès.`)
      }

      reset()
      onOpenChange(false)
    } catch {
      toast.error('Erreur réseau — vérifiez votre connexion.')
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Modifier l'utilisateur" : 'Ajouter un utilisateur'}
      description={
        isEdit
          ? "Mettez à jour les informations du membre de l'équipe"
          : 'Invitez un nouveau membre dans votre équipe SARAH AUTO'
      }
      size="md"
      footer={
        <>
          <ModalCancelButton onClick={handleCancel}>
            Annuler
          </ModalCancelButton>
          <ModalPrimaryButton onClick={handleSubmit}>
            {isEdit ? <Save className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
            {isEdit ? 'Enregistrer' : "Créer l'utilisateur"}
          </ModalPrimaryButton>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Nom complet" required>
          <FormInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Aïcha Diallo" />
        </Field>

        <Field label="Email" required>
          <FormInput
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            readOnly={isEdit}
            disabled={isEdit}
            placeholder="a.diallo@sarahauto.ci"
          />
        </Field>

        <Field label={isEdit ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe'}>
          <FormInput
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isEdit ? 'Laisser vide pour ne pas changer' : DEMO_PASSWORD}
          />
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
