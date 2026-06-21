'use client'

import { useState } from 'react'
import {
  Camera,
  Pencil,
  User as UserIcon,
  Phone,
  Mail,
  CreditCard,
  Calendar,
  MapPin,
  Flag,
  IdCard,
  Car,
  Check,
  X,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth-store'
import { useDataStore } from '@/store/data-store'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  ViewHeader,
  Card,
  StatusBadge,
  initials,
} from './shared'

// Statut → badge tone
const statutTone: Record<string, 'slate' | 'sky' | 'primary' | 'amber' | 'emerald' | 'rose'> = {
  Prospect: 'slate',
  Inscrit: 'sky',
  'En formation': 'primary',
  Examen: 'amber',
  Admis: 'emerald',
  Ajourné: 'rose',
  Terminé: 'emerald',
  Abandon: 'slate',
}

const moisLong = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
]

function formatDateNaissance(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso
  const d = new Date(iso + 'T00:00:00')
  return `${d.getDate()} ${moisLong[d.getMonth()]} ${d.getFullYear()}`
}

type FieldKey =
  | 'telephone'
  | 'email'
  | 'nationalite'

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border p-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <div className="mt-0.5 text-sm font-semibold text-foreground break-words">
          {value}
        </div>
      </div>
    </div>
  )
}

function EditableRow({
  icon,
  label,
  value,
  onChange,
}: {
  icon: React.ReactNode
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border p-3">
      <div className="mt-1.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>
    </div>
  )
}

export function StudentProfilView() {
  const user = useAuthStore((s) => s.user)
  const eleves = useDataStore((s) => s.eleves)
  const updateEleve = useDataStore((s) => s.updateEleve)
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState<{ telephone: string; email: string; nationalite: string }>({
    telephone: '',
    email: '',
    nationalite: '',
  })

  if (!user || user.mode !== 'eleve') return null

  const me = eleves.find((e) => e.code === user.code)

  // Initialize form when entering edit mode (only once per toggle)
  const startEdit = () => {
    setForm({
      telephone: me?.telephone ?? user.telephone,
      email: me?.email ?? user.email,
      nationalite: me?.nationalite ?? '',
    })
    setEditMode(true)
  }

  const handleSave = () => {
    if (!me) return
    updateEleve(me.id, {
      telephone: form.telephone,
      email: form.email,
      nationalite: form.nationalite,
    })
    toast.success('Profil mis à jour')
    setEditMode(false)
  }

  const statutBadgeTone = me
    ? statutTone[me.statut] ?? 'slate'
    : 'slate'

  return (
    <>
      <ViewHeader
        title="Mon Profil"
        description="Vos informations personnelles"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile card (avatar + identity summary) */}
        <Card className="lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                {initials(user.nomComplet)}
              </div>
              <button
                className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                aria-label="Changer la photo"
                title="Changer la photo"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>

            <h2 className="mt-4 text-lg font-bold text-foreground">
              {user.nomComplet}
            </h2>
            <p className="font-mono text-xs text-muted-foreground">{user.code}</p>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <StatusBadge label={user.statut} tone={statutBadgeTone} />
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                <Car className="h-3 w-3" />
                Permis {user.typePermis}
              </span>
            </div>

            {/* Quick stats */}
            <div className="mt-5 grid w-full grid-cols-2 gap-2">
              <div className="rounded-lg bg-muted/60 p-2.5 text-center">
                <p className="text-xs text-muted-foreground">Séances</p>
                <p className="text-sm font-bold text-foreground">
                  {me?.seancesFaites ?? 0}/{me?.seancesTotales ?? 0}
                </p>
              </div>
              <div className="rounded-lg bg-muted/60 p-2.5 text-center">
                <p className="text-xs text-muted-foreground">Inscrit le</p>
                <p className="text-sm font-bold text-foreground">
                  {me?.dateInscription ?? '—'}
                </p>
              </div>
            </div>

            <button
              onClick={editMode ? () => setEditMode(false) : startEdit}
              className={cn(
                'mt-5 flex h-9 w-full items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors',
                editMode
                  ? 'border border-input bg-background text-foreground hover:bg-muted'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              )}
            >
              {editMode ? (
                <>
                  <X className="h-4 w-4" />
                  Annuler
                </>
              ) : (
                <>
                  <Pencil className="h-4 w-4" />
                  Modifier mes informations
                </>
              )}
            </button>
          </div>
        </Card>

        {/* Info grid */}
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground">
              Informations {editMode ? '— modification' : 'personnelles'}
            </h2>
            {editMode && (
              <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-600">
                Mode édition
              </span>
            )}
          </div>

          {editMode ? (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <EditableRow
                  icon={<Phone className="h-4 w-4" />}
                  label="Téléphone"
                  value={form.telephone}
                  onChange={(v) => setForm((s) => ({ ...s, telephone: v }))}
                />
                <EditableRow
                  icon={<Mail className="h-4 w-4" />}
                  label="Email"
                  value={form.email}
                  onChange={(v) => setForm((s) => ({ ...s, email: v }))}
                />
                <EditableRow
                  icon={<Flag className="h-4 w-4" />}
                  label="Nationalité"
                  value={form.nationalite}
                  onChange={(v) => setForm((s) => ({ ...s, nationalite: v }))}
                />
                <div className="flex items-start gap-3 rounded-lg border border-border p-3 opacity-70">
                  <div className="mt-1.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <UserIcon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Nom complet
                    </p>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {user.nomComplet}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Non modifiable
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={handleSave}
                className="mt-4 flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto sm:px-4"
              >
                <Check className="h-4 w-4" />
                Enregistrer les modifications
              </button>
            </>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <InfoRow
                icon={<UserIcon className="h-4 w-4" />}
                label="Nom complet"
                value={user.nomComplet}
              />
              <InfoRow
                icon={<IdCard className="h-4 w-4" />}
                label="Code dossier"
                value={<span className="font-mono">{user.code}</span>}
              />
              <InfoRow
                icon={<Phone className="h-4 w-4" />}
                label="Téléphone"
                value={me?.telephone ?? user.telephone}
              />
              <InfoRow
                icon={<Mail className="h-4 w-4" />}
                label="Email"
                value={me?.email ?? user.email}
              />
              <InfoRow
                icon={<Car className="h-4 w-4" />}
                label="Type de permis"
                value={`Permis ${user.typePermis}`}
              />
              <InfoRow
                icon={<Check className="h-4 w-4" />}
                label="Statut"
                value={<StatusBadge label={user.statut} tone={statutBadgeTone} />}
              />
              <InfoRow
                icon={<Calendar className="h-4 w-4" />}
                label="Date de naissance"
                value={me ? formatDateNaissance(me.dateNaissance) : '—'}
              />
              <InfoRow
                icon={<MapPin className="h-4 w-4" />}
                label="Lieu de naissance"
                value={me?.lieuNaissance ?? '—'}
              />
              <InfoRow
                icon={<Flag className="h-4 w-4" />}
                label="Nationalité"
                value={me?.nationalite ?? '—'}
              />
              <InfoRow
                icon={<CreditCard className="h-4 w-4" />}
                label="Pièce d'identité"
                value={
                  me ? (
                    <span>
                      <span className="font-medium">{me.typePiece}</span>{' '}
                      <span className="font-mono text-muted-foreground">{me.numPiece}</span>
                    </span>
                  ) : (
                    '—'
                  )
                }
              />
            </div>
          )}
        </Card>
      </div>
    </>
  )
}
