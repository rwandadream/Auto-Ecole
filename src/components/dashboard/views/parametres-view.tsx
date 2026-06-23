'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Plus,
  Mail,
  Phone,
  MapPin,
  Building2,
  Pencil,
  MoreHorizontal,
  UserPlus,
  Trash2,
  Save,
  User,
  Users,
  BookOpen,
  HelpCircle,
  ScrollText,
} from 'lucide-react'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ViewHeader,
  StatusBadge,
  ActionButton,
  Card,
  formatXOF,
  initials,
  getRoleBadgeTone,
} from './shared'
import {
  ResponsiveDataView,
  MobileListCard,
  MobileListCardRow,
} from '@/components/dashboard/responsive-data-view'
import { Modal, ModalCancelButton, ModalPrimaryButton, Field as ModalField, FormInput, FormSelect } from '@/components/dashboard/modal'
import { Switch } from '@/components/ui/switch'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import { useDataStore } from '@/store/data-store'
import { useAuthStore } from '@/store/auth-store'
import { useNavStore, type ParametresTab } from '@/store/nav-store'
import { type Role } from '@/lib/domain/types'
import {
  canPerformAction,
  canAccessParametresTab,
  getParametresTabsForRole,
} from '@/lib/permissions'
import { syncDataFromSupabase } from '@/lib/supabase/sync-data'
import { NouvelUtilisateurDialog } from '@/components/dashboard/dialogs/nouvel-utilisateur-dialog'
import { FormationDialog } from '@/components/dashboard/dialogs/formation-dialog'
import { PermisDialog } from '@/components/dashboard/dialogs/permis-dialog'
import { MediaMigrationPanel } from '@/components/dashboard/views/media-migration-panel'
import { AssistancePanel } from '@/components/dashboard/views/assistance-view'
import { AuditLogPanel } from '@/components/dashboard/views/audit-log-view'

const ROLES: Role[] = [
  'Directeur',
  'Responsable adjoint',
  'Comptable',
  'Moniteur',
  'Secrétaire',
]

const PARAMETRES_TAB_META: Record<
  ParametresTab,
  { label: string; icon: React.ComponentType<{ className?: string }>; section?: string }
> = {
  profil: { label: 'Mon profil', icon: User, section: 'Compte' },
  equipe: { label: 'Équipe', icon: Users, section: 'Administration' },
  catalogue: { label: 'Catalogue', icon: BookOpen, section: 'Administration' },
  assistance: { label: 'Assistance', icon: HelpCircle, section: 'Support' },
  audit: { label: "Journal d'audit", icon: ScrollText, section: 'Sécurité' },
}

function ReadOnlyField({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon?: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <div className="flex h-10 items-center gap-2.5 rounded-lg border border-input bg-muted/40 px-3 text-sm text-foreground">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        <span className="font-medium">{value}</span>
      </div>
    </div>
  )
}

/**
 * Inline dialog for editing "Mon profil" — current admin user.
 * Updates name via PATCH /api/admin/users (Auth + profiles).
 */
function ProfileEditDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const user = useAuthStore((s) => s.user)
  const profiles = useDataStore((s) => s.profiles)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<Role>('Directeur')
  const [actif, setActif] = useState(true)
  const [saving, setSaving] = useState(false)

  // Seed from auth user when dialog opens
  const [prevOpen, setPrevOpen] = useState(false)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open && user && user.mode === 'admin') {
      setName(user.name)
      setEmail(user.email)
      setRole((user.role as Role) || 'Directeur')
      const profile = profiles.find((p) => p.id === user.id)
      setActif(profile?.actif ?? true)
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  const handleSubmit = async () => {
    if (!name.trim() || !user || user.mode !== 'admin') {
      toast.error('Veuillez renseigner le nom.')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          name: name.trim(),
          role: user.role,
          actif: true,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error ?? 'Impossible de mettre à jour le profil')
        return
      }
      await syncDataFromSupabase()
      useAuthStore.setState((state) => ({
        user:
          state.user?.mode === 'admin'
            ? { ...state.user, name: name.trim() }
            : state.user,
      }))
      toast.success('Votre profil a été mis à jour.')
      onOpenChange(false)
    } catch {
      toast.error('Erreur réseau lors de la mise à jour du profil')
    } finally {
      setSaving(false)
    }
  }

  if (!user || user.mode !== 'admin') return null

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Modifier mon profil"
      description="Mettez à jour vos informations personnelles"
      size="md"
      footer={
        <>
          <ModalCancelButton onClick={handleCancel}>
            Annuler
          </ModalCancelButton>
          <ModalPrimaryButton onClick={handleSubmit} disabled={saving}>
            <Save className="h-4 w-4" />
            Enregistrer
          </ModalPrimaryButton>
        </>
      }
    >
      <div className="space-y-4">
        <ModalField label="Nom complet">
          <FormInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Votre nom" />
        </ModalField>
        <ModalField label="Email">
          <FormInput type="email" value={email} readOnly disabled placeholder="vous@sarahauto.ci" />
        </ModalField>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ModalField label="Rôle">
            <FormSelect value={role} onChange={(e) => setRole(e.target.value as Role)} disabled>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </FormSelect>
          </ModalField>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Statut</label>
            <div className="flex h-10 items-center gap-3 rounded-lg border border-input bg-background px-3">
              <Switch checked={actif} disabled />
              <span className="text-sm font-medium text-foreground">
                {actif ? 'Actif' : 'Inactif'}
              </span>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Le rôle est défini par l'administrateur principal et ne peut pas être modifié depuis ce formulaire.
        </p>
      </div>
    </Modal>
  )
}

export function ParametresView() {
  const profiles = useDataStore((s) => s.profiles)
  const permis = useDataStore((s) => s.permis)
  const formations = useDataStore((s) => s.formations)
  const deleteFormation = useDataStore((s) => s.deleteFormation)
  const deletePermis = useDataStore((s) => s.deletePermis)

  const user = useAuthStore((s) => s.user)
  const role = user?.mode === 'admin' ? user.role : ''
  const canManageUsers = canPerformAction(role, 'manage_users')
  const canManageFormations = canPerformAction(role, 'manage_formations')

  const parametresTab = useNavStore((s) => s.parametresTab)

  const visibleTabs = useMemo(
    () => getParametresTabsForRole(role).filter((tab) => canAccessParametresTab(role, tab)),
    [role],
  )

  useEffect(() => {
    if (visibleTabs.length === 0) return
    if (!visibleTabs.includes(parametresTab)) {
      useNavStore.getState().setParametresTab(visibleTabs[0])
    }
  }, [visibleTabs, parametresTab])

  // Dialog state
  const [showProfileEdit, setShowProfileEdit] = useState(false)
  const [showUserDialog, setShowUserDialog] = useState(false)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)

  const [showFormationDialog, setShowFormationDialog] = useState(false)
  const [editingFormationId, setEditingFormationId] = useState<string | null>(null)
  const [deletingFormationId, setDeletingFormationId] = useState<string | null>(null)

  const [showPermisDialog, setShowPermisDialog] = useState(false)
  const [editingPermisId, setEditingPermisId] = useState<string | null>(null)
  const [deletingPermisId, setDeletingPermisId] = useState<string | null>(null)

  // Current user info for "Mon profil" tab
  const userName = user?.mode === 'admin' ? user.name : 'Utilisateur'
  const userEmail = user?.mode === 'admin' ? user.email : '—'
  const userRole = user?.mode === 'admin' ? user.role : '—'
  const userInitials = initials(userName || 'U')

  // Handlers
  const handleConfirmDeleteUser = async () => {
    if (!deletingUserId) return
    if (user?.mode === 'admin' && user.id === deletingUserId) {
      toast.error('Vous ne pouvez pas supprimer votre propre compte.')
      setDeletingUserId(null)
      return
    }
    const target = profiles.find((p) => p.id === deletingUserId)
    try {
      const res = await fetch(`/api/admin/users?id=${encodeURIComponent(deletingUserId)}`, {
        method: 'DELETE',
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error ?? "Impossible de supprimer l'utilisateur")
        return
      }
      await syncDataFromSupabase()
      toast.success(`Utilisateur ${target?.name ?? ''} supprimé de l'équipe.`)
    } catch {
      toast.error('Erreur réseau lors de la suppression utilisateur')
    } finally {
      setDeletingUserId(null)
    }
  }

  const handleConfirmDeleteFormation = () => {
    if (!deletingFormationId) return
    const target = formations.find((f) => f.id === deletingFormationId)
    deleteFormation(deletingFormationId)
    toast.success(`Formation "${target?.nom ?? ''}" supprimée du catalogue.`)
    setDeletingFormationId(null)
  }

  const handleConfirmDeletePermis = () => {
    if (!deletingPermisId) return
    const target = permis.find((p) => p.id === deletingPermisId)
    deletePermis(deletingPermisId)
    toast.success(`Permis ${target?.code ?? ''} supprimé du catalogue.`)
    setDeletingPermisId(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <ViewHeader
        title="Paramètres"
        description="Configuration de l'ERP et gestion de l'équipe"
      />

      <Tabs
        value={parametresTab}
        onValueChange={(v) => useNavStore.getState().setParametresTab(v as ParametresTab)}
        className="flex flex-col gap-6"
      >
        <div className="overflow-x-auto">
          <TabsList className="inline-flex h-auto w-auto items-center gap-1 rounded-xl bg-muted p-1">
            {visibleTabs.map((tab) => {
              const meta = PARAMETRES_TAB_META[tab]
              const Icon = meta.icon
              return (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-all text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline">{meta.label}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>
        </div>

        <TabsContent value="profil" className="mt-0">
          <Card>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              {/* Avatar */}
              <div className="flex flex-col items-center gap-3 sm:w-48">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-3xl font-bold text-primary">
                  {userInitials}
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-foreground">{userName}</p>
                  <p className="text-xs text-muted-foreground">{userEmail}</p>
                </div>
                <StatusBadge label={userRole} tone="primary" />
              </div>

              {/* Form */}
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <ReadOnlyField label="Nom complet" value={userName} />
                  <ReadOnlyField label="Email" value={userEmail} icon={<Mail className="h-4 w-4" />} />
                  <ReadOnlyField label="Rôle" value={userRole} />
                  <ReadOnlyField label="Téléphone" value="+225 07 00 00 00" icon={<Phone className="h-4 w-4" />} />
                  <ReadOnlyField label="Auto-école" value="SARAH AUTO" icon={<Building2 className="h-4 w-4" />} />
                  <ReadOnlyField
                    label="Adresse"
                    value="Cocody, Abidjan, Côte d'Ivoire"
                    icon={<MapPin className="h-4 w-4" />}
                  />
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
                  <ActionButton variant="primary" onClick={() => setShowProfileEdit(true)}>
                    <Pencil className="h-4 w-4" />
                    Modifier
                  </ActionButton>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* -------- Tab 2 : Équipe -------- */}
        <TabsContent value="equipe" className="mt-0">
          <Card className="p-0">
            <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-foreground">Utilisateurs de l'équipe</h2>
                <p className="text-sm text-muted-foreground">
                  {profiles.length} membres — {profiles.filter((p) => p.actif).length} actifs
                </p>
              </div>
              {canManageUsers && (
                <ActionButton variant="primary" onClick={() => { setEditingUserId(null); setShowUserDialog(true) }}>
                  <UserPlus className="h-4 w-4" />
                  Ajouter un utilisateur
                </ActionButton>
              )}
            </div>

            <ResponsiveDataView
              empty={profiles.length === 0}
              emptyState={
                <p className="p-6 text-center text-sm text-muted-foreground">Aucun utilisateur enregistré.</p>
              }
              mobile={profiles.map((p) => (
                <MobileListCard key={p.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {initials(p.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">{p.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{p.email}</p>
                      </div>
                    </div>
                    {canManageUsers && p.role !== 'Super Administrateur' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            aria-label="Actions"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem onClick={() => { setEditingUserId(p.id); setShowUserDialog(true) }}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeletingUserId(p.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                  <div className="mt-3 space-y-2">
                    <MobileListCardRow label="Rôle">
                      <StatusBadge label={p.role} tone={getRoleBadgeTone(p.role)} />
                    </MobileListCardRow>
                    <MobileListCardRow label="Statut">
                      <StatusBadge label={p.actif ? 'Actif' : 'Inactif'} tone={p.actif ? 'success' : 'neutral'} />
                    </MobileListCardRow>
                  </div>
                </MobileListCard>
              ))}
              desktop={
            <div className="custom-scrollbar overflow-x-auto">
              <table className="w-full min-w-[800px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Utilisateur</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Rôle</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Statut</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {profiles.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/40">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            {initials(p.name)}
                          </div>
                          <span className="text-sm font-medium text-foreground">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{p.email}</td>
                      <td className="px-4 py-3">
                        <StatusBadge label={p.role} tone={getRoleBadgeTone(p.role)} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge
                          label={p.actif ? 'Actif' : 'Inactif'}
                          tone={p.actif ? 'success' : 'neutral'}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end">
                          {canManageUsers && p.role !== 'Super Administrateur' ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                  aria-label="Actions"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-44">
                                <DropdownMenuItem
                                  onClick={() => { setEditingUserId(p.id); setShowUserDialog(true) }}
                                >
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Modifier
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => setDeletingUserId(p.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Supprimer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              {p.role === 'Super Administrateur' ? '🛡' : '—'}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
              }
            />
          </Card>
        </TabsContent>

        {/* -------- Tab 3 : Catalogue -------- */}
        <TabsContent value="catalogue" className="mt-0">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            {/* Types de permis */}
            <Card className="xl:col-span-1">
              <div className="mb-4 flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-base font-semibold text-foreground">Types de permis</h2>
                  <p className="text-sm text-muted-foreground">{permis.length} types disponibles</p>
                </div>
                <ActionButton
                  variant="primary"
                  onClick={() => { setEditingPermisId(null); setShowPermisDialog(true) }}
                >
                  <Plus className="h-4 w-4" />
                  Nouveau
                </ActionButton>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {permis.map((p) => (
                  <div
                    key={p.id}
                    className="group relative flex flex-col items-start gap-2 rounded-lg border border-border bg-background p-3"
                  >
                    <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-md bg-primary/10 px-2 text-base font-bold text-primary">
                      {p.code}
                    </span>
                    <span className="text-sm font-medium text-foreground">{p.libelle}</span>
                    <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => { setEditingPermisId(p.id); setShowPermisDialog(true) }}
                        className="flex h-7 w-7 items-center justify-center rounded-md bg-background text-muted-foreground shadow-sm border border-border hover:bg-muted hover:text-foreground"
                        title="Modifier"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingPermisId(p.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-md bg-background text-destructive shadow-sm border border-border hover:bg-destructive/10"
                        title="Supprimer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Formations */}
            <Card className="p-0 xl:col-span-2">
              <div className="flex items-center justify-between border-b border-border p-4">
                <div>
                  <h2 className="text-base font-semibold text-foreground">Formations</h2>
                  <p className="text-sm text-muted-foreground">Catalogue des packs proposés</p>
                </div>
                {canManageFormations && (
                  <ActionButton
                    variant="primary"
                    onClick={() => { setEditingFormationId(null); setShowFormationDialog(true) }}
                  >
                    <Plus className="h-4 w-4" />
                    Nouvelle formation
                  </ActionButton>
                )}
              </div>

              <ResponsiveDataView
                empty={formations.length === 0}
                emptyState={
                  <p className="p-6 text-center text-sm text-muted-foreground">Aucune formation enregistrée.</p>
                }
                mobile={formations.map((f) => (
                  <MobileListCard key={f.id}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">{f.nom}</p>
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{f.description}</p>
                      </div>
                      <StatusBadge label={f.actif ? 'Actif' : 'Inactif'} tone={f.actif ? 'success' : 'neutral'} />
                    </div>
                    <div className="mt-3 space-y-2">
                      <MobileListCardRow label="Prix">
                        <span className="font-bold text-primary">{formatXOF(f.prix)}</span>
                      </MobileListCardRow>
                    </div>
                    {canManageFormations && (
                      <div className="mt-3 flex justify-end gap-1 border-t border-border pt-3">
                        <button
                          onClick={() => { setEditingFormationId(f.id); setShowFormationDialog(true) }}
                          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Modifier
                        </button>
                        <button
                          onClick={() => setDeletingFormationId(f.id)}
                          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Supprimer
                        </button>
                      </div>
                    )}
                  </MobileListCard>
                ))}
                desktop={
              <div className="custom-scrollbar overflow-x-auto">
                <table className="w-full min-w-[600px] text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Formation</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Prix</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Statut</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {formations.map((f) => (
                      <tr key={f.id} className="hover:bg-muted/40">
                        <td className="px-4 py-3 text-sm font-semibold text-foreground">{f.nom}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{f.description}</td>
                        <td className="px-4 py-3 text-right text-sm font-bold text-primary">
                          {formatXOF(f.prix)}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge
                            label={f.actif ? 'Actif' : 'Inactif'}
                            tone={f.actif ? 'success' : 'neutral'}
                          />
                        </td>
                        <td className="px-4 py-3">
                          {canManageFormations ? (
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => { setEditingFormationId(f.id); setShowFormationDialog(true) }}
                                className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                title="Modifier"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setDeletingFormationId(f.id)}
                                className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                                title="Supprimer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <span className="block text-right text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
                }
              />
            </Card>
          </div>
          {canManageUsers && <MediaMigrationPanel />}
        </TabsContent>

        <TabsContent value="assistance" className="mt-0">
          <AssistancePanel />
        </TabsContent>

        <TabsContent value="audit" className="mt-0">
          <AuditLogPanel />
        </TabsContent>
      </Tabs>

      {/* -------- Dialogs -------- */}
      <ProfileEditDialog open={showProfileEdit} onOpenChange={setShowProfileEdit} />

      <NouvelUtilisateurDialog
        open={showUserDialog}
        onOpenChange={(v) => { setShowUserDialog(v); if (!v) setEditingUserId(null) }}
        profileId={editingUserId}
      />

      <FormationDialog
        open={showFormationDialog}
        onOpenChange={(v) => { setShowFormationDialog(v); if (!v) setEditingFormationId(null) }}
        formationId={editingFormationId}
      />

      <PermisDialog
        open={showPermisDialog}
        onOpenChange={(v) => { setShowPermisDialog(v); if (!v) setEditingPermisId(null) }}
        permisId={editingPermisId}
      />

      {/* Delete confirmations */}
      <AlertDialog open={!!deletingUserId} onOpenChange={(v) => { if (!v) setDeletingUserId(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'utilisateur ?</AlertDialogTitle>
            <AlertDialogDescription>
              {(() => {
                const t = profiles.find((p) => p.id === deletingUserId)
                return t ? (
                  <>
                    Vous êtes sur le point de supprimer <strong>{t.name}</strong> ({t.email}) de l'équipe.
                    Cette action est irréversible et sera tracée dans le journal d'audit.
                  </>
                ) : 'Cette action est irréversible.'
              })()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeleteUser}
              variant="destructive"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deletingFormationId} onOpenChange={(v) => { if (!v) setDeletingFormationId(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la formation ?</AlertDialogTitle>
            <AlertDialogDescription>
              {(() => {
                const t = formations.find((f) => f.id === deletingFormationId)
                return t ? (
                  <>
                    Vous êtes sur le point de supprimer la formation <strong>{t.nom}</strong>.
                    Cette action est irréversible.
                  </>
                ) : 'Cette action est irréversible.'
              })()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeleteFormation}
              variant="destructive"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deletingPermisId} onOpenChange={(v) => { if (!v) setDeletingPermisId(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le permis ?</AlertDialogTitle>
            <AlertDialogDescription>
              {(() => {
                const t = permis.find((p) => p.id === deletingPermisId)
                return t ? (
                  <>
                    Vous êtes sur le point de supprimer le permis <strong>{t.code} — {t.libelle}</strong>.
                    Cette action est irréversible.
                  </>
                ) : 'Cette action est irréversible.'
              })()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeletePermis}
              variant="destructive"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
